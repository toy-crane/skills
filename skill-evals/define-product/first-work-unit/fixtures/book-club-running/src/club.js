// In-memory store for one book club's monthly meetings.
export function createClub() {
  const meetings = new Map();
  let nextId = 1;

  function get(id) {
    const meeting = meetings.get(id);
    if (!meeting) throw new Error(`no meeting ${id}`);
    return meeting;
  }

  return {
    openMeeting({ date, book, members }) {
      const id = String(nextId++);
      meetings.set(id, { id, date, book, members, rsvps: {}, attended: new Set(), vote: null, nextBook: null });
      return id;
    },
    respond(id, member, attending) {
      const meeting = get(id);
      if (!meeting.members.includes(member)) throw new Error(`${member} is not a member`);
      meeting.rsvps[member] = attending;
    },
    checkIn(id, member) {
      const meeting = get(id);
      if (!meeting.members.includes(member)) throw new Error(`${member} is not a member`);
      meeting.attended.add(member);
    },
    openVote(id, candidates) {
      get(id).vote = { candidates, ballots: {} };
    },
    castVote(id, member, book) {
      const { vote } = get(id);
      if (!vote) throw new Error('vote is not open');
      if (!vote.candidates.includes(book)) throw new Error(`${book} is not a candidate`);
      vote.ballots[member] = book;
    },
    closeVote(id) {
      const meeting = get(id);
      const tally = new Map(meeting.vote.candidates.map((b) => [b, 0]));
      for (const book of Object.values(meeting.vote.ballots)) tally.set(book, tally.get(book) + 1);
      meeting.nextBook = [...tally].sort((a, b) => b[1] - a[1])[0][0];
      return meeting.nextBook;
    },
    summary(id) {
      const meeting = get(id);
      const attending = Object.entries(meeting.rsvps).filter(([, yes]) => yes).map(([m]) => m);
      return { date: meeting.date, book: meeting.book, attending, attended: [...meeting.attended], nextBook: meeting.nextBook };
    },
  };
}
