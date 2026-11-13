import { createServer } from 'node:http';
import { orders } from './orders.js';
import { listPage } from './page.js';

const server = createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(listPage(orders));
});

server.listen(Number(process.env.PORT ?? 0), () => {
  console.log(`orders running at http://localhost:${server.address().port}/`);
});
