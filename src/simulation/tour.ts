import type { DisplayState } from './section.ts';

/** O tour conta a história do vídeo: superfície, leito, depósitos e subsolo. Cada passo leva a cena ao seu estado. */
export const TOUR = [
  { part: 'water', view: { water: 1, separation: 0 } },
  { part: 'bed', view: { water: 0, separation: 0 } },
  { part: 'sediment', view: { water: 0, separation: 1 } },
  { part: 'substrate', view: { water: 0, separation: 1 } },
] as const satisfies ReadonlyArray<{ part: string; view: DisplayState }>;

export const STAGES = [
  { label: '01 Superfície', view: { water: 1, separation: 0 }, step: 0 },
  { label: '02 Leito', view: { water: 0, separation: 0 }, step: 1 },
  { label: '03 Camadas', view: { water: 0, separation: 1 }, step: 2 },
] as const satisfies ReadonlyArray<{ label: string; view: DisplayState; step: number }>;

export type Plan = { kind: 'guide'; step: number } | { kind: 'view'; view: DisplayState };

export const tourStepOf = (part: string) => TOUR.findIndex(step => step.part === part);

const near = (a: DisplayState, b: DisplayState) => Math.abs(a.water - b.water) < .005 && Math.abs(a.separation - b.separation) < .005;
export const activeStage = (view: DisplayState) => STAGES.findIndex(stage => near(stage.view, view));

/** Durante o tour, uma etapa avança o tour até ela em vez de encerrá-lo. */
export function planStage(index: number, tour: number | null): Plan | null {
  const stage = STAGES[index];
  if (!stage) return null;
  return tour === null ? { kind: 'view', view: stage.view } : { kind: 'guide', step: stage.step };
}

/** Retirar/repor água: fora do tour alterna a água; no tour, vai ao passo do leito ou da superfície. */
export function planWaterToggle(view: DisplayState, tour: number | null): Plan {
  const removing = view.water > .5;
  if (tour !== null) return { kind: 'guide', step: removing ? 1 : 0 };
  return { kind: 'view', view: { ...view, water: removing ? 0 : 1 } };
}
