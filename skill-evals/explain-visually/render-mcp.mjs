#!/usr/bin/env node
// Stand-in for the Claude desktop app's inline renderer, over stdio MCP. It serves the two tools the
// app gives a session, `read_me` and `show_widget`, so a headless run has the same interactive
// renderer the user sees. `show_widget` writes each widget to $EV_WIDGET_DIR/<n>.html (or .svg) and
// renders nothing; the runner captures each one later, before any input.
// read_me returns a short paraphrase of the host's design guidance: enough to keep the same pull
// toward interactive explainers and steppers, without copying the host's text.
import { appendFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

const dir = process.env.EV_WIDGET_DIR;
if (!dir) { console.error('usage: EV_WIDGET_DIR=<dir> render-mcp.mjs'); process.exit(2); }
mkdirSync(dir, { recursive: true });

const guide = `Visual creation guide (inline widgets).
- show_widget renders SVG (code starting with <svg) or an HTML fragment inline in the chat, 680px wide, auto height. No <html>/<head>/<body>.
- Use CSS variables for every color so dark mode works: --text-primary, --text-secondary, --text-muted, --surface-1, --surface-2, --bg-neutral, --bg-accent, --text-accent, --border, --border-strong, --border-accent, --radius.
- SVG helpers: classes t (14px text), ts (12px muted text), th (14px medium), box (neutral rect), arr (arrow line, use marker-end), c-purple/c-teal/c-coral/c-gray/c-blue/c-amber/c-green/c-red/c-pink on a <g> or shape for colored nodes.
- Interactive explainers: HTML controls (buttons, sliders, toggles) with live state; scripts run after streaming. Prefer interactive over static when the subject has something to operate.
- Step-by-step subjects (a cycle, an event loop, staged processes): build an HTML stepper with one panel per stage, dots or pills for position, and Next/Prev; Next wraps from the last stage back to the first for a cycle. JS-driven steppers are fine after streaming.
- Flowcharts: 4-5 nodes per diagram, single direction, arrows that do not cross boxes. Split big subjects into several diagrams with prose between them.
- Keep explanatory prose in the chat reply, not inside the widget. No gradients, shadows, or emoji.`;

const tools = {
  read_me: {
    description: 'Returns required context for show_widget (CSS variables, colors, typography, layout rules, examples). Call before your first show_widget call.',
    inputSchema: { type: 'object', properties: { modules: { type: 'array', items: { type: 'string' } } } },
  },
  show_widget: {
    description: 'Show visual content — SVG graphics, diagrams, charts, or interactive HTML widgets — that renders inline alongside your text response. Use for flowcharts, architecture diagrams, interactive explainers, data tables, or any visual content. The code is auto-detected: starts with <svg = SVG mode, otherwise HTML mode. Scripts are supported but execute after streaming completes.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short snake_case identifier for this visual.' },
        widget_code: { type: 'string', description: 'SVG or HTML code to render.' },
        loading_messages: { type: 'array', items: { type: 'string' } },
      },
      required: ['title', 'widget_code'],
    },
  },
};

function send(msg) { process.stdout.write(`${JSON.stringify(msg)}\n`); }
const rl = createInterface({ input: process.stdin });
rl.on('line', (line) => {
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  const { id, method, params } = msg;
  if (method === 'initialize') {
    send({ jsonrpc: '2.0', id, result: { protocolVersion: params?.protocolVersion ?? '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'visualize', version: '0.0.0-eval' } } });
  } else if (method === 'tools/list') {
    send({ jsonrpc: '2.0', id, result: { tools: Object.entries(tools).map(([name, t]) => ({ name, ...t })) } });
  } else if (method === 'tools/call') {
    const name = params?.name;
    const args = params?.arguments ?? {};
    appendFileSync(join(dir, 'calls.jsonl'), `${JSON.stringify({ at: new Date().toISOString(), tool: name, title: args.title ?? null })}\n`);
    if (name === 'read_me') {
      send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: guide }] } });
    } else if (name === 'show_widget' && typeof args.widget_code === 'string' && args.widget_code.trim()) {
      const n = readdirSync(dir).filter((f) => /^\d+\.(html|svg)$/.test(f)).length;
      const ext = args.widget_code.trimStart().startsWith('<svg') ? 'svg' : 'html';
      writeFileSync(join(dir, `${String(n).padStart(2, '0')}.${ext}`), args.widget_code);
      send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: 'Content rendered and shown to the user. Please do not duplicate the shown content in text because it\'s already visually represented.' }] } });
    } else {
      send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `invalid call to ${name}` }], isError: true } });
    }
  } else if (method === 'ping') send({ jsonrpc: '2.0', id, result: {} });
  else if (id !== undefined) send({ jsonrpc: '2.0', id, error: { code: -32601, message: `method not found: ${method}` } });
});
