// Equipment catalog and loan lifecycle: requested -> approved -> returned.
export function createLending(catalog) {
  const loans = new Map();
  let nextId = 1;

  const overlaps = (a, b) => a.from <= b.to && b.from <= a.to;
  const isFree = (itemId, range) => ![...loans.values()].some(
    (l) => l.itemId === itemId && l.status === 'approved' && overlaps(l, range),
  );

  return {
    search(query, range) {
      return catalog
        .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
        .map((item) => ({ ...item, available: isFree(item.id, range) }));
    },
    request(employee, itemId, range) {
      if (!catalog.some((item) => item.id === itemId)) throw new Error(`unknown item ${itemId}`);
      if (!isFree(itemId, range)) throw new Error('item is not available for those dates');
      const id = String(nextId++);
      loans.set(id, { id, employee, itemId, ...range, status: 'requested' });
      return id;
    },
    approve(loanId) {
      const loan = loans.get(loanId);
      if (loan?.status !== 'requested') throw new Error('only a requested loan can be approved');
      if (!isFree(loan.itemId, loan)) throw new Error('item was taken meanwhile');
      loan.status = 'approved';
    },
    confirmReturn(loanId, on) {
      const loan = loans.get(loanId);
      if (loan?.status !== 'approved') throw new Error('only an approved loan can be returned');
      loan.status = 'returned';
      loan.returnedOn = on;
      loan.overdueDays = Math.max(0, (Date.parse(on) - Date.parse(loan.to)) / 86_400_000);
    },
    holder(itemId) {
      return [...loans.values()].find((l) => l.itemId === itemId && l.status === 'approved')?.employee ?? null;
    },
    loan: (loanId) => ({ ...loans.get(loanId) }),
  };
}
