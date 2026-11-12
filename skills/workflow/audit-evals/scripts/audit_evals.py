#!/usr/bin/env python3
"""Count a regression suite's cell history and apply approved demotions.

  audit_evals.py report <cell-history.json> [--min-trials 10] [--json]
  audit_evals.py apply  <cell-history.json> <unit> [<unit> ...]

A unit is `suite/case/check`, `suite/*/check` (a whole check), or
`suite/case/*` (a whole case). Exit codes: 0 done, 2 invalid input or a
refused unit, 3 no cell history at the path.

The history file, version 1:

  {"version": 1, "suites": {"<suite>": {
     "reps": 2, "last_run_model": "<model>", "lower_tier_model": "<model>" | null,
     "checks": {"<check>": {"grader": "code" | "judge", "judge_call": "<id>"}},
     "cells": {"<case>": {"<check>": {"tier": "upper" | "lower",
        "baseline": "pass" | "fail" | null, "trials": 10, "passes": 10}}}}}}

`judge_call` names the judge call a check is scored in; checks sharing one id
are scored together. Without it a judged check has its own call.
"""
import argparse
import json
import sys
from pathlib import Path

DEFAULT_MIN_TRIALS = 10


class Invalid(Exception):
    pass


def load(path):
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text())
    except json.JSONDecodeError as error:
        raise Invalid(f"{path}: not JSON ({error})")
    if data.get("version") != 1 or not isinstance(data.get("suites"), dict):
        raise Invalid(f"{path}: expected version 1 with a suites object")
    for suite, body in data["suites"].items():
        if "/" in suite:
            raise Invalid(f"suite name {suite!r} contains '/'")
        reps = body.get("reps")
        if not isinstance(reps, int) or reps < 1:
            raise Invalid(f"{suite}: reps must be a positive integer")
        checks = body.get("checks")
        cells = body.get("cells")
        if not isinstance(checks, dict) or not isinstance(cells, dict):
            raise Invalid(f"{suite}: needs checks and cells objects")
        for check, meta in checks.items():
            if "/" in check or meta.get("grader") not in ("code", "judge"):
                raise Invalid(f"{suite}/{check}: grader must be code or judge")
        for case, row in cells.items():
            if "/" in case:
                raise Invalid(f"case name {case!r} in {suite} contains '/'")
            for check, c in row.items():
                where = f"{suite}/{case}/{check}"
                if check not in checks:
                    raise Invalid(f"{where}: check {check} is missing from {suite}.checks")
                if c.get("tier") not in ("upper", "lower"):
                    raise Invalid(f"{where}: tier must be upper or lower")
                t, p = c.get("trials"), c.get("passes")
                if not (isinstance(t, int) and isinstance(p, int) and 0 <= p <= t):
                    raise Invalid(f"{where}: needs integer trials >= passes >= 0")
    return data


def all_cells(data):
    for suite in sorted(data["suites"]):
        body = data["suites"][suite]
        for case in sorted(body["cells"]):
            for check in sorted(body["cells"][case]):
                yield suite, case, check, body["cells"][case][check]


def judge_call(body, check):
    meta = body["checks"][check]
    if meta["grader"] != "judge":
        return None
    return meta.get("judge_call", check)


def savings(data, chosen):
    """Runs and judge calls one upper-tier run no longer makes once `chosen` cells leave it."""
    runs = calls = 0
    for suite, body in data["suites"].items():
        for case, row in body["cells"].items():
            upper = {k for k, c in row.items() if c["tier"] == "upper"}
            if not upper:
                continue
            if all((suite, case, k) in chosen for k in upper):
                runs += body["reps"]
            groups = {}
            for k in upper:
                g = judge_call(body, k)
                if g is not None:
                    groups.setdefault(g, set()).add(k)
            for members in groups.values():
                if all((suite, case, k) in chosen for k in members):
                    calls += body["reps"]
    return runs, calls


def analyze(data, min_trials):
    never, short, flipping, failing = [], [], [], []
    for suite, case, check, c in all_cells(data):
        cid = (suite, case, check)
        t, p = c["trials"], c["passes"]
        if p == t:
            (never if t >= min_trials else short).append(cid)
        elif p == 0:
            failing.append(cid)
        else:
            flipping.append(cid)

    identical = []
    for suite in sorted(data["suites"]):
        body = data["suites"][suite]
        signatures = {}
        for check in sorted(body["checks"]):
            sig = tuple(sorted((case, row[check]["trials"], row[check]["passes"])
                               for case, row in body["cells"].items() if check in row))
            if sig and any(t for _, t, _ in sig):
                signatures.setdefault(sig, []).append(f"{suite}/{check}")
        identical += [group for group in signatures.values() if len(group) > 1]
    identical.sort()

    never_set = set(never)
    eligible = {cid for cid in never if cell_of(data, cid)["tier"] == "upper"}
    proposals, covered = [], set()

    def upper_cells(suite, case=None, check=None):
        body = data["suites"][suite]
        return {(suite, cs, k) for cs, row in body["cells"].items() for k, c in row.items()
                if c["tier"] == "upper" and (case is None or cs == case) and (check is None or k == check)}

    def propose(unit, cells):
        runs, calls = savings(data, cells)
        proposals.append({"unit": unit, "cells": len(cells), "runs_saved": runs, "judge_calls_saved": calls})
        covered.update(cells)

    for suite in sorted(data["suites"]):
        for check in sorted(data["suites"][suite]["checks"]):
            cells = upper_cells(suite, check=check)
            if cells and cells <= eligible:
                propose(f"{suite}/*/{check}", cells)
    for suite in sorted(data["suites"]):
        for case in sorted(data["suites"][suite]["cells"]):
            cells = upper_cells(suite, case=case)
            if cells and cells <= eligible and cells - covered:
                propose(f"{suite}/{case}/*", cells)
    for cid in sorted(eligible - covered):
        propose("/".join(cid), {cid})

    verification = []
    for suite in sorted(data["suites"]):
        body = data["suites"][suite]
        for check in sorted(body["checks"]):
            if body["checks"][check]["grader"] != "judge":
                continue
            cells = {(suite, cs, check) for cs, row in body["cells"].items() if check in row}
            if cells and cells <= never_set:
                verification.append(f"{suite}/{check}")

    ids = lambda cells: ["/".join(c) for c in cells]
    return {
        "min_trials": min_trials,
        "cells": sum(1 for _ in all_cells(data)),
        "never_failed": ids(never),
        "insufficient_history": ids(short),
        "identical_checks": identical,
        "flipping": ids(flipping),
        "always_failing": ids(failing),
        "proposals": proposals,
        "verification_candidates": verification,
    }


def cell_of(data, cid):
    suite, case, check = cid
    return data["suites"][suite]["cells"][case][check]


def compact(data, cids):
    """Write a set of cells with whole checks as suite/*/check and whole cases as suite/case/*."""
    chosen, lines, shown = set(cids), [], set()
    for suite in sorted(data["suites"]):
        body = data["suites"][suite]
        for check in sorted(body["checks"]):
            cells = {(suite, cs, check) for cs, row in body["cells"].items() if check in row}
            if len(cells) > 1 and cells <= chosen:
                lines.append(f"{suite}/*/{check} ({len(cells)} cells)")
                shown |= cells
        for case in sorted(body["cells"]):
            cells = {(suite, case, k) for k in body["cells"][case]}
            if len(cells) > 1 and cells <= chosen and cells - shown:
                lines.append(f"{suite}/{case}/* ({len(cells)} cells)")
                shown |= cells
    lines += ["/".join(c) for c in sorted(chosen - shown)]
    return lines


def markdown(data, result, path):
    split = lambda ids: [tuple(i.split("/")) for i in ids]
    out = [f"# Cell history audit: {path}", "",
           f"{result['cells']} cells; a cell needs {result['min_trials']} trials without a failure to count as never failed.", ""]

    def section(title, lines):
        out.append(f"## {title}")
        out.extend(f"- {line}" for line in lines) if lines else out.append("- none")
        out.append("")

    def counted(ids):
        return [f"{i} {cell_of(data, tuple(i.split('/')))['passes']}/{cell_of(data, tuple(i.split('/')))['trials']}"
                f" (baseline {cell_of(data, tuple(i.split('/'))).get('baseline') or 'unknown'})" for i in ids]

    section(f"Never failed ({len(result['never_failed'])})", compact(data, split(result["never_failed"])))
    section(f"Insufficient history ({len(result['insufficient_history'])})", counted(result["insufficient_history"]))
    section(f"Identical histories ({len(result['identical_checks'])})", [" = ".join(g) for g in result["identical_checks"]])
    section(f"Flipping ({len(result['flipping'])})", counted(result["flipping"]))
    section(f"Always failing ({len(result['always_failing'])})", counted(result["always_failing"]))
    section(f"Demotion proposals ({len(result['proposals'])})",
            [f"{p['unit']}: {p['cells']} upper cells; saves {p['runs_saved']} runs and {p['judge_calls_saved']} judge calls per suite run"
             for p in result["proposals"]])
    section(f"Judged checks that never failed ({len(result['verification_candidates'])})", result["verification_candidates"])
    return "\n".join(out)


def parse_unit(data, unit):
    parts = unit.split("/")
    if len(parts) != 3 or parts[0] not in data["suites"]:
        raise Invalid(f"{unit}: not suite/case/check, suite/*/check, or suite/case/*")
    suite, case, check = parts
    body = data["suites"][suite]
    if case != "*" and case not in body["cells"]:
        raise Invalid(f"{unit}: no case {case} in {suite}")
    if check != "*" and check not in body["checks"]:
        raise Invalid(f"{unit}: no check {check} in {suite}")
    return {(suite, cs, k) for cs, row in body["cells"].items() for k in row
            if (case == "*" or cs == case) and (check == "*" or k == check)}


def apply(data, units, min_trials):
    moves = set()
    for unit in units:
        cells = {c for c in parse_unit(data, unit) if cell_of(data, c)["tier"] == "upper"}
        if not cells:
            raise Invalid(f"{unit}: holds no upper-tier cell")
        blocked = sorted("/".join(c) for c in cells
                         if not (cell_of(data, c)["passes"] == cell_of(data, c)["trials"] >= min_trials))
        if blocked:
            raise Invalid(f"{unit}: not every upper cell is never failed over {min_trials} trials: {', '.join(blocked)}")
        moves |= cells
    for suite, case, check in sorted(moves):
        body = data["suites"][suite]
        body["cells"][case][check]["tier"] = "lower"
        if body.get("lower_tier_model") is None:
            body["lower_tier_model"] = body.get("last_run_model")
    return sorted("/".join(c) for c in moves)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)
    rep = sub.add_parser("report")
    rep.add_argument("history", type=Path)
    rep.add_argument("--min-trials", type=int, default=DEFAULT_MIN_TRIALS)
    rep.add_argument("--json", action="store_true")
    app = sub.add_parser("apply")
    app.add_argument("history", type=Path)
    app.add_argument("units", nargs="+")
    app.add_argument("--min-trials", type=int, default=DEFAULT_MIN_TRIALS)
    args = parser.parse_args(argv)

    try:
        data = load(args.history)
        if data is None:
            print(f"No cell history at {args.history}. Nothing can be judged until regression runs record one.")
            return 3
        if args.command == "report":
            result = analyze(data, args.min_trials)
            print(json.dumps(result, indent=2) if args.json else markdown(data, result, args.history))
            return 0
        moved = apply(data, args.units, args.min_trials)
        args.history.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
        print(f"Moved {len(moved)} cells to the lower tier:")
        print("\n".join(f"- {c}" for c in moved))
        return 0
    except Invalid as error:
        print(f"error: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
