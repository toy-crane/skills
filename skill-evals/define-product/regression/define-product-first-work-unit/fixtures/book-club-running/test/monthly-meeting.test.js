import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClub } from '../src/club.js';

test('a monthly meeting runs from opening to choosing the next book', () => {
  const club = createClub();
  const id = club.openMeeting({ date: '2026-11-21', book: '작별하지 않는다', members: ['민지', '서준', '하은'] });
  club.respond(id, '민지', true);
  club.respond(id, '서준', true);
  club.respond(id, '하은', false);
  club.checkIn(id, '민지');
  club.checkIn(id, '서준');
  club.openVote(id, ['소년이 온다', '채식주의자']);
  club.castVote(id, '민지', '소년이 온다');
  club.castVote(id, '서준', '소년이 온다');
  assert.equal(club.closeVote(id), '소년이 온다');
  assert.deepEqual(club.summary(id), {
    date: '2026-11-21', book: '작별하지 않는다', attending: ['민지', '서준'], attended: ['민지', '서준'], nextBook: '소년이 온다',
  });
});

test('a non-member cannot answer or check in', () => {
  const club = createClub();
  const id = club.openMeeting({ date: '2026-11-21', book: 'x', members: ['민지'] });
  assert.throws(() => club.respond(id, '외부인', true));
  assert.throws(() => club.checkIn(id, '외부인'));
});
