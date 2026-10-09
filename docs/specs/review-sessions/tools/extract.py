#!/usr/bin/env python3
"""Stream Claude Code and Codex session logs into one compact per-session JSONL."""
import json, os, re, sys, time, glob

OUT = sys.argv[1]
DAYS = int(sys.argv[2]) if len(sys.argv) > 2 else 30
CUT = time.time() - DAYS * 86400
HOME = os.path.expanduser("~")

SUBCMD = {"git","gh","npm","npx","pnpm","bun","bunx","yarn","docker","xcrun","expo","claude","codex",
          "skills","cargo","go","python3","python","pip","uv","supabase","vercel","eas","brew","tmux",
          "agent-device","adb","xcodebuild","simctl","jq","rg","grep","find","ls","cat","sed","head","tail",
          "node","npx","swift","pod","linear","open","curl","kill","lsof","ps","osascript","defaults"}
PATH_RE = re.compile(r"(/[\w.@~-]+)+/?")
QUOTE_RE = re.compile(r"(\"[^\"]*\"|'[^']*')")
NUM_RE = re.compile(r"\b\d+\b")
HASH_RE = re.compile(r"\b[0-9a-f]{7,40}\b")
SPLIT_RE = re.compile(r"\s*(?:&&|\|\||;|\||\n)\s*")
ENV_RE = re.compile(r"^(?:[A-Z_][A-Z0-9_]*=\S*\s+)+")

CORR_RE = re.compile(r"(아니|아냐|아닌|틀렸|잘못|다시|하지 ?마|그게 아|안 ?돼|안 ?되|말고|되돌|취소|멈춰|그만|원래대로|롤백|빠졌|누락|다르|아직|안 했|왜 |왜$|revert|undo|\bno\b|\bnot\b|don'?t|wrong|\bstop\b|instead|actually|should|shouldn)", re.I)

def norm_cmd(cmd):
    """Return (heads, full_norm). heads: list of 'tool sub' per segment."""
    if not isinstance(cmd, str):
        return [], ""
    heads = []
    for seg in SPLIT_RE.split(cmd.strip()):
        seg = seg.strip()
        if not seg:
            continue
        seg = ENV_RE.sub("", seg)
        toks = seg.split()
        if not toks:
            continue
        # strip wrappers
        while toks and toks[0] in ("cd","sudo","command","timeout","nohup","time","exec","nice","caffeinate"):
            if toks[0] == "cd":
                heads.append("cd"); toks = []; break
            toks = toks[1:]
            if toks and toks[0].isdigit(): toks = toks[1:]
        if not toks:
            continue
        t0 = os.path.basename(toks[0]) if toks[0].startswith("/") or toks[0].startswith("./") else toks[0]
        if t0 in SUBCMD and len(toks) > 1 and not toks[1].startswith("-"):
            t1 = toks[1]
            if t0 in ("cat","ls","head","tail","sed","grep","rg","find","jq","open","kill","lsof","ps","curl"):
                heads.append(t0)
            elif t0 in ("npx","bunx","pnpm","npm","bun","yarn") and len(toks) > 2 and toks[1] in ("run","dlx","exec","x","-y"):
                heads.append(f"{t0} {toks[1]} {toks[2]}")
            else:
                heads.append(f"{t0} {t1}")
        else:
            heads.append(t0)
    full = cmd
    full = QUOTE_RE.sub("<q>", full)
    full = PATH_RE.sub("<p>", full)
    full = HASH_RE.sub("<h>", full)
    full = NUM_RE.sub("<n>", full)
    full = re.sub(r"\s+", " ", full).strip()[:200]
    return heads, full

def repo_of(cwd):
    if not cwd: return ""
    m = re.match(r"(.*?)/\.claude/worktrees/", cwd)
    if m: return m.group(1)
    m = re.match(r"(.*?)/\.codex-workspaces/worktrees/[^/]+/([^/]+)", cwd)
    if m: return f"{HOME}/code/{m.group(2)}"
    m = re.match(r"(.*?)/\.codex/worktrees/[^/]+/([^/]+)", cwd)
    if m: return f"{HOME}/code/{m.group(2)}"
    m = re.match(r"(.*?)/worktrees/[^/]+$", cwd)
    if m: return m.group(1)
    return cwd

def user_text(content):
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for b in content:
            if isinstance(b, dict) and b.get("type") in ("text","input_text"):
                parts.append(b.get("text",""))
        return "\n".join(parts)
    return ""

def err_key(text):
    t = re.sub(r"\s+"," ", text or "")[:400]
    t = PATH_RE.sub("<p>", t); t = NUM_RE.sub("<n>", t); t = HASH_RE.sub("<h>", t)
    return t[:120]

def emit(fo, rec):
    fo.write(json.dumps(rec, ensure_ascii=False) + "\n")

# ---------------- Claude Code ----------------
def parse_claude(path, fo):
    sess = {"harness":"claude","path":path,"events":[],"cwd":None,"version":None,"entrypoint":None,
            "start":None,"end":None,"n_user_text":0,"n_tool":0,"n_err":0,"sidechain_tools":0,
            "first_prompt":None,"skills":[],"models":set()}
    tool_names = {}
    last_ai = ""
    with open(path, "r", errors="replace") as f:
        for line in f:
            if not line.startswith("{"): continue
            t = line[:60]
            if '"type":"attachment"' in t or '"type":"queue-operation"' in t or '"type":"custom-title"' in t \
               or '"type":"mode"' in t or '"type":"last-prompt"' in t or '"type":"bridge-session"' in t or '"type":"atis-latch"' in t:
                continue
            try: d = json.loads(line)
            except Exception: continue
            typ = d.get("type")
            ts = d.get("timestamp")
            if ts:
                if sess["start"] is None: sess["start"] = ts
                sess["end"] = ts
            if sess["cwd"] is None and d.get("cwd"): sess["cwd"] = d["cwd"]
            if sess["version"] is None and d.get("version"): sess["version"] = d["version"]
            if sess["entrypoint"] is None and d.get("entrypoint"): sess["entrypoint"] = d["entrypoint"]
            side = bool(d.get("isSidechain"))
            msg = d.get("message") or {}
            if typ == "user":
                content = msg.get("content")
                if isinstance(content, list) and content and isinstance(content[0], dict) and content[0].get("type") == "tool_result":
                    for b in content:
                        if not isinstance(b, dict) or b.get("type") != "tool_result": continue
                        is_err = bool(b.get("is_error"))
                        c = b.get("content")
                        if isinstance(c, list):
                            c = " ".join(x.get("text","") for x in c if isinstance(x, dict))
                        c = c if isinstance(c, str) else json.dumps(c, ensure_ascii=False)[:400]
                        name = tool_names.get(b.get("tool_use_id"), "?")
                        low = c[:300].lower()
                        denial = ("doesn't want to proceed" in low or "user rejected" in low or "user declined" in low
                                  or "permission" in low and "denied" in low or "interrupted by user" in low)
                        if is_err or denial:
                            sess["n_err"] += 1
                            sess["events"].append({"k":"err","tool":name,"side":side,"denial":denial,"key":err_key(c),"text":c[:300]})
                    continue
                if d.get("isMeta"): continue
                txt = user_text(content).strip()
                if not txt: continue
                m = re.search(r"<command-name>/?([\w:-]+)</command-name>", txt)
                if m:
                    sess["skills"].append(m.group(1))
                    args = re.search(r"<command-args>(.*?)</command-args>", txt, re.S)
                    txt = "/" + m.group(1) + " " + (args.group(1).strip() if args else "")
                if txt.startswith("<local-command-stdout>") or txt.startswith("<command-message>"):
                    continue
                if side: continue
                sess["n_user_text"] += 1
                if sess["first_prompt"] is None: sess["first_prompt"] = txt[:300]
                sess["events"].append({"k":"user","text":txt[:400],"corr":bool(CORR_RE.search(txt[:400])),"len":len(txt),"prev_ai":last_ai[-500:]})
            elif typ == "assistant":
                if msg.get("model"): sess["models"].add(msg["model"])
                for b in msg.get("content") or []:
                    if isinstance(b, dict) and b.get("type")=="text" and not side:
                        last_ai = b.get("text","")
                for b in msg.get("content") or []:
                    if not isinstance(b, dict) or b.get("type") != "tool_use": continue
                    name = b.get("name"); inp = b.get("input") or {}
                    tool_names[b.get("id")] = name
                    if side:
                        sess["sidechain_tools"] += 1
                    sess["n_tool"] += 1
                    ev = {"k":"tool","name":name,"side":side}
                    if name == "Bash":
                        heads, full = norm_cmd(inp.get("command",""))
                        ev["heads"] = heads; ev["full"] = full; ev["raw"] = (inp.get("command") or "")[:300]
                    elif name == "Skill":
                        ev["skill"] = inp.get("skill"); sess["skills"].append(inp.get("skill"))
                    elif name in ("Read","Edit","Write","MultiEdit"):
                        ev["file"] = inp.get("file_path")
                    elif name == "Agent":
                        ev["agent"] = inp.get("subagent_type"); ev["desc"] = inp.get("description")
                    elif name == "AskUserQuestion":
                        qs = inp.get("questions") or []
                        ev["questions"] = [ (q.get("question","")[:200], [o.get("label","") for o in (q.get("options") or [])][:4]) for q in qs if isinstance(q, dict)]
                    elif name == "Monitor":
                        ev["raw"] = (inp.get("cmd") or inp.get("command") or "")[:200]
                    elif name and name.startswith("mcp__"):
                        ev["mcp"] = name
                    sess["events"].append(ev)
            elif typ == "system":
                st = d.get("subtype")
                if st and st != "stop_hook_summary":
                    sess["events"].append({"k":"system","subtype":st,"text":(d.get("content") or "")[:200] if isinstance(d.get("content"), str) else ""})
    sess["models"] = sorted(sess["models"])
    sess["repo"] = repo_of(sess["cwd"])
    sess["id"] = os.path.basename(path).replace(".jsonl","")
    return sess

# ---------------- Codex ----------------
EXEC_CMD_RE = re.compile(r"exec_command\(\s*\{[^}]*?cmd\s*:\s*(\"(?:[^\"\\]|\\.)*\"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)", re.S)
TOOLS_RE = re.compile(r"tools\.([A-Za-z0-9_]+)\(")

def parse_codex(path, fo):
    sess = {"harness":"codex","path":path,"events":[],"cwd":None,"version":None,"entrypoint":None,
            "start":None,"end":None,"n_user_text":0,"n_tool":0,"n_err":0,"sidechain_tools":0,
            "first_prompt":None,"skills":[],"models":set(),"thread_source":None}
    call_names = {}
    with open(path, "r", errors="replace") as f:
        for line in f:
            if not line.startswith("{"): continue
            if '"type":"event_msg"' in line[:80] or '"type":"token_usage_record"' in line[:80]: continue
            try: d = json.loads(line)
            except Exception: continue
            typ = d.get("type"); p = d.get("payload") or {}
            ts = d.get("timestamp")
            if ts:
                if sess["start"] is None: sess["start"] = ts
                sess["end"] = ts
            if typ == "session_meta":
                sess["cwd"] = p.get("cwd"); sess["version"] = p.get("cli_version"); sess["entrypoint"] = p.get("originator")
                sess["thread_source"] = p.get("thread_source")
                continue
            if typ == "turn_context":
                if p.get("model"): sess["models"].add(p["model"])
                continue
            if typ != "response_item": continue
            pt = p.get("type")
            if pt == "message":
                if p.get("role") == "assistant":
                    last_ai = user_text(p.get("content")) if p.get("content") else ""
                    sess["_last_ai"] = last_ai[-500:]
                    continue
                if p.get("role") != "user": continue
                txt = user_text(p.get("content")).strip()
                if not txt or txt.startswith("# AGENTS.md instructions") or txt.startswith("<environment_context>") \
                   or txt.startswith("<INSTRUCTIONS>") or txt.startswith("<permissions"): continue
                if txt.startswith("<user_action>") or txt.startswith("<turn_aborted>"):
                    sess["events"].append({"k":"system","subtype":"user_action","text":txt[:200]}); continue
                sess["n_user_text"] += 1
                if sess["first_prompt"] is None: sess["first_prompt"] = txt[:300]
                m = re.findall(r"\$([a-z][\w-]+)", txt)
                for s in m: sess["skills"].append(s)
                sess["events"].append({"k":"user","text":txt[:400],"corr":bool(CORR_RE.search(txt[:400])),"len":len(txt),"prev_ai":sess.get("_last_ai","")})
            elif pt in ("function_call","custom_tool_call"):
                name = p.get("name"); call_names[p.get("call_id")] = name
                sess["n_tool"] += 1
                if pt == "custom_tool_call" and name == "exec":
                    src = p.get("input") or ""
                    tools = TOOLS_RE.findall(src)
                    cmds = [m.group(1)[1:-1] for m in EXEC_CMD_RE.finditer(src)]
                    for c in cmds:
                        c = c.encode().decode("unicode_escape", errors="ignore") if "\\" in c else c
                        heads, full = norm_cmd(c)
                        sess["events"].append({"k":"tool","name":"Bash","side":False,"heads":heads,"full":full,"raw":c[:300],"via":"exec"})
                        if "SKILL.md" in c:
                            mm = re.search(r"skills/([\w-]+)/SKILL\.md", c)
                            if mm: sess["skills"].append(mm.group(1))
                    for t in tools:
                        if t != "exec_command":
                            sess["events"].append({"k":"tool","name":"codex:"+t,"side":False})
                    if not cmds and not tools:
                        sess["events"].append({"k":"tool","name":"codex:exec-js","side":False})
                elif name in ("exec_command","shell","shell_command","container.exec"):
                    try: a = json.loads(p.get("arguments") or "{}")
                    except Exception: a = {}
                    c = a.get("cmd") or a.get("command") or ""
                    if isinstance(c, list): c = " ".join(c)
                    heads, full = norm_cmd(c)
                    sess["events"].append({"k":"tool","name":"Bash","side":False,"heads":heads,"full":full,"raw":c[:300],"via":"fc"})
                    if "SKILL.md" in c:
                        mm = re.search(r"skills/([\w-]+)/SKILL\.md", c)
                        if mm: sess["skills"].append(mm.group(1))
                else:
                    ev = {"k":"tool","name":"codex:"+str(name),"side":False}
                    if name == "spawn_agent": sess["sidechain_tools"] += 1
                    sess["events"].append(ev)
            elif pt in ("function_call_output","custom_tool_call_output"):
                out = p.get("output")
                if isinstance(out, list):
                    out = " ".join(x.get("text","") for x in out if isinstance(x, dict))
                out = out if isinstance(out, str) else json.dumps(out, ensure_ascii=False)[:400]
                head = out[:200]
                m = re.search(r"exit code (\d+)|Script failed|Process exited with code (\d+)|exited with code (\d+)", head)
                code = None
                if m:
                    g = [x for x in m.groups() if x]
                    code = int(g[0]) if g else 1
                low = head.lower()
                denial = "rejected" in low and "user" in low or "approval" in low and ("denied" in low or "declined" in low) or "aborted" in low
                if (code not in (None, 0)) or denial:
                    sess["n_err"] += 1
                    name = call_names.get(p.get("call_id"), "?")
                    sess["events"].append({"k":"err","tool":name,"side":False,"denial":denial,"key":err_key(out),"text":out[:300]})
    sess["models"] = sorted(sess["models"])
    sess["repo"] = repo_of(sess["cwd"])
    sess["id"] = os.path.basename(path).replace(".jsonl","")
    sess.pop("_last_ai", None)
    return sess

def main():
    n = 0
    with open(OUT, "w") as fo:
        for path in glob.glob(f"{HOME}/.claude/projects/*/*.jsonl"):
            if os.path.getmtime(path) < CUT: continue
            try: s = parse_claude(path, fo)
            except Exception as e:
                print("ERR", path, e, file=sys.stderr); continue
            emit(fo, s); n += 1
            if n % 100 == 0: print(n, file=sys.stderr)
        for path in glob.glob(f"{HOME}/.codex/sessions/*/*/*/*.jsonl"):
            if os.path.getmtime(path) < CUT: continue
            try: s = parse_codex(path, fo)
            except Exception as e:
                print("ERR", path, e, file=sys.stderr); continue
            emit(fo, s); n += 1
            if n % 100 == 0: print(n, file=sys.stderr)
    print("done", n, file=sys.stderr)

main()
