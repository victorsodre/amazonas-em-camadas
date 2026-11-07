import {useEffect,useRef} from 'react';
import {ArrowUpRight,X} from 'lucide-react';
import {sources,location,type SourceId} from '../content/project.ts';
export function Sources({source,onClose}:{source:SourceId|'overview'|null;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{if(source){dialog.current?.showModal();requestAnimationFrame(()=>{const target=dialog.current?.querySelector(`[data-source="${source}"]`);if(target)target.scrollIntoView({block:'nearest'});else dialog.current?.scrollTo(0,0)});}else dialog.current?.close()},[source]);
 return <dialog ref={dialog} className="sources-dialog" aria-label="Fontes e representação" onClose={onClose}>
  <div className="dialog-top"><span className="eyebrow">POR TRÁS DO EXPERIMENTO</span><button className="icon-button" aria-label="Fechar fontes" onClick={onClose}><X size={18}/></button></div>
  <h2>O que sabemos.<br/>O que desenhamos.</h2>
  <p>Referência: <strong>Óbidos, no Amazonas.</strong> A localização é documentada. O corte e a amostra de poros são ilustrações autorais, sem escala.</p>
  <div className="location-record"><span>{location.name}</span><strong>{location.label}</strong><small>{location.scope}</small></div>
  {sources.map(s=><details className="source-record" data-source={s.id} key={s.id} open={source===s.id}>
   <summary>{s.title}</summary><p className="source-author">{s.author}</p><p>{s.date}</p>
   <dl><dt>Origem</dt><dd>{s.method}</dd><dt>Resolução e referência</dt><dd>{s.resolution}</dd><dt>Limites</dt><dd>{s.scope}</dd></dl>
   <a className="source-out" href={s.url} target="_blank" rel="noreferrer">Abrir fonte original <ArrowUpRight size={14}/></a>
   {'reading' in s&&<a className="source-out" href={s.reading} target="_blank" rel="noreferrer">Texto disponibilizado pelo autor <ArrowUpRight size={14}/></a>}
  </details>)}
  <p className="credits">Direção e geometria: Victor Sodré / ovictorlab. Marca oficial e exploração inspirada no Fusquinha. Sem mapas, figuras, fotos, áudio ou malhas de terceiros incorporados.</p>
  <p className="credits">Licenças: {['bibliotecas','anton','archivo','archivo-black','jetbrains-mono'].map((f,i)=><span key={f}>{i>0&&' · '}<a href={`${import.meta.env.BASE_URL}licenses/${f}.txt`} target="_blank" rel="noreferrer">{f}</a></span>)}</p>
 </dialog>
}
