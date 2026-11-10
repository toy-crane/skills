import { createServer } from 'node:http';
import { createClub } from './club.js';

const club = createClub();

async function body(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

const routes = {
  'POST /meetings': async (req) => ({ id: club.openMeeting(await body(req)) }),
  'POST /meetings/:id/rsvp': async (req, id) => { const { member, attending } = await body(req); club.respond(id, member, attending); return { ok: true }; },
  'POST /meetings/:id/check-in': async (req, id) => { const { member } = await body(req); club.checkIn(id, member); return { ok: true }; },
  'POST /meetings/:id/vote': async (req, id) => { club.openVote(id, (await body(req)).candidates); return { ok: true }; },
  'POST /meetings/:id/ballots': async (req, id) => { const { member, book } = await body(req); club.castVote(id, member, book); return { ok: true }; },
  'POST /meetings/:id/vote/close': async (_req, id) => ({ nextBook: club.closeVote(id) }),
  'GET /meetings/:id': async (_req, id) => club.summary(id),
};

export const server = createServer(async (req, res) => {
  const [path] = req.url.split('?');
  const id = path.match(/^\/meetings\/([^/]+)/)?.[1];
  const key = `${req.method} ${id ? path.replace(`/meetings/${id}`, '/meetings/:id') : path}`;
  const handler = routes[key];
  if (!handler) { res.writeHead(404).end(); return; }
  try {
    res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(await handler(req, id)));
  } catch (error) {
    res.writeHead(400, { 'content-type': 'application/json' }).end(JSON.stringify({ error: error.message }));
  }
});

if (import.meta.url === `file://${process.argv[1]}`) server.listen(3000);
