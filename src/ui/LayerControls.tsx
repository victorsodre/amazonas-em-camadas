import type {CSSProperties} from 'react';
import {Droplets,Layers3,Pause,RotateCcw} from 'lucide-react';
import type {DisplayState} from '../simulation/section.ts';
export function LayerControls({value,animating,disabled,change,transition,pause,reset}:{value:DisplayState;animating:boolean;disabled:boolean;change:(value:DisplayState)=>void;transition:(value:DisplayState)=>void;pause:()=>void;reset:()=>void}){
 return <section className="control-dock river-dock" aria-label="Explorar as camadas">
  <div className="dock-top"><button className="primary" disabled={disabled} onClick={()=>animating?pause():transition({...value,water:value.water>.5?0:1})}>{animating?<Pause size={16}/>:<Droplets size={16}/>} {animating?'Pausar transição':value.water>.5?'Retirar água':'Repor água'}</button><div className="phase-copy"><strong>{value.separation>.1?'Camadas separadas':value.water<.05?'Leito exposto':'Abaixo da superfície'}</strong><span>{value.separation>.1?'Os intervalos são aberturas de visualização.':'Retirar água muda a vista, sem simular uma seca.'}</span></div><button className="icon-button" aria-label="Reiniciar experiência" onClick={reset}><RotateCcw size={18}/></button></div>
  <div className="range-pair">
   <label>Água visível <output>{Math.round(value.water*100)}%</output><input aria-label="Água visível" type="range" min="0" max="100" step="1" value={value.water*100} disabled={disabled} style={{'--progress':`${value.water*100}%`} as CSSProperties} onChange={e=>change({...value,water:Number(e.target.value)/100})}/></label>
   <label>Separar camadas <output>{Math.round(value.separation*100)}%</output><input aria-label="Separar camadas" type="range" min="0" max="100" step="1" value={value.separation*100} disabled={disabled} style={{'--progress':`${value.separation*100}%`} as CSSProperties} onChange={e=>change({...value,separation:Number(e.target.value)/100})}/></label>
  </div>
  <div className="stage-buttons" aria-label="Etapas da exploração"><button disabled={disabled} aria-pressed={value.water===1&&value.separation===0} onClick={()=>transition({water:1,separation:0})}>01 Superfície</button><button disabled={disabled} aria-pressed={value.water===0&&value.separation===0} onClick={()=>transition({water:0,separation:0})}>02 Leito</button><button disabled={disabled} aria-pressed={value.separation===1&&value.water===0} onClick={()=>transition({water:0,separation:1})}><Layers3 size={13}/>03 Camadas</button></div>
 </section>
}
