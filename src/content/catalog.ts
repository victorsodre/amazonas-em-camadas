import type { SourceId } from './project.ts';
export const catalog=[
 {id:'water',label:'Água do rio',color:'#6b8b80',detail:'Retire a água da vista para enxergar o fundo. O controle altera a visibilidade, sem simular seca ou nível do rio.',note:'Superfície e volume ilustrativos. Sem dados hidrológicos ao vivo.',sourceId:'unb'},
 {id:'bed',label:'Leito e margens',color:'#a8af83',detail:'O leito é a superfície sobre a qual a água escoa. Em Óbidos, levantamentos registram dunas, sulcos e outras irregularidades.',note:'As formas desta cena são autorais; não reproduzem o levantamento.',sourceId:'unb'},
 {id:'sediment',label:'Depósitos sedimentares',color:'#c8a274',detail:'Materiais acumulados formam depósitos sob o leito. Separar a camada ajuda a distinguir o material da superfície que a água toca.',note:'Espessura, continuidade e divisão em camadas não foram medidas para este modelo.',sourceId:'unb'},
 {id:'substrate',label:'Subsolo sedimentar',color:'#9e7765',detail:'A região de Óbidos inclui rochas sedimentares. Sua composição e seus espaços internos influenciam como a água pode se mover.',note:'Esquema conceitual. Não é coluna estratigráfica, sondagem ou mapa de aquífero.',sourceId:'unb'},
] as const satisfies ReadonlyArray<{id:string;label:string;color:string;detail:string;note:string;sourceId:SourceId}>;
export type PartId=typeof catalog[number]['id'];
