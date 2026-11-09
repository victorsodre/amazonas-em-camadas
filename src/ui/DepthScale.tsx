import type {CSSProperties} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {sources,type SourceId} from '../content/project.ts';
import {DEEPEST_WEST_PARA_M,HAMZA_DEPTH_M,deepMarks,depthPercent,facts,riverMarks,type DepthMark} from '../content/facts.ts';

const metres=(value:number)=>`${value.toLocaleString('pt-BR')} m`;

function Ruler({title,max,marks,band,deep=false,refs}:{title:string;max:number;marks:readonly DepthMark[];band:number;deep?:boolean;refs:Map<SourceId,number>}){
 return <figure className={'scale-column'+(deep?' scale-column--deep':'')}>
  <figcaption>{title}</figcaption>
  <div className="scale-ruler">
   <div className="scale-track" aria-hidden="true"><span className="scale-water" style={{'--depth':`${depthPercent(band,max)}%`} as CSSProperties}/>{deep&&<span className="scale-rock"/>}</div>
   <ol className="scale-marks">{marks.map(m=><li key={m.depth} style={{'--at':`${depthPercent(m.depth,max)}%`} as CSSProperties}><strong>{metres(m.depth)}</strong><span>{m.label}<sup>{refs.get(m.sourceId)}</sup></span></li>)}</ol>
  </div>
 </figure>;
}

export function DepthScale({openSource}:{openSource:(id:SourceId)=>void}){
 const cited=[...new Set([...riverMarks,...deepMarks].map(m=>m.sourceId).concat(facts.discharge.sourceId,facts.hamzaSpeed.sourceId))];
 const refs=new Map(cited.map((id,i)=>[id,i+1]));
 return <section id="escala" className="scale-section" aria-labelledby="scale-title" tabIndex={-1}>
  <div className="scale-inner">
   <div className="scale-copy">
    <p className="eyebrow"><span/>EM ESCALA REAL <i>—</i> OS NÚMEROS DO VÍDEO</p>
    <h2 id="scale-title">O FUNDO DO AMAZONAS<br/>TEM OUTRO FUNDO.</h2>
    <p>O corte 3D é ilustrativo e não tem escala. Aqui as profundidades estão em escala, cada uma com a sua fonte.</p>
    <dl className="scale-facts">
     {[facts.discharge,facts.hamzaSpeed].map(f=><div key={f.value}><dt>{f.value}</dt><dd>{f.text}<sup>{refs.get(f.sourceId)}</sup></dd></div>)}
    </dl>
    <p className="scale-caveat">O Hamza foi inferido pela temperatura de poços: é água atravessando rocha porosa, não um túnel. Se é rio mesmo, ainda se discute. A profundidade em Óbidos varia entre as fontes consultadas.</p>
   </div>
   <div className="scale-charts">
    <Ruler title={`O RIO · 0 A ${DEEPEST_WEST_PARA_M} M`} max={DEEPEST_WEST_PARA_M} band={DEEPEST_WEST_PARA_M} marks={riverMarks} refs={refs}/>
    <Ruler title={`ATÉ O HAMZA · 0 A ${HAMZA_DEPTH_M.toLocaleString('pt-BR')} M`} max={HAMZA_DEPTH_M} band={DEEPEST_WEST_PARA_M} marks={deepMarks} deep refs={refs}/>
   </div>
   <ol className="scale-sources" aria-label="Fontes dos números">{cited.map((id,i)=><li key={id}><button onClick={()=>openSource(id)}><sup>{i+1}</sup>{sources.find(s=>s.id===id)?.title}<ArrowUpRight size={13}/></button></li>)}</ol>
  </div>
 </section>;
}
