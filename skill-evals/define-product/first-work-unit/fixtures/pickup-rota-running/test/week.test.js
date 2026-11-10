import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGroup } from '../src/rota.js';

test('a planned pickup ends with the parent seeing the arrival', () => {
  const group = createGroup(['서연네', '도윤네', '하린네']);
  group.planWeek({ mon: '서연네', tue: '도윤네', wed: '하린네' });
  group.pickUp('mon', '서연네', [{ name: '도윤', family: '도윤네' }, { name: '하린', family: '하린네' }]);
  group.markArrived('mon', '도윤');
  group.acknowledge('도윤네', 'mon', '도윤');
  assert.deepEqual(group.inbox('도윤네'), [{ day: 'mon', child: '도윤', by: '서연네', seen: true }]);
  assert.deepEqual(group.inbox('하린네'), []);
});

test('only the family on duty can pick up', () => {
  const group = createGroup(['서연네', '도윤네']);
  group.planWeek({ mon: '서연네' });
  assert.throws(() => group.pickUp('mon', '도윤네', []));
});
