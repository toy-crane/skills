import { createServer } from 'node:http';
import { toCsv } from './csv.js';

export const orders = [
  { id: 1, customer: 'Kim', total: 12000 },
  { id: 2, customer: 'Lee, Park & Co', total: 54000 },
  { id: 3, customer: 'The "Corner" Shop', total: 8000 },
];

const server = createServer((req, res) => {
  if (req.url === '/export.csv') {
    res.writeHead(200, { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="orders.csv"' });
    return res.end(toCsv(orders));
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(`<h1>Orders</h1><ul>${orders.map((o) => `<li>${o.customer}: ${o.total}</li>`).join('')}</ul>`);
});

server.listen(Number(process.env.PORT ?? 0), () => {
  console.log(`orders running at http://localhost:${server.address().port}/`);
});
