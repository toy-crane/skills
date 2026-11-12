"""Build each fixture project's cell history from source/ as fixtures.json describes.

Run: python3 -I build_fixtures.py   (from this folder; rewrites fixtures/)
"""
import json
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = json.loads((HERE / "fixtures.json").read_text())
sources = {n: json.loads((HERE / "source" / f"{n}.json").read_text()) for n in ("a", "b")}

AGENTS = "# Agent instructions\n\nLLM evals live in `evals/`. The regression suite is `evals/regression/`.\n"
LOG = "# Regression log\n\nEach line records one graduated criterion.\n"


def suite_history(s):
    src = sources[s["source"]]
    lo, hi = s.get("cases", ["", "~"])
    lower = set(s.get("lower_checks", []))
    checks, cells = {}, {}
    for c in src["cells"]:
        if not c["graduated"] or not (lo <= c["case"] <= hi):
            continue
        letters = "".join(c["results"].get(r, "") for r in s["runs"])
        if c["grader"] == "judge":
            checks[c["check"]] = {"grader": "judge", "judge_call": "rubric" if s["judge_call"] == "shared" else c["check"]}
        else:
            checks[c["check"]] = {"grader": "code"}
        cells.setdefault(c["case"], {})[c["check"]] = {
            "tier": "lower" if c["check"] in lower else "upper",
            "baseline": None,
            "trials": letters.count("p") + letters.count("f"),
            "passes": letters.count("p"),
        }
    return {"reps": 2, "last_run_model": "model-x", "lower_tier_model": "model-x" if lower else None,
            "checks": dict(sorted(checks.items())), "cells": cells}


def write_history(path, history):
    # One case per line keeps the file readable and its diffs small.
    lines = ['{"version": 1, "suites": {']
    for i, (name, body) in enumerate(history.items()):
        head = {k: body[k] for k in ("reps", "last_run_model", "lower_tier_model", "checks")}
        lines.append(f'  {json.dumps(name)}: {json.dumps(head)[:-1]}, "cells": {{')
        rows = [f'    {json.dumps(case)}: {json.dumps(row, separators=(",", ":"))}' for case, row in body["cells"].items()]
        lines.append(",\n".join(rows))
        lines.append("  }}" + ("," if i < len(history) - 1 else ""))
    lines.append("}}")
    path.write_text("\n".join(lines) + "\n")
    json.loads(path.read_text())


out = HERE / "fixtures"
shutil.rmtree(out, ignore_errors=True)
for f in spec["fixtures"]:
    root = out / f["id"]
    (root / "evals/regression").mkdir(parents=True)
    (root / "AGENTS.md").write_text(AGENTS)
    (root / "evals/regression/log.md").write_text(LOG)
    write_history(root / "evals/regression/cell-history.json", {s["name"]: suite_history(s) for s in f["suites"]})
    print(f["id"])
