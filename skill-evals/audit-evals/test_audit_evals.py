"""Behavior tests for audit-evals' counting script.

Run: python3 -I -m unittest discover -s skill-evals/audit-evals -p 'test_*.py'

Expected values are worked out by hand from the history below, not taken from
the script's output. Every rule reads a cell's most recent 10 trials ("recent",
oldest first); the cumulative counts only give a cell's total failures.
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

P10 = "p" * 10


def cell(tier, baseline, trials, passes, recent):
    return {"tier": tier, "baseline": baseline, "trials": trials, "passes": passes, "recent": recent}


# s1: 3 cases x 4 checks, 2 reps. k1 is a code check; k2 and k3 share one judge
# call "r"; k4 has its own judge call. c1/k2 failed once long ago and has since
# passed 10 in a row. k2 and k3 fail on the same trials of the same cases.
# s2: j1 is judged, j2 and j3 are code. j1 and j3 never failed on the same
# cases, so they are not identical. d1/j2 is in the lower tier; d2/j2 has just
# graduated with no trials yet.
HISTORY = {
    "version": 2,
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
                    "k1": cell("upper", "pass", 10, 10, P10),
                    "k2": cell("upper", "fail", 14, 13, P10),
                    "k3": cell("upper", "fail", 10, 10, P10),
                    "k4": cell("upper", "pass", 10, 10, P10),
                },
                "c2": {
                    "k1": cell("upper", "pass", 10, 10, P10),
                    "k2": cell("upper", "fail", 10, 8, "ppfppfpppp"),
                    "k3": cell("upper", "fail", 10, 8, "ppfppfpppp"),
                    "k4": cell("upper", None, 10, 10, P10),
                },
                "c3": {
                    "k1": cell("upper", "pass", 10, 10, P10),
                    "k2": cell("upper", "fail", 10, 0, "f" * 10),
                    "k3": cell("upper", "fail", 10, 0, "f" * 10),
                    "k4": cell("upper", "pass", 9, 9, "p" * 9),
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
                "j3": {"grader": "code"},
            },
            "cells": {
                "d1": {"j1": cell("upper", "fail", 12, 12, P10), "j2": cell("lower", "pass", 12, 12, P10),
                       "j3": cell("upper", "pass", 10, 10, P10)},
                "d2": {"j1": cell("upper", "fail", 10, 10, P10), "j2": cell("upper", "pass", 0, 0, ""),
                       "j3": cell("upper", "pass", 10, 10, P10)},
            },
        },
    },
}


def run(*args):
    return subprocess.run([sys.executable, "-I", str(CLI), *args], capture_output=True, text=True)


class AuditTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        (Path(self.tmp.name) / "regression").mkdir()
        self.path = Path(self.tmp.name) / "regression" / "cell-history.json"
        self.path.write_text(json.dumps(HISTORY))

    def tearDown(self):
        self.tmp.cleanup()

    def report(self, *extra):
        out = run("report", str(self.path), "--json", *extra)
        self.assertEqual(out.returncode, 0, out.stderr)
        return json.loads(out.stdout)

    def test_candidates_passed_their_recent_ten_even_after_an_old_failure(self):
        data = self.report()
        self.assertEqual(data["recent_all_passed"], [
            "s1/c1/k1", "s1/c1/k2", "s1/c1/k3", "s1/c1/k4", "s1/c2/k1", "s1/c2/k4", "s1/c3/k1",
            "s2/d1/j1", "s2/d1/j2", "s2/d1/j3", "s2/d2/j1", "s2/d2/j3",
        ])
        # Each candidate that failed before its window carries its total failures.
        self.assertEqual(data["total_failures"], {"s1/c1/k2": 1})

    def test_fewer_than_ten_recorded_trials_is_insufficient(self):
        self.assertEqual(self.report()["insufficient_history"], ["s1/c3/k4", "s2/d2/j2"])

    def test_flipping_and_always_failing_read_the_window(self):
        data = self.report()
        self.assertEqual(data["flipping"], ["s1/c2/k2", "s1/c2/k3"])
        self.assertEqual(data["always_failing"], ["s1/c3/k2", "s1/c3/k3"])

    def test_a_failure_counts_before_ten_trials_are_recorded(self):
        # Only a cell with no failure yet waits for 10 trials; a short history that already
        # failed is flipping, or always failing when it never passed.
        history = copy.deepcopy(HISTORY)
        history["suites"]["s1"]["cells"]["c3"]["k4"] = cell("upper", "pass", 9, 8, "ppppfpppp")
        history["suites"]["s2"]["cells"]["d2"]["j2"] = cell("upper", "pass", 3, 0, "fff")
        self.path.write_text(json.dumps(history))
        data = self.report()
        self.assertEqual(data["insufficient_history"], [])
        self.assertIn("s1/c3/k4", data["flipping"])
        self.assertIn("s2/d2/j2", data["always_failing"])

    def test_identical_checks_need_a_failure_in_the_window(self):
        # j1 and j3 both passed every trial on d1 and d2: not identical.
        self.assertEqual(self.report()["identical_checks"], [["s1/k2", "s1/k3"]])

    def test_demotions_grouped_by_check_then_case_with_savings_per_run(self):
        self.assertEqual(self.report()["proposals"], [
            {"unit": "s1/*/k1", "cells": 3, "runs_saved": 0, "judge_calls_saved": 0, "total_failures": 0},
            {"unit": "s2/*/j1", "cells": 2, "runs_saved": 0, "judge_calls_saved": 4, "total_failures": 0},
            {"unit": "s2/*/j3", "cells": 2, "runs_saved": 0, "judge_calls_saved": 0, "total_failures": 0},
            {"unit": "s1/c1/*", "cells": 4, "runs_saved": 2, "judge_calls_saved": 4, "total_failures": 1},
            # The rest of a check's candidates go as one unit per check.
            {"unit": "s1/~/k4", "cells": 2, "runs_saved": 0, "judge_calls_saved": 4, "total_failures": 0},
        ])

    def test_verification_needs_a_judged_check_with_no_failure_ever(self):
        # s1/k2 passed its recent 10 on c1 but failed before; s1/k4 has a cell under 10 trials.
        self.assertEqual(self.report()["verification_candidates"], ["s2/j1"])

    def test_full_report_goes_to_the_eval_root(self):
        out = run("report", str(self.path))
        self.assertEqual(out.returncode, 0, out.stderr)
        # The report sits at the eval root, outside the committed regression/ folder.
        self.assertFalse((self.path.parent / "audit-report.md").exists())
        report = (self.path.parent.parent / "audit-report.md").read_text()
        for text in ("s1/*/k1", "s1/c1/*", "s1/~/k4", "s1/k2 = s1/k3", "s1/c2/k2 ppfppfpppp", "s1/c3/k2 ffffffffff",
                     "s1/c1/k2: 1 failure in total", "Recent 10 all passed (12)", "Insufficient history (2)",
                     "Identical recent histories (1)", "Flipping (2)", "Always failing (2)"):
            self.assertIn(text, report)
        # The printed summary carries every count and the combined saving of all proposals.
        for text in ("recent 10 all passed 12", "insufficient history 2", "identical histories 1", "flipping 2",
                     "always failing 2", "5 demotion proposals", "4 runs and 10 judge calls", "audit-report.md"):
            self.assertIn(text, out.stdout)

    def test_a_partial_check_unit_names_the_cells_it_leaves_out(self):
        out = run("report", str(self.path))
        report = (self.path.parent.parent / "audit-report.md").read_text()
        self.assertIn("s1/~/k4: 2 of 3 upper cells, leaving out s1/c3/k4", report)
        self.assertIn("s1/~/k4: 2 of 3 upper cells, leaving out s1/c3/k4", out.stdout)

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

    def test_history_of_the_wrong_shape_is_rejected_by_name(self):
        good_cell = cell("upper", None, 2, 2, "pp")
        shapes = [[], {"version": 1, "suites": {}}, {"version": 2, "suites": []}, {"version": 2, "suites": {"s1": []}},
                  {"version": 2, "suites": {"s1": {"reps": 2, "checks": {"k1": "code"}, "cells": {}}}},
                  {"version": 2, "suites": {"s1": {"reps": 2, "checks": {"k1": {"grader": "code"}}, "cells": {"c1": None}}}}]
        for recent in ("ppx", "p" * 11, "ppp"):
            bad = dict(good_cell, recent=recent)
            shapes.append({"version": 2, "suites": {"s1": {"reps": 2, "checks": {"k1": {"grader": "code"}}, "cells": {"c1": {"k1": bad}}}}})
        for broken in shapes:
            self.path.write_text(json.dumps(broken))
            out = run("report", str(self.path))
            self.assertEqual(out.returncode, 2, f"{broken}: {out.stderr}")
            self.assertIn("error:", out.stderr)

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
        self.assertEqual(s1["cells"]["c1"]["k2"], dict(HISTORY["suites"]["s1"]["cells"]["c1"]["k2"], tier="lower"))

    def test_apply_the_candidate_part_of_a_check(self):
        out = run("apply", str(self.path), "s1/~/k4")
        self.assertEqual(out.returncode, 0, out.stderr)
        cells = json.loads(self.path.read_text())["suites"]["s1"]["cells"]
        self.assertEqual([cells[c]["k4"]["tier"] for c in ("c1", "c2", "c3")], ["lower", "lower", "upper"])

    def test_apply_refuses_a_unit_holding_a_cell_that_is_not_a_candidate(self):
        before = self.path.read_text()
        out = run("apply", str(self.path), "s1/c2/k4", "s1/*/k4")
        self.assertEqual(out.returncode, 2)
        self.assertIn("s1/c3/k4", out.stderr)
        self.assertEqual(self.path.read_text(), before)


if __name__ == "__main__":
    unittest.main()
