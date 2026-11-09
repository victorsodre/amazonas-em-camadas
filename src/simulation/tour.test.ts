import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog } from '../content/catalog.ts';
import { STAGES, TOUR, activeStage, planStage, planWaterToggle, tourStepOf } from './tour.ts';

test('the tour visits every layer and drives the mechanism: water, then the exposed bed, then separated layers', () => {
  assert.deepEqual(TOUR.map(s => s.part), catalog.map(p => p.id));
  assert.deepEqual(TOUR[0].view, { water: 1, separation: 0 });
  assert.equal(TOUR[1].view.water, 0, 'the bed step removes the water');
  for (const step of TOUR.slice(2)) assert.deepEqual(step.view, { water: 0, separation: 1 });
  for (const part of catalog) assert.equal(TOUR[tourStepOf(part.id)]!.part, part.id);
  assert.equal(tourStepOf('nada'), -1);
});

test('stages and the tour never cancel each other', () => {
  for (let i = 0; i < STAGES.length; i++) {
    assert.deepEqual(planStage(i, null), { kind: 'view', view: STAGES[i]!.view });
    for (let step = 0; step < TOUR.length; step++) {
      const plan = planStage(i, step);
      assert.equal(plan?.kind, 'guide');
      if (plan?.kind === 'guide') assert.deepEqual(TOUR[plan.step]!.view, STAGES[i]!.view, 'the stage keeps the tour and shows the same state');
    }
  }
  assert.equal(planStage(9, null), null);
});

test('removing or restoring water inside the tour moves between the surface and bed steps', () => {
  assert.deepEqual(planWaterToggle({ water: 1, separation: 0 }, 0), { kind: 'guide', step: 1 });
  assert.deepEqual(planWaterToggle({ water: 0, separation: 1 }, 3), { kind: 'guide', step: 0 });
  assert.deepEqual(planWaterToggle({ water: 1, separation: .4 }, null), { kind: 'view', view: { water: 0, separation: .4 } });
  assert.deepEqual(planWaterToggle({ water: .2, separation: 0 }, null), { kind: 'view', view: { water: 1, separation: 0 } });
});

test('the active stage is recognised only at its exact state', () => {
  STAGES.forEach((stage, i) => assert.equal(activeStage(stage.view), i));
  assert.equal(activeStage({ water: .5, separation: 0 }), -1);
});
