export function listPage(orders) {
  return `<h1>Orders</h1><ul>${orders.map((o) => `<li>${o.customer}: ${o.total}</li>`).join('')}</ul>`;
}
