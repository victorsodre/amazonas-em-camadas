import { video } from './content/video.ts';
import { VideoSection } from './kit/VideoSection.tsx';
import { CollectionNav } from './kit/CollectionNav.tsx';
import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight,Box,ChevronRight,Download,Focus,Layers3,MapPin,Maximize,Minus,Plus,Search,X} from 'lucide-react';
import {Brand} from './kit/Brand.tsx';
import {Sources} from './ui/Sources.tsx';
import {LayerControls} from './ui/LayerControls.tsx';
import {createScene} from './scene/runtime.ts';
import {advanceTransition,interpolateView,type DisplayState} from './simulation/section.ts';
import {project,location as place,type SourceId} from './content/project.ts';
import {catalog} from './content/catalog.ts';
import type {Mode,Part,SceneHandle} from './scene/types.ts';

type Transition={from:DisplayState;to:DisplayState;progress:number};
const initial:DisplayState={water:1,separation:0};
export function App(){
 const host=useRef<HTMLDivElement>(null),scene=useRef<SceneHandle|null>(null),inspector=useRef<HTMLElement>(null),dialog=useRef<HTMLDialogElement>(null),transitionRef=useRef<Transition|null>(null);
 const [parts,setParts]=useState<Part[]>([]),[display,setDisplay]=useState<DisplayState>(initial),[animating,setAnimating]=useState(false),[mode,setMode]=useState<Mode>('section'),[poreWater,setPoreWater]=useState(true);
 const [selected,setSelected]=useState<string|null>(null),[isolated,setIsolated]=useState(false),[wireframe,setWireframe]=useState(false),[source,setSource]=useState<SourceId|'overview'|null>(null);
 const [drawer,setDrawer]=useState(false),[search,setSearch]=useState(''),[tour,setTour]=useState<number|null>(null),[error,setError]=useState<string|null>(null),[notice,setNotice]=useState('');
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const pause=useCallback(()=>{transitionRef.current=null;setAnimating(false)},[]);
 const select=useCallback((id:string|null)=>{pause();setSelected(id);setIsolated(false);setTour(null);if(id){setMode('section');if(id==='water')setDisplay(v=>({...v,water:1}));}},[pause]);
 const current=catalog.find(p=>p.id===selected),ready=parts.length>0&&!error;
 const normalize=(v:string)=>v.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/\p{Diacritic}/gu,'');
 useEffect(()=>{
  if(!host.current)return;
  try{scene.current=createScene(host.current,select,text=>{setError(text);pause()});setParts(scene.current.parts)}catch{setError('Seu navegador não conseguiu abrir a cena 3D. As explicações e fontes continuam disponíveis.')}
  return()=>{scene.current?.dispose();scene.current=null};
 },[select,pause]);
 useEffect(()=>{scene.current?.update({...display,mode,poreWater,selected,isolated,wireframe})},[display,mode,poreWater,selected,isolated,wireframe]);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');const change=()=>{setReduced(media.matches);if(media.matches)pause()};media.addEventListener('change',change);return()=>media.removeEventListener('change',change);
 },[pause]);
 useEffect(()=>{
  if(!animating)return;let frame=0,last=performance.now();
  const tick=(now:number)=>{
   const t=transitionRef.current;if(!t)return;
   if(now-last>=32){const dt=(now-last)/1000;last=now;t.progress=advanceTransition(t.progress,dt,!document.hidden);setDisplay(interpolateView(t.from,t.to,t.progress));if(t.progress>=1){pause();return}}
   frame=requestAnimationFrame(tick);
  };frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[animating,pause]);
 useEffect(()=>{if(drawer)dialog.current?.showModal();else dialog.current?.close()},[drawer]);
 useEffect(()=>{if(selected&&innerWidth<=900){const id=requestAnimationFrame(()=>inspector.current?.scrollIntoView({block:'nearest',behavior:reduced?'instant':'smooth'}));return()=>cancelAnimationFrame(id)}},[selected,reduced]);
 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{if(document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey||e.target instanceof HTMLInputElement||source||drawer)return;if(e.key.toLowerCase()==='r')scene.current?.home();if(e.key==='Escape')select(null)};
  document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);
 },[source,drawer,select]);
 function change(value:DisplayState){pause();setDisplay(value);setIsolated(false);if(selected==='water'&&value.water<.01)setSelected(null)}
 function transition(to:DisplayState){pause();setIsolated(false);setSelected(null);setTour(null);if(reduced){setDisplay(to);return}transitionRef.current={from:display,to,progress:0};setAnimating(true)}
 function switchMode(next:Mode){pause();setMode(next);setSelected(null);setIsolated(false);setTour(null)}
 function reset(){pause();setDisplay(initial);setMode('section');setPoreWater(true);setSelected(null);setIsolated(false);setWireframe(false);setTour(null);setSearch('');requestAnimationFrame(()=>scene.current?.home());setNotice('Experiência reiniciada.')}
 function guide(index:number){const p=parts[index];if(!p)return;pause();setMode('section');setTour(index);setSelected(p.id);setIsolated(false);if(p.id==='water')setDisplay(v=>({...v,water:1}));requestAnimationFrame(()=>scene.current?.focus(p.id))}
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{setNotice('Tela cheia não disponível neste navegador.')}}
 const list=()=> <><label className="search"><Search size={16}/><input aria-label="Encontrar camada" placeholder="Encontrar camada" value={search} onChange={e=>setSearch(e.target.value)}/><span>04</span></label><div className="parts-list">{catalog.filter(p=>normalize(p.label).includes(normalize(search))).map(p=><button className={'part-row'+(p.id===selected?' selected':'')} aria-pressed={p.id===selected} key={p.id} onClick={()=>{select(p.id);setDrawer(false)}}><span style={{background:p.color}} className="layer-swatch"/><strong>{p.label}</strong><ChevronRight size={14}/></button>)}{!catalog.some(p=>normalize(p.label).includes(normalize(search)))&&<small className="search-hint">Nenhuma camada encontrada.</small>}</div></>;
 return <div className="app"><header className="header"><Brand/><div className="collection-label">O MUNDO POR DENTRO <span>/</span> LAB 06</div><a className="video-link" href="#video">Ver o vídeo <ArrowUpRight size={16}/></a></header>
 <main className={'workspace river-workspace '+(mode==='pores'?'pore-mode':'')}>
  <div className="heading"><p className="eyebrow"><span/>EXPERIMENTO 06 <i>—</i> ABAIXO DA SUPERFÍCIE</p><h1>AMAZONAS<br/>EM CAMADAS<span>.</span></h1><p className="intro">{project.intro}</p><button className="location-button" onClick={()=>setSource('chm')}><MapPin size={13}/>{place.name}<ArrowUpRight size={12}/></button></div>
  <div className="canvas-region"><div className="scene-host" ref={host}/>{error&&<div className="scene-error" role="alert"><Box size={28}/><h2>Cena indisponível</h2><p>{error}</p><button className="primary" onClick={()=>location.reload()}>Tentar novamente</button></div>}<div className="scene-mode"><span className="status-dot"/>{mode==='pores'?'AMOSTRA AMPLIADA':'CORTE ILUSTRATIVO'}<span className="mode-divider"/>SEM ESCALA</div><div className="orbit-hint">Arraste para girar <span>·</span>{mode==='pores'?'Água entre os grãos':'Geometria autoral'}</div></div>
  <aside className="sidebar">{mode==='section'?<><div className="sidebar-label">DA SUPERFÍCIE AO SUBSOLO.</div>{list()}<div className="sidebar-foot"><span className="mini-line"/><p>Uma localização real.<br/>Um corte ilustrativo, sem escala.</p><button className="text-button" disabled={!ready} onClick={()=>guide(0)}>Conhecer as camadas <ArrowRight size={15}/></button></div></>:<div className="pore-story"><span className="sidebar-label">ÁGUA SUBTERRÂNEA</span><h2>Entre os grãos.</h2><p>A água ocupa espaços no material. Poros conectados permitem sua passagem.</p><p className="muted">Esta amostra é ampliada e conceitual. Não representa o tamanho dos grãos ou um aquífero de Óbidos.</p><button className="text-button" onClick={()=>setSource('usgs')}>Entender a representação <ArrowRight size={15}/></button></div>}<button className="hamza-button" onClick={()=>setSource('hamza')}>E o chamado Hamza?<ArrowUpRight size={14}/></button></aside>
  <nav className="view-switch" aria-label="Vista da experiência"><button aria-pressed={mode==='section'} className={mode==='section'?'active':''} onClick={()=>switchMode('section')}>Trecho em corte</button><button aria-pressed={mode==='pores'} className={mode==='pores'?'active':''} onClick={()=>switchMode('pores')}>Água nos poros</button></nav>
  <div className="camera-tools"><button aria-label="Aproximar" disabled={!ready} onClick={()=>scene.current?.zoom(.85)}><Plus size={18}/></button><button aria-label="Afastar" disabled={!ready} onClick={()=>scene.current?.zoom(1.15)}><Minus size={18}/></button><span/><button aria-label="Reenquadrar" disabled={!ready} onClick={()=>scene.current?.home()}><Focus size={18}/></button><button aria-label="Mostrar malha" disabled={!ready} aria-pressed={wireframe} onClick={()=>setWireframe(v=>!v)}><Box size={18}/></button><span/><button aria-label="Salvar imagem PNG" disabled={!ready} onClick={()=>scene.current?.capture()}><Download size={18}/></button><button className="format-button" aria-label="Salvar imagem vertical 9 por 16" disabled={!ready} onClick={()=>scene.current?.capture(true)}>9:16</button>{Boolean(document.documentElement.requestFullscreen)&&<button aria-label="Tela cheia" onClick={fullscreen}><Maximize size={17}/></button>}</div>
  {current&&<section className="inspector" ref={inspector} aria-label="Camada selecionada"><div className="inspector-top"><span className="eyebrow">{tour===null?'EM DETALHE':`CONHEÇA AS CAMADAS · ${tour+1}/4`}</span><button className="icon-button" aria-label="Fechar detalhe" onClick={()=>select(null)}><X size={16}/></button></div><h2>{current.label}</h2><p>{current.detail}</p><small>{current.note}</small><button className="part-source" onClick={()=>setSource(current.sourceId)}>Fonte e limites <ArrowUpRight size={12}/></button><div className="inspector-actions"><button disabled={!ready} aria-pressed={isolated} onClick={()=>{pause();setIsolated(v=>!v)}}><Layers3 size={14}/>{isolated?'Ver todas as camadas':'Isolar'}</button><button disabled={!ready} onClick={()=>scene.current?.focus(current.id)}><Focus size={14}/>Aproximar</button></div>{tour!==null&&<div className="inspector-actions"><button disabled={tour===0} onClick={()=>guide(tour-1)}><ArrowLeft size={14}/>Anterior</button><button onClick={()=>tour<3?guide(tour+1):setTour(null)}>{tour<3?'Próxima camada':'Concluir'}<ArrowRight size={14}/></button></div>}</section>}
  {mode==='pores'&&<div className="pore-explanation"><h2>Água entre os grãos.</h2><p>Poros conectados permitem a passagem da água. Amostra ampliada e ilustrativa, sem representar um aquífero de Óbidos.</p></div>}
  <div className="mobile-actions">{mode==='section'?<><button onClick={()=>setDrawer(true)}><Layers3 size={16}/>Camadas <span>4</span></button><button disabled={!ready} onClick={()=>guide(0)}>Conhecer as camadas <ArrowRight size={16}/></button></>:<button onClick={()=>setSource('usgs')}>Entender os poros <ArrowUpRight size={16}/></button>}</div>
  {mode==='section'?<LayerControls value={display} animating={animating} disabled={!ready} change={change} transition={transition} pause={pause} reset={reset}/>:<section className="control-dock river-dock pore-dock" aria-label="Explorar os poros"><button className="primary" disabled={!ready} aria-pressed={poreWater} onClick={()=>setPoreWater(v=>!v)}>{poreWater?'Ocultar água dos poros':'Mostrar água dos poros'}</button><span>Grãos sólidos · espaços com água</span><button className="icon-button" aria-label="Reiniciar experiência" onClick={reset}><RotateIcon/></button></section>}
  <div className="representation-note"><span>{mode==='pores'?'MODELO CONCEITUAL · NÃO É UM CANAL SUBTERRÂNEO':'FORMAS E ESPESSURAS ILUSTRATIVAS · SEM ESCALA'}</span><button onClick={()=>setSource('hamza')}>E o Hamza? <ArrowUpRight size={12}/></button></div>
 </main><VideoSection video={video}/><footer><span>UM EXPERIMENTO DO OVICTORLAB <i>© 2026</i></span><button onClick={()=>setSource('overview')}>Como representamos · Fontes e créditos <ArrowUpRight size={13}/></button><CollectionNav current="amazonas-em-camadas"/></footer>
 <Sources source={source} onClose={()=>setSource(null)}/><dialog ref={dialog} className="parts-dialog" aria-label="Camadas do Amazonas" onClose={()=>setDrawer(false)}><div className="dialog-top"><span className="eyebrow">CONHEÇA AS CAMADAS</span><button className="icon-button" aria-label="Fechar camadas" onClick={()=>setDrawer(false)}><X size={18}/></button></div>{list()}</dialog><span className="sr-only" role="status" aria-live="polite">{notice}</span></div>
}
function RotateIcon(){return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/></svg>}
