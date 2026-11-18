// Captures a widget's first view: the page as it stands after load and its scripts, before any
// click, hover, scroll, or key. Each widget is wrapped in a 680px page carrying light-mode stand-ins
// for the host's CSS variables and SVG helper classes, then shot with headless Chrome at its full height.
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const chrome = process.env.EV_CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const hostCss = `
:root{--text-primary:#1f1e1d;--text-secondary:#5f5e5a;--text-muted:#888780;--text-accent:#185FA5;--text-danger:#A32D2D;--text-success:#3B6D11;--text-warning:#854F0B;
--surface-0:#f1efe8;--surface-1:#faf9f5;--surface-2:#ffffff;--bg-neutral:#f1efe8;--bg-accent:#E6F1FB;--bg-accent-muted:rgba(55,138,221,.1);--bg-success:#EAF3DE;--bg-warning:#FAEEDA;--bg-danger:#FCEBEB;
--border:rgba(0,0,0,.12);--border-strong:rgba(0,0,0,.25);--border-stronger:rgba(0,0,0,.4);--border-accent:#378ADD;--border-success:#97C459;--border-warning:#EF9F27;--border-danger:#F09595;
--radius:8px;--font-sans:-apple-system,"Helvetica Neue",sans-serif;--font-mono:Menlo,monospace;--font-voice:Georgia,serif;
--p:#1f1e1d;--s:#5f5e5a;--t:#888780;--bg2:#faf9f5;--b:rgba(0,0,0,.12)}
html,body{margin:0;background:#faf9f5;color:var(--text-primary);font-family:var(--font-sans);font-size:16px;line-height:1.7}
#w{width:680px;padding:8px 0}
button{font:inherit;font-size:14px;padding:6px 12px;border:0.5px solid var(--border-strong);border-radius:var(--radius);background:transparent;color:var(--text-primary)}
svg .t{font:14px var(--font-sans);fill:var(--text-primary)} svg .ts{font:12px var(--font-sans);fill:var(--text-secondary)} svg .th{font:500 14px var(--font-sans);fill:var(--text-primary)}
svg .box{fill:var(--surface-1);stroke:var(--border-strong)} svg .arr{stroke:var(--text-secondary);stroke-width:1.5;fill:none} svg .leader{stroke:var(--text-muted);stroke-width:.5;stroke-dasharray:3 3;fill:none}
${[['purple', '#EEEDFE', '#534AB7', '#3C3489'], ['teal', '#E1F5EE', '#0F6E56', '#085041'], ['coral', '#FAECE7', '#993C1D', '#712B13'], ['pink', '#FBEAF0', '#993556', '#72243E'], ['gray', '#F1EFE8', '#5F5E5A', '#444441'], ['blue', '#E6F1FB', '#185FA5', '#0C447C'], ['green', '#EAF3DE', '#3B6D11', '#27500A'], ['amber', '#FAEEDA', '#854F0B', '#633806'], ['red', '#FCEBEB', '#A32D2D', '#791F1F']]
    .map(([c, fill, stroke, text]) => `svg .c-${c}>rect,svg .c-${c}>circle,svg .c-${c}>ellipse,svg rect.c-${c},svg circle.c-${c},svg ellipse.c-${c}{fill:${fill};stroke:${stroke}} svg .c-${c}>text{fill:${text}}`).join('\n')}
`;

export function wrapWidget(code) {
  return `<!doctype html><html data-mode="light"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css">
<style>${hostCss}</style></head><body><div id="w">${code}</div>
<script>addEventListener('load',()=>setTimeout(()=>{document.title='H='+Math.ceil(document.getElementById('w').getBoundingClientRect().height+24)},600))</script>
</body></html>`;
}

function runChrome(args, timeoutMs = 60_000) {
  return new Promise((settle) => {
    const child = spawn(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    const out = [];
    child.stdout.on('data', (c) => out.push(c));
    const timer = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
    child.on('close', (status) => { clearTimeout(timer); settle({ status, stdout: Buffer.concat(out).toString('utf8') }); });
  });
}

// Writes <base>.page.html and <base>.png for one widget file; returns the png path or throws.
export async function captureWidget(widgetFile, base, profileDir) {
  const page = `${base}.page.html`;
  writeFileSync(page, wrapWidget(readFileSync(widgetFile, 'utf8')));
  const common = [`--user-data-dir=${profileDir}`, '--virtual-time-budget=5000', '--window-size=680,900'];
  const dom = await runChrome([...common, '--dump-dom', `file://${page}`]);
  const m = dom.stdout.match(/<title>H=(\d+)<\/title>/);
  const height = Math.min(Math.max(m ? Number(m[1]) : 1200, 200), 6000);
  const png = `${base}.png`;
  await runChrome([`--user-data-dir=${profileDir}`, '--virtual-time-budget=5000', `--window-size=680,${height}`, `--screenshot=${png}`, `file://${page}`]);
  if (!existsSync(png)) throw new Error(`chrome produced no screenshot for ${widgetFile}`);
  return png;
}
