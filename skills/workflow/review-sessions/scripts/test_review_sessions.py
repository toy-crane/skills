"""Behavior tests for the review-sessions measurement CLI.

Run: python3 -I -m unittest discover -s skills/workflow/review-sessions/scripts -p 'test_*.py'
"""
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
CLI = HERE / "review_sessions.py"
import datetime as dt
NOW = dt.datetime.now(dt.timezone.utc).isoformat()
HOME = "/Users/tester"


def claude_user(text, ts, cwd, **extra):
    rec = {"type": "user", "cwd": cwd, "timestamp": ts, "message": {"role": "user", "content": text}}
    rec.update(extra)
    return rec


def claude_skill_meta(name, body, ts, cwd):
    text = f"Base directory for this skill: {HOME}/code/alpha/.claude/skills/{name}\n\n{body}"
    return {"type": "user", "isMeta": True, "cwd": cwd, "timestamp": ts,
            "message": {"role": "user", "content": [{"type": "text", "text": text}]}}


def claude_tool(tool_id, name, inp, ts, cwd, side=False):
    return {"type": "assistant", "cwd": cwd, "timestamp": ts, "isSidechain": side,
            "message": {"role": "assistant", "content": [{"type": "tool_use", "id": tool_id, "name": name, "input": inp}]}}


def claude_result(tool_id, content, ts, cwd, is_error=False, side=False):
    return {"type": "user", "cwd": cwd, "timestamp": ts, "isSidechain": side,
            "message": {"role": "user", "content": [{"type": "tool_result", "tool_use_id": tool_id, "is_error": is_error, "content": content}]}}


def write_jsonl(path, records, mtime=None):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    if mtime is not None:
        os.utime(path, (mtime, mtime))


def codex_session(session_id, cwd, originator, thread_source, items, ts="2026-10-01T09:00:00.000Z"):
    recs = [{"timestamp": ts, "type": "session_meta", "payload": {"id": session_id, "cwd": cwd, "originator": originator,
             "thread_source": thread_source, "cli_version": "0.161.0"}}]
    for it in items:
        recs.append({"timestamp": ts, "type": "response_item", "payload": it})
    return recs


class ScanFixture:
    """Builds a small corpus of Claude Code and Codex session logs in a temp dir."""

    def __init__(self):
        self.tmp = tempfile.TemporaryDirectory()
        root = Path(self.tmp.name)
        self.claude = root / "claude" / "projects"
        self.codex = root / "codex" / "sessions"
        self.out = root / "out"
        old = time.time() - 3600 * 24
        alpha = f"{HOME}/code/alpha"
        robo = f"{HOME}/code/alpha/.claude/worktrees/robo-fly-1-abc12345"
        t = "2026-10-01T09:00:00.000Z"
        # A: interactive session with a harness-blocked poll and a browser error
        write_jsonl(self.claude / "-Users-tester-code-alpha" / "aaaa1111.jsonl", [
            claude_user("미리보기 띄워줘", t, alpha),
            claude_skill_meta("pr", "# PR\nOpen a pull request.", t, alpha),
            claude_tool("t1", "Bash", {"command": "sleep 5; tail -20 /tmp/dev.log"}, t, alpha),
            claude_result("t1", "<tool_use_error>Blocked: sleep 5 followed by: tail -20 /tmp/dev.log. To wait for a condition, use Monitor", t, alpha, is_error=True),
            claude_tool("t2", "mcp__Claude_Browser__computer", {"action": "screenshot"}, t, alpha),
            claude_result("t2", "No site is open in this tab. Use `navigate` first.", t, alpha, is_error=True),
            claude_user("아니 그게 아니라 서버부터 켜", t, alpha),
            claude_tool("t3", "Bash", {"command": "gh pr create --title x --body y"}, t, alpha),
            claude_result("t3", "https://github.com/x/y/pull/1", t, alpha),
        ], mtime=old)
        # B: unattended Robo session hitting the worktree guard with a claim token on the command line
        write_jsonl(self.claude / "-Users-tester-code-alpha--claude-worktrees-robo-fly-1-abc12345" / "bbbb2222.jsonl", [
            claude_user("`triage-issues` Skill을 이슈 FLY-1 하나에 대해 실행한다.", t, robo),
            claude_tool("t1", "Bash", {"command": "bash .claude/skills/triage-issues/scripts/claim.sh verify --issue linear:FLY-1 --expected \"$(cut -d' ' -f1 /tmp/c)\" --token \"$(cut -d' ' -f2 /tmp/c)\""}, t, robo),
            claude_result("t1", "This session is isolated in the worktree " + robo + ", but this command runs bash inside a construct too complex to verify", t, robo, is_error=True),
            claude_tool("t2", "Bash", {"command": "bash .claude/skills/triage-issues/scripts/claim.sh verify --issue linear:FLY-1 --expected 79e772556cf616f59d93334bb10efb8e8bb016a3 --token 0ad862d48c1f4e0b9a7d6e5f4c3b2a1908f7e6d5c4b3a291"}, t, robo),
            claude_result("t2", "ok", t, robo),
        ], mtime=old)
        # C: eval run under /private/tmp — excluded entirely
        ev = "/private/tmp/claude-501/eval-run/scratchpad/holdout"
        write_jsonl(self.claude / "-private-tmp-claude-501-eval-run" / "cccc3333.jsonl", [
            claude_user("hello", t, ev),
            claude_tool("t1", "Bash", {"command": "git status"}, t, ev),
            claude_result("t1", "This session is isolated in the worktree x, but this command is too complex to verify", t, ev, is_error=True),
        ], mtime=old)
        # E: in-progress session (just modified) — excluded
        write_jsonl(self.claude / "-Users-tester-code-alpha" / "eeee5555.jsonl", [
            claude_user("작업 중", "2026-10-10T11:58:00.000Z", alpha),
            claude_tool("t1", "Bash", {"command": "sleep 3; tail -5 x.log"}, "2026-10-10T11:58:01.000Z", alpha),
            claude_result("t1", "<tool_use_error>Blocked: sleep 3 followed by: tail -5 x.log.", "2026-10-10T11:58:02.000Z", alpha, is_error=True),
        ], mtime=time.time())
        # F: no user text at all — excluded
        write_jsonl(self.claude / "-Users-tester-code-alpha" / "ffff6666.jsonl", [
            claude_tool("t1", "Bash", {"command": "ls"}, t, alpha),
            claude_result("t1", "a b", t, alpha),
        ], mtime=old)
        # G: Codex desktop session with an unknown payload type and an unknown top-level record
        g = codex_session("g1", f"{HOME}/code/beta", "Codex Desktop", "user", [
            {"type": "message", "role": "user", "content": [{"type": "input_text", "text": "카드 발행 체크해봐"}]},
            {"type": "function_call", "name": "exec_command", "call_id": "c1", "arguments": json.dumps({"cmd": "git status"})},
            {"type": "function_call_output", "call_id": "c1", "output": "clean"},
            {"type": "function_call", "name": "exec_command", "call_id": "c3", "arguments": json.dumps({"cmd": "curl -d '{\"token\":\"opaqueCredential123456\"}' http://127.0.0.1:1/x"})},
            {"type": "function_call_output", "call_id": "c3", "output": "ok"},
            {"type": "custom_tool_call", "name": "exec", "call_id": "c4", "input": "text(await tools.exec_command({cmd:\"bun test 2>&1 | tail -3\"}))"},
            {"type": "custom_tool_call_output", "call_id": "c4", "output": [{"type": "input_text", "text": "Script completed\nWall time 0.1 seconds\nOutput:\n {\"chunk_id\":\"adf143\",\"wall_time_seconds\":0.2,\"exit_code\":1,\"original_token_count\":40,\"output\":\"1 fail\"}"}]},
            {"type": "mystery_item", "call_id": "c2"},
        ])
        g.append({"timestamp": "2026-10-01T09:00:00.000Z", "type": "weird", "payload": {}})
        g.append({"timestamp": "2026-09-01T09:00:00.000Z", "type": "weird", "payload": {}})
        write_jsonl(self.codex / "2026" / "10" / "01" / "rollout-2026-10-01T09-00-00-g1.jsonl", g, mtime=old)
        # H: Codex subagent thread — excluded
        write_jsonl(self.codex / "2026" / "10" / "01" / "rollout-2026-10-01T09-05-00-h1.jsonl", codex_session(
            "h1", f"{HOME}/code/beta", "Codex Desktop", "subagent", [
                {"type": "message", "role": "user", "content": [{"type": "input_text", "text": "sub task"}]},
            ]), mtime=old)

    def add_session_started_before_period(self):
        """A session whose only user turn predates the period but whose tool calls fall inside it."""
        alpha = f"{HOME}/code/alpha"
        write_jsonl(self.claude / "-Users-tester-code-alpha" / "99999999.jsonl", [
            claude_user("내일 이어서 보자", "2026-09-20T09:00:00.000Z", alpha),
            claude_tool("t1", "Bash", {"command": "sleep 9; tail -1 /tmp/x.log"}, "2026-10-02T09:00:00.000Z", alpha),
            claude_result("t1", "<tool_use_error>Blocked: sleep 9 followed by: tail -1 /tmp/x.log.", "2026-10-02T09:00:01.000Z", alpha, is_error=True),
        ], mtime=time.time() - 3600 * 24)

    def add_second_period_session(self):
        """An interactive session on 2026-10-05 that loaded a newer `pr` skill text."""
        alpha = f"{HOME}/code/alpha"
        t = "2026-10-05T09:00:00.000Z"
        write_jsonl(self.claude / "-Users-tester-code-alpha" / "a2a2a2a2.jsonl", [
            claude_user("PR 올려줘", t, alpha),
            claude_skill_meta("pr", "# PR\nOpen a pull request.\nAttach evidence.", t, alpha),
            claude_tool("t1", "Bash", {"command": "sleep 2; tail -3 /tmp/ci.log"}, t, alpha),
            claude_result("t1", "<tool_use_error>Blocked: sleep 2 followed by: tail -3 /tmp/ci.log.", t, alpha, is_error=True),
            claude_tool("t2", "Bash", {"command": "gh pr create --title z --body w"}, t, alpha),
            claude_result("t2", "https://github.com/x/y/pull/2", t, alpha),
        ], mtime=time.time() - 3600 * 24)

    def add_interactive_sessions(self, count):
        """Plain interactive sessions with a few tool calls each, dated inside the period."""
        gamma = f"{HOME}/code/gamma"
        for i in range(count):
            t = f"2026-10-0{1 + i % 7}T10:00:00.000Z"
            write_jsonl(self.claude / "-Users-tester-code-gamma" / f"s{i:02d}s{i:02d}.jsonl", [
                claude_user(f"기능 {i} 고쳐줘", t, gamma),
                claude_tool("t1", "Bash", {"command": "git status"}, t, gamma),
                claude_result("t1", "clean", t, gamma),
                claude_tool("t2", "Read", {"file_path": f"{gamma}/src/app.ts"}, t, gamma),
                claude_result("t2", "export {}", t, gamma),
                claude_tool("t3", "Bash", {"command": "bun test 2>&1 | tail -5"}, t, gamma),
                claude_result("t3", "5 pass", t, gamma),
            ], mtime=time.time() - 3600 * 24)

    def report(self, candidates):
        findings = self.out / "findings.json"
        cands = self.out / "candidates.json"
        cands.write_text(json.dumps(candidates, ensure_ascii=False))
        html = self.out / "report.html"
        proc = subprocess.run([sys.executable, "-I", str(CLI), "report", "--findings", str(findings),
                               "--candidates", str(cands), "--out", str(html)], capture_output=True, text=True)
        if proc.returncode != 0:
            raise AssertionError(f"report failed: {proc.stderr}")
        return html.read_text()

    def scan(self, *extra):
        self.out.mkdir(exist_ok=True)
        findings = self.out / "findings.json"
        cmd = [sys.executable, "-I", str(CLI), "scan", "--claude-dir", str(self.claude), "--codex-dir", str(self.codex),
               "--since", "2026-09-26", "--until", "2026-10-10", "--now", NOW, "--out", str(findings), *extra]
        proc = subprocess.run(cmd, capture_output=True, text=True)
        if proc.returncode != 0:
            raise AssertionError(f"scan failed: {proc.stderr}")
        return json.loads(findings.read_text())

    def cleanup(self):
        self.tmp.cleanup()


def signal(findings, sid):
    return next(s for s in findings["signals"] if s["id"] == sid)


class ScanCountsSignalsWithExclusions(unittest.TestCase):
    def setUp(self):
        self.fx = ScanFixture()
        self.addCleanup(self.fx.cleanup)

    def test_counts_sessions_events_and_excludes_eval_in_progress_empty_and_subagent_sessions(self):
        f = self.fx.scan()
        self.assertEqual(f["sessions"]["claude"], 2)
        self.assertEqual(f["sessions"]["codex"], 1)
        self.assertEqual(f["sessions"]["excluded"], {"eval": 1, "in_progress": 1, "no_user_text": 1, "subagent": 1})
        self.assertEqual(f["sessions"]["by_kind"], {"unattended": 1, "interactive": 2})
        harness = signal(f, "harness_sleep_tail")
        self.assertEqual((harness["sessions"], harness["events"]), (1, 1))
        guard = signal(f, "guard_blocked")
        self.assertEqual((guard["sessions"], guard["events"], guard["unattended_sessions"]), (1, 1, 1))
        browser = signal(f, "browser_friction")
        self.assertEqual((browser["sessions"], browser["events"]), (1, 1))
        self.assertEqual(signal(f, "delegation_pr")["sessions"], 0)
        self.assertEqual(signal(f, "polling_sleep")["sessions"], 1)

    def test_counts_unknown_record_types_instead_of_failing(self):
        f = self.fx.scan()
        self.assertEqual(f["unknown_records"]["codex"], {"weird": 1, "mystery_item": 1})
        self.assertEqual(f["unknown_records"]["claude"], {})

    def test_codex_structured_exit_code_counts_as_an_error(self):
        f = self.fx.scan()
        self.assertEqual(f["sessions"]["errors"], 4)

    def test_keeps_a_session_whose_user_turn_predates_the_period_but_whose_tools_fall_inside(self):
        self.fx.add_session_started_before_period()
        f = self.fx.scan()
        self.assertEqual(f["sessions"]["claude"], 3)
        self.assertEqual(signal(f, "harness_sleep_tail")["sessions"], 2)

    def test_codex_sessions_are_labelled_by_their_session_id_not_the_rollout_file_name(self):
        f = self.fx.scan("--strict-n", "5", "--threshold-sessions", "1")
        labels = " ".join(x for s in f["signals"] for x in s["examples"]) + " ".join(s["session"] for s in f["strict"])
        self.assertNotIn("rollout-", labels)


class WindowsNeverCarrySecrets(unittest.TestCase):
    def setUp(self):
        self.fx = ScanFixture()
        self.addCleanup(self.fx.cleanup)

    def test_guard_window_shows_blocked_and_accepted_forms_with_values_masked(self):
        f = self.fx.scan()
        guard = signal(f, "guard_blocked")
        self.assertEqual(len(guard["windows"]), 1)
        lines = guard["windows"][0]["lines"]
        self.assertTrue(any(line.startswith("ERR") and "isolated in the worktree" in line for line in lines))
        self.assertTrue(any("claim.sh verify" in line and "--expected <hex>" in line for line in lines))
        self.assertTrue(any("--token <token>" in line for line in lines))

    def test_findings_contain_no_token_like_strings(self):
        self.fx.scan()
        text = (self.fx.out / "findings.json").read_text()
        self.assertIsNone(re.search(r"[0-9a-f]{32,}", text))
        self.assertNotIn("0ad862d48c1f4e0b9a7d6e5f4c3b2a1908f7e6d5c4b3a291", text)
        self.assertNotIn("79e772556cf616f59d93334bb10efb8e8bb016a3", text)

    def test_json_quoted_and_quoted_multiword_secrets_are_masked_everywhere(self):
        f = self.fx.scan("--strict-n", "5")
        text = (self.fx.out / "findings.json").read_text()
        self.assertNotIn("opaqueCredential123456", text)
        html = self.fx.report({"summary": "token=opaqueCredential123456 그리고 TOKEN=\"alpha beta gamma\"",
                               "candidates": [], "judgment_notes": [], "project": [], "strict": []})
        self.assertNotIn("opaqueCredential123456", html)
        self.assertNotIn("alpha beta gamma", html)


class CandidatesPassTheThreshold(unittest.TestCase):
    def setUp(self):
        self.fx = ScanFixture()
        self.addCleanup(self.fx.cleanup)

    def test_one_unattended_session_is_enough_but_one_interactive_session_is_not(self):
        f = self.fx.scan()
        self.assertIn("guard_blocked", f["candidates"])
        self.assertNotIn("browser_friction", f["candidates"])
        self.assertTrue(signal(f, "guard_blocked")["candidate"])
        self.assertFalse(signal(f, "browser_friction")["candidate"])

    def test_harness_owned_signals_never_become_candidates(self):
        f = self.fx.scan("--threshold-sessions", "1")
        self.assertIn("browser_friction", f["candidates"])
        self.assertNotIn("harness_sleep_tail", f["candidates"])


class ReMeasurementSplitsTheTable(unittest.TestCase):
    def setUp(self):
        self.fx = ScanFixture()
        self.addCleanup(self.fx.cleanup)
        self.fx.add_second_period_session()

    def test_split_by_date_divides_sessions_and_events(self):
        f = self.fx.scan("--split", "2026-10-03")
        harness = signal(f, "harness_sleep_tail")
        self.assertEqual(harness["before"], {"sessions": 1, "events": 1})
        self.assertEqual(harness["after"], {"sessions": 1, "events": 1})
        self.assertEqual(f["period"]["split"], "2026-10-03")

    def test_split_by_loaded_skill_text_hash(self):
        f = self.fx.scan()
        versions = f["skill_versions"]["pr"]
        self.assertEqual(len(versions), 2)
        newer = next(h for h, n in versions.items() if n["sessions"] == 1 and "a2a2a2a2" in n["examples"][0])
        f = self.fx.scan("--split-hash", f"pr={newer[:12]}")
        harness = signal(f, "harness_sleep_tail")
        self.assertEqual(harness["before"], {"sessions": 1, "events": 1})
        self.assertEqual(harness["after"], {"sessions": 1, "events": 1})
        guard = signal(f, "guard_blocked")
        self.assertEqual(guard["unsplit"], {"sessions": 1, "events": 1})


class StrictReadsAreAFixedRandomSample(unittest.TestCase):
    def setUp(self):
        self.fx = ScanFixture()
        self.addCleanup(self.fx.cleanup)

    def test_takes_exactly_five_interactive_sessions_when_more_are_eligible(self):
        self.fx.add_interactive_sessions(7)
        first = self.fx.scan()["strict"]
        second = self.fx.scan()["strict"]
        self.assertEqual(len(first), 5)
        self.assertEqual([s["session"] for s in first], [s["session"] for s in second])
        self.assertTrue(all(s["kind"] == "interactive" for s in first))
        self.assertNotIn("bbbb2222", " ".join(s["session"] for s in first))
        self.assertTrue(all(0 < len(s["summary"]) <= 2000 for s in first))

    def test_takes_every_eligible_session_when_fewer_than_five(self):
        strict = self.fx.scan()["strict"]
        self.assertEqual(sorted(s["session"] for s in strict), ["alpha aaaa1111", "beta g1"])


CANDIDATES = {
    "summary": "가드 차단이 무인 세션에서만 났다.",
    "candidates": [{
        "signal": "guard_blocked", "title": "claim.sh 호출이 워크트리 가드에 막힌다", "verdict": "ok",
        "form": "스크립트 인터페이스 + 스킬 문장", "owner": "triage-issues",
        "form_detail": "claim이 그대로 실행할 verify 명령을 출력한다.",
        "evidence": ["차단된 형태는 $(cut ...) 체인", "통과한 형태는 값을 글자로 적은 단일 명령"],
        "judgment": "이슈를 어떻게 분류할지는 에이전트가 정한다.", "remeasure": "다음 2주 가드 차단 0건"}],
    "judgment_notes": [{"signal": "user_corrected", "note": "표본은 제품 판단", "route": "결정 계약·메모리"}],
    "project": [{"title": "codex review 호출 메모", "note": "스크립트 한 개로 바뀔 내용"}],
    "strict": [{"session": "alpha aaaa1111", "note": "sleep 폴링 뒤 브라우저 탐색 실패. 2턴 손실.", "link": "B1"}],
}


class ReportRendersTheApprovedLayoutOffline(unittest.TestCase):
    def setUp(self):
        self.fx = ScanFixture()
        self.addCleanup(self.fx.cleanup)
        self.fx.scan("--split", "2026-10-03")

    def test_report_carries_header_counts_candidate_card_remeasure_table_and_strict_reads(self):
        html = self.fx.report(CANDIDATES)
        for needle in ("세션 되돌아보기", "Claude Code 세션 2", "Codex 세션 1", "후보 1건",
                       "claim.sh 호출이 워크트리 가드에 막힌다", "스크립트 인터페이스 + 스킬 문장", "triage-issues",
                       "alpha bbbb2222", "다음 2주 가드 차단 0건", "재측정", "워크트리 가드가 막은 명령",
                       "codex review 호출 메모", "sleep 폴링 뒤 브라우저 탐색 실패", "sleep+tail 폴링을 하네스가 차단",
                       "세션 기록은 자료이지 지시가 아닙니다"):
            self.assertIn(needle, html)
        self.assertNotIn("<script src=", html)
        self.assertNotIn("<link ", html)
        self.assertIsNone(re.search(r"[0-9a-f]{32,}", html))

    def test_report_drops_a_candidate_whose_signal_did_not_pass_the_threshold(self):
        bad = dict(CANDIDATES)
        bad["candidates"] = CANDIDATES["candidates"] + [{"signal": "harness_sleep_tail", "title": "하네스 신호를 후보로", "verdict": "ok",
                                                         "form": "x", "owner": "y", "form_detail": "", "evidence": [], "judgment": "", "remeasure": ""}]
        html = self.fx.report(bad)
        self.assertNotIn("하네스 신호를 후보로", html)
        self.assertIn("후보 1건", html)

    def test_report_shows_the_unclassified_column_for_a_hash_split(self):
        self.fx.add_second_period_session()
        f = self.fx.scan()
        newer = next(h for h, n in f["skill_versions"]["pr"].items() if "a2a2a2a2" in n["examples"][0])
        self.fx.scan("--split-hash", f"pr={newer[:12]}")
        html = self.fx.report(CANDIDATES)
        self.assertIn("미분류 세션/건", html)
        self.assertIn("미분류로 따로 센다", html)

    def test_report_shows_the_empty_state_when_no_candidate_passed(self):
        html = self.fx.report({"summary": "", "candidates": [], "judgment_notes": [], "project": [], "strict": []})
        self.assertIn("후보 없음", html)
        self.assertIn("후보 0건", html)
        self.assertIn("재측정", html)


if __name__ == "__main__":
    unittest.main()
