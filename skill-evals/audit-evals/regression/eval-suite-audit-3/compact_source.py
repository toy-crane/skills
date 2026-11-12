"""Compact an anonymized per-trial archive into source/<name>.json.

Run: python3 -I compact_source.py <archive.json> source/<name>.json

Keeps only what a cell history can be built from: each run's id and reps, and
per cell its case, check, grader, whether it graduated, and one result letter
per (run, rep): p pass, f fail, - not judged.
"""
import json
import sys

src, dst = sys.argv[1], sys.argv[2]
data = json.load(open(src))
runs = [{"run": r["run"], "reps": r["reps"]} for r in sorted(data["runs"], key=lambda r: r["order"])]
letter = {"pass": "p", "fail": "f", "not_run": "-"}
cells = []
for c in data["cells"]:
    by_run = {}
    for t in sorted(c["trials"], key=lambda t: (t["run"], t["rep"])):
        by_run.setdefault(t["run"], []).append(letter[t["result"]])
    cells.append({
        "case": c["case"], "check": c["check"], "grader": c["grader"],
        "graduated": c["graduated"] and not c["known_failure"],
        "results": {run: "".join(v) for run, v in by_run.items()},
    })
cells.sort(key=lambda c: (c["case"], c["check"]))
with open(dst, "w") as out:
    out.write('{"runs": ' + json.dumps(runs) + ',\n"cells": [\n')
    out.write(",\n".join(json.dumps(c, separators=(",", ":")) for c in cells))
    out.write("\n]}\n")
