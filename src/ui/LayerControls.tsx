import type {CSSProperties} from 'react';
import {Droplets,Layers3,Pause,RotateCcw} from 'lucide-react';
import type {DisplayState} from '../simulation/section.ts';
import {STAGES,activeStage} from '../simulation/tour.ts';

function phase(value:DisplayState){
 if(value.separation>.1)return {title:'Camadas separadas',text:'Os intervalos são aberturas de visualização, não vazios naturais.'};
 if(value.water<.05)return {title:'Leito exposto',text:'Retirar a água muda a vista, sem simular uma seca.'};
 return {title:'Abaixo da superfície',text:'Água barrenta e turva: a luz não chega ao fundo.'};
}

export function LayerControls({value,animating,disabled,change,stage,toggleWater,pause,reset}:{value:DisplayState;animating:boolean;disabled:boolean;change:(value:DisplayState)=>void;stage:(index:number)=>void;toggleWater:()=>void;pause:()=>void;reset:()=>void}){
 const current=phase(value),active=activeStage(value);
 return <section className="control-dock river-dock" aria-label="Explorar as camadas">
  <div className="dock-top">
   <button className="primary" disabled={disabled} onClick={()=>animating?pause():toggleWater()}>{animating?<Pause size={16}/>:<Droplets size={16}/>} {animating?'Pausar transição':value.water>.5?'Retirar água':'Repor água'}</button>
   <div className="phase-copy" aria-live="polite"><strong>{current.title}</strong><span>{current.text}</span></div>
   <button className="icon-button" aria-label="Reiniciar experiência" onClick={reset}><RotateCcw size={18}/></button>
  </div>
  <div className="range-pair">
   <label>Água visível <output>{Math.round(value.water*100)}%</output><input aria-label="Água visível" type="range" min="0" max="100" step="1" value={Math.round(value.water*100)} disabled={disabled} style={{'--progress':`${value.water*100}%`} as CSSProperties} onChange={e=>change({...value,water:Number(e.target.value)/100})}/></label>
   <label>Separar camadas <output>{Math.round(value.separation*100)}%</output><input aria-label="Separar camadas" type="range" min="0" max="100" step="1" value={Math.round(value.separation*100)} disabled={disabled} style={{'--progress':`${value.separation*100}%`} as CSSProperties} onChange={e=>change({...value,separation:Number(e.target.value)/100})}/></label>
  </div>
  <div className="stage-buttons" role="group" aria-label="Etapas da exploração">{STAGES.map((s,i)=><button key={s.label} disabled={disabled} aria-pressed={active===i} onClick={()=>stage(i)}>{i===2&&<Layers3 size={13}/>}{s.label}</button>)}</div>
 </section>
}
