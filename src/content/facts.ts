import type { SourceId } from './project.ts';

/** Números do vídeo (EP096). Cada valor aponta para a ficha da fonte em project.ts. */
export const MEAN_DISCHARGE_M3S = 209_000;
export const OLYMPIC_POOL_M3 = 50 * 25 * 2;
export const CRISTO_M = 38;
export const DIVER_LIMIT_M = 40;
export const DEEP_STRETCH_M = 100;
export const DEEPEST_WEST_PARA_M = 120;
export const HAMZA_DEPTH_M = 4_000;
export const HAMZA_SPEED_M_PER_YEAR = [10, 100] as const;

export const poolsPerSecond = (discharge = MEAN_DISCHARGE_M3S) => discharge / OLYMPIC_POOL_M3;
export const roundDownToTen = (value: number) => Math.floor(value / 10) * 10;
export const metersPerYearToCmPerDay = (metersPerYear: number) => metersPerYear * 100 / 365.25;
/** Posição de uma profundidade numa régua linear de 0 a `max`, em %. */
export const depthPercent = (depth: number, max: number) =>
  Number.isFinite(depth) && max > 0 ? Math.max(0, Math.min(100, depth / max * 100)) : 0;

const number = (value: number) => value.toLocaleString('pt-BR');
const [slow, fast] = HAMZA_SPEED_M_PER_YEAR;
export const hamzaCmPerDay = `${Math.round(metersPerYearToCmPerDay(slow))} a ${Math.round(metersPerYearToCmPerDay(fast))} cm por dia`;
export const poolsLabel = `mais de ${roundDownToTen(poolsPerSecond())} piscinas olímpicas por segundo`;
export const hamzaTimesDeeper = HAMZA_DEPTH_M / DEEP_STRETCH_M;

export type Fact = { value: string; text: string; sourceId: SourceId };

export const facts = {
  discharge: { value: `${number(MEAN_DISCHARGE_M3S / 1000)} mil m³/s`, text: `Vazão média do Amazonas entre 1973 e 1990: ${poolsLabel}.`, sourceId: 'vazao' },
  muddy: { value: '≈ 0,1 g/L', text: 'de sedimento perto de Manaus. Água branca é barrenta e turva: a luz não chega ao fundo.', sourceId: 'agua-branca' },
  depth: { value: `+${DEEP_STRETCH_M} m`, text: `Trechos do Amazonas passam de ${DEEP_STRETCH_M} m; no oeste do Pará, chegam a ${DEEPEST_WEST_PARA_M} m.`, sourceId: 'profundidade' },
  diver: { value: `${DIVER_LIMIT_M} m`, text: 'Limite do mergulho humano, mesmo com equipamento especial. Abaixo disso, só instrumentos.', sourceId: 'mergulho' },
  hamzaDepth: { value: `≈ ${number(HAMZA_DEPTH_M)} m`, text: `Profundidade do fluxo chamado rio Hamza, ${hamzaTimesDeeper} vezes um trecho de ${DEEP_STRETCH_M} m. Fica muito abaixo deste corte.`, sourceId: 'hamza-numeros' },
  hamzaSpeed: { value: `${slow}–${fast} m/ano`, text: `Água atravessando rocha porosa: de ${hamzaCmPerDay}. Não é um rio em túnel.`, sourceId: 'hamza-numeros' },
} as const satisfies Record<string, Fact>;

export type DepthMark = { depth: number; label: string; sourceId: SourceId };

/** Régua do rio, 0 a 120 m, em escala. */
export const riverMarks: readonly DepthMark[] = [
  { depth: DIVER_LIMIT_M, label: 'limite do mergulho humano', sourceId: 'mergulho' },
  { depth: CRISTO_M * 2, label: 'dois Cristos Redentores empilhados', sourceId: 'cristo' },
  { depth: DEEP_STRETCH_M, label: 'trechos do Amazonas passam disso', sourceId: 'profundidade' },
  { depth: DEEPEST_WEST_PARA_M, label: 'mais fundo, no oeste do Pará', sourceId: 'profundidade' },
];

/** Régua até o Hamza, 0 a 4.000 m, em escala. */
export const deepMarks: readonly DepthMark[] = [
  { depth: DEEPEST_WEST_PARA_M, label: 'o rio inteiro cabe nesta faixa', sourceId: 'profundidade' },
  { depth: HAMZA_DEPTH_M, label: 'água do Hamza, pela rocha porosa', sourceId: 'hamza-numeros' },
];
