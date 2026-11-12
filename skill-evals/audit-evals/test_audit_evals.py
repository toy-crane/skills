"""Behavior tests for audit-evals' counting script.

Run: python3 -I -m unittest discover -s skill-evals/audit-evals -p 'test_*.py'

Expected values are worked out by hand from the history below, not taken from
the script's output.
"""
import copy
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
CLI = REPO / "skills/workflow/audit-evals/scripts/audit_evals.py"


def cell(tier, baseline, trials, passes):
    return {"tier": tier, "baseline": baseline, "trials": trials, "passes": passes}


# s1: 3 cases x 4 checks, 2 reps. k1 is a code check; k2 and k3 share one judge
# call "r"; k4 has its own judge call.
# s2: j1 is judged, j2 is code; d1/j2 is already in the lower tier and d2/j2 has
# just graduated with no trials yet.
HISTORY = {
    "version": 1,
    "suites": {
        "s1": {
            "reps": 2,
            "last_run_model": "m-a",
            "lower_tier_model": None,
            "checks": {
                "k1": {"grader": "code"},
                "k2": {"grader": "judge", "judge_call": "r"},
                "k3": {"grader": "judge", "judge_call": "r"},
                "k4": {"grader": "judge"},
            },
            "cells": {
                "c1": {
                    "k1": cell("upper", "pass", 10, 10),
                    "k2": cell("upper", "fail", 10, 10),
                    "k3": cell("upper", "fail", 10, 10),
                    "k4": cell("upper", "pass", 10, 10),
                },
                "c2": {
                    "k1": cell("upper", "pass", 10, 10),
                    "k2": cell("upper", "fail", 10, 6),
                    "k3": cell("upper", "fail", 10, 6),
                    "k4": cell("upper", None, 10, 10),
                },
                "c3": {
                    "k1": cell("upper", "pass", 10, 10),
                    "k2": cell("upper", "fail", 10, 0),
                    "k3": cell("upper", "fail", 10, 0),
                    "k4": cell("upper", "pass", 9, 9),
                },
            },
        },
        "s2": {
            "reps": 2,
            "last_run_model": "m-b",
            "lower_tier_model": "m-a",
            "checks": {
                "j1": {"grader": "judge", "judge_call": "j"},
                "j2": {"grader": "code"},
            },
            "cells": {
                "d1": {"j1": cell("upper", "fail", 12, 12), "j2": cell("lower", "pass", 12, 12)},
                "d2": {"j1": cell("upper", "fail", 10, 10), "j2": cell("upper", "pass", 0, 0)},
            },
        },
    },
}


def run(*args):
    return subprocess.run([sys.executable, "-I", str(CLI), *args], capture_output=True, text=True)


class AuditTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / "cell-history.json"
        self.path.write_text(json.dumps(HISTORY))

    def tearDown(self):
        self.tmp.cleanup()

    def report(self, *extra):
        out = run("report", str(self.path), "--json", *extra)
        self.assertEqual(out.returncode, 0, out.stderr)
        return json.loads(out.stdout)

    def test_never_failed_cells_need_ten_trials(self):
        data = self.report()
        self.assertEqual(data["never_failed"], [
            "s1/c1/k1", "s1/c1/k2", "s1/c1/k3", "s1/c1/k4", "s1/c2/k1", "s1/c2/k4", "s1/c3/k1",
            "s2/d1/j1", "s2/d1/j2", "s2/d2/j1",
        ])
        self.assertEqual(data["insufficient_history"], ["s1/c3/k4", "s2/d2/j2"])

    def test_min_trials_can_be_lowered(self):
        data = self.report("--min-trials", "9")
        self.assertIn("s1/c3/k4", data["never_failed"])
        self.assertEqual(data["insufficient_history"], ["s2/d2/j2"])

    def test_identical_flipping_and_always_failing(self):
        data = self.report()
        self.assertEqual(data["identical_checks"], [["s1/k2", "s1/k3"]])
        self.assertEqual(data["flipping"], ["s1/c2/k2", "s1/c2/k3"])
        self.assertEqual(data["always_failing"], ["s1/c3/k2", "s1/c3/k3"])

    def test_demotions_grouped_by_check_then_case_with_savings_per_run(self):
        data = self.report()
        self.assertEqual(data["proposals"], [
            {"unit": "s1/*/k1", "cells": 3, "runs_saved": 0, "judge_calls_saved": 0},
            {"unit": "s2/*/j1", "cells": 2, "runs_saved": 2, "judge_calls_saved": 4},
            {"unit": "s1/c1/*", "cells": 4, "runs_saved": 2, "judge_calls_saved": 4},
            {"unit": "s1/c2/k4", "cells": 1, "runs_saved": 0, "judge_calls_saved": 2},
        ])

    def test_judged_checks_that_never_failed_can_be_verified(self):
        self.assertEqual(self.report()["verification_candidates"], ["s2/j1"])

    def test_markdown_report_names_units_and_counts(self):
        out = run("report", str(self.path))
        self.assertEqual(out.returncode, 0, out.stderr)
        for text in ("s1/*/k1", "s1/c1/*", "s1/c2/k4", "s1/k2 = s1/k3", "s1/c2/k2 6/10", "s1/c3/k2 0/10",
                     "Never failed (10)", "Insufficient history (2)", "Flipping (2)", "Always failing (2)"):
            self.assertIn(text, out.stdout)

    def test_missing_history_cannot_be_judged(self):
        out = run("report", str(Path(self.tmp.name) / "absent.json"))
        self.assertEqual(out.returncode, 3)
        self.assertIn("no cell history", out.stdout.lower())

    def test_malformed_history_is_rejected(self):
        broken = copy.deepcopy(HISTORY)
        del broken["suites"]["s1"]["checks"]["k4"]
        self.path.write_text(json.dumps(broken))
        out = run("report", str(self.path))
        self.assertEqual(out.returncode, 2)
        self.assertIn("k4", out.stderr)

    def test_apply_demotes_only_the_approved_unit(self):
        out = run("apply", str(self.path), "s1/c1/*")
        self.assertEqual(out.returncode, 0, out.stderr)
        after = json.loads(self.path.read_text())
        s1 = after["suites"]["s1"]
        self.assertEqual({k: v["tier"] for k, v in s1["cells"]["c1"].items()},
                         {"k1": "lower", "k2": "lower", "k3": "lower", "k4": "lower"})
        self.assertEqual(s1["cells"]["c2"]["k1"]["tier"], "upper")
        self.assertEqual(s1["cells"]["c2"]["k4"]["tier"], "upper")
        self.assertEqual(after["suites"]["s2"], HISTORY["suites"]["s2"])
        # The lower tier last ran on the model that produced the demoted cells' trials.
        self.assertEqual(s1["lower_tier_model"], "m-a")
        self.assertEqual(s1["cells"]["c1"]["k1"]["trials"], 10)

    def test_apply_refuses_a_unit_holding_a_cell_that_is_not_eligible(self):
        before = self.path.read_text()
        out = run("apply", str(self.path), "s1/c2/k4", "s1/*/k4")
        self.assertEqual(out.returncode, 2)
        self.assertIn("s1/c3/k4", out.stderr)
        self.assertEqual(self.path.read_text(), before)


if __name__ == "__main__":
    unittest.main()
