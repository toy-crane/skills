// Weekly pickup rota for one daycare group.
export function createGroup(families) {
  const week = new Map();
  const pickups = new Map();
  const notices = new Map(families.map((f) => [f, []]));

  return {
    planWeek(assignments) {
      for (const [day, family] of Object.entries(assignments)) {
        if (!families.includes(family)) throw new Error(`${family} is not in this group`);
        week.set(day, family);
      }
    },
    dutyOn: (day) => week.get(day) ?? null,
    pickUp(day, family, children) {
      if (week.get(day) !== family) throw new Error(`${family} is not on duty on ${day}`);
      pickups.set(day, { by: family, children: Object.fromEntries(children.map((c) => [c.name, { home: c.family, arrived: false }])) });
    },
    markArrived(day, child) {
      const pickup = pickups.get(day);
      const entry = pickup?.children[child];
      if (!entry) throw new Error(`${child} was not picked up on ${day}`);
      entry.arrived = true;
      notices.get(entry.home).push({ day, child, by: pickup.by, seen: false });
    },
    inbox: (family) => notices.get(family),
    acknowledge(family, day, child) {
      const notice = notices.get(family).find((n) => n.day === day && n.child === child);
      if (!notice) throw new Error('no such arrival notice');
      notice.seen = true;
    },
  };
}
