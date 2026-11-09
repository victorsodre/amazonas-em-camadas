import test from 'node:test';
import assert from 'node:assert/strict';
import { sources } from './project.ts';
import { catalog } from './catalog.ts';
import { DEEPEST_WEST_PARA_M, HAMZA_DEPTH_M, deepMarks, depthPercent, facts, hamzaCmPerDay, metersPerYearToCmPerDay, poolsLabel, poolsPerSecond, riverMarks } from './facts.ts';

test('video numbers keep their arithmetic: 209 mil m³/s is more than 80 Olympic pools per second', () => {
  assert.ok(Math.abs(poolsPerSecond() - 83.6) < 1e-9);
  assert.equal(poolsLabel, 'mais de 80 piscinas olímpicas por segundo');
  assert.equal(facts.discharge.value, '209 mil m³/s');
});

test('Hamza speed of 10–100 m per year reads as 3 to 27 cm per day', () => {
  assert.ok(Math.abs(metersPerYearToCmPerDay(365.25) - 100) < 1e-9);
  assert.equal(hamzaCmPerDay, '3 a 27 cm por dia');
  assert.equal(facts.hamzaDepth.value, '≈ 4.000 m');
});

test('depth rulers are in real scale, ordered and inside their range', () => {
  for (const [marks, max] of [[riverMarks, DEEPEST_WEST_PARA_M], [deepMarks, HAMZA_DEPTH_M]] as const) {
    for (let i = 1; i < marks.length; i++) assert.ok(marks[i]!.depth > marks[i - 1]!.depth);
    for (const m of marks) assert.ok(m.depth > 0 && m.depth <= max);
  }
  assert.ok(Math.abs(depthPercent(40, 120) - 100 / 3) < 1e-9);
  assert.equal(depthPercent(120, 4000), 3);
  assert.equal(depthPercent(-5, 100), 0);
  assert.equal(depthPercent(9999, 100), 100);
  assert.equal(depthPercent(NaN, 100), 0);
  assert.equal(depthPercent(10, 0), 0);
});

test('every number on screen points to an existing source record with date and limits', () => {
  const ids = new Set<string>(sources.map(s => s.id));
  const cited: string[] = [...riverMarks, ...deepMarks, ...Object.values(facts), ...catalog.flatMap(p => [...p.facts])].map((f: { sourceId: string }) => f.sourceId);
  for (const id of cited) assert.ok(ids.has(id), `fonte ausente: ${id}`);
  for (const s of sources) assert.ok(s.date.length > 0 && s.scope.length > 0 && /^https:\/\//.test(s.url));
});

test('the Hamza is never described as a tunnel river without the caveat', () => {
  assert.match(facts.hamzaSpeed.text, /Não é um rio em túnel/);
  const record = sources.find(s => s.id === 'hamza-numeros')!;
  assert.match(record.scope, /não um rio em túnel/);
});
