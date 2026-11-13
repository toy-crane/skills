const cell = (value) => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export function toCsv(orders) {
  const rows = orders.map((o) => [o.id, o.customer, o.total].map(cell).join(','));
  return ['id,customer,total', ...rows].join('\n') + '\n';
}
