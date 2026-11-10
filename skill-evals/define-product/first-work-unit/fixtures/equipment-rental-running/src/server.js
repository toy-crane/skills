import { createServer } from 'node:http';
import { createLending } from './loans.js';

const lending = createLending([
  { id: 'cam-1', name: 'Sony A7 camera' },
  { id: 'proj-1', name: 'Epson projector' },
  { id: 'mac-1', name: 'MacBook Pro 14' },
]);

async function body(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

export const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const send = (status, data) => res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(data));
  try {
    if (req.method === 'GET' && url.pathname === '/equipment') {
      return send(200, lending.search(url.searchParams.get('q') ?? '', { from: url.searchParams.get('from'), to: url.searchParams.get('to') }));
    }
    if (req.method === 'POST' && url.pathname === '/loans') {
      const { employee, itemId, from, to } = await body(req);
      return send(201, { id: lending.request(employee, itemId, { from, to }) });
    }
    const m = url.pathname.match(/^\/loans\/([^/]+)\/(approve|return)$/);
    if (req.method === 'POST' && m) {
      if (m[2] === 'approve') lending.approve(m[1]);
      else lending.confirmReturn(m[1], (await body(req)).on);
      return send(200, lending.loan(m[1]));
    }
    return send(404, { error: 'not found' });
  } catch (error) {
    return send(400, { error: error.message });
  }
});

if (import.meta.url === `file://${process.argv[1]}`) server.listen(3000);
