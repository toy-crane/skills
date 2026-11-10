// Markets and seller applications. Acceptance, payment, and booth assignment are not built yet.
export function createMarkets() {
  const markets = new Map();
  let nextId = 1;
  return {
    open({ name, date, booths }) {
      const id = String(nextId++);
      markets.set(id, { id, name, date, booths, applications: [] });
      return id;
    },
    apply(marketId, seller, goods) {
      const market = markets.get(marketId);
      if (!market) throw new Error(`no market ${marketId}`);
      if (market.applications.some((a) => a.seller === seller)) throw new Error('already applied');
      market.applications.push({ seller, goods, status: 'applied' });
    },
    applications: (marketId) => markets.get(marketId).applications.map((a) => ({ ...a })),
    // TODO: accept(marketId, seller)
    // TODO: recordPayment(marketId, seller)
    // TODO: assignBooth(marketId, seller)
  };
}
