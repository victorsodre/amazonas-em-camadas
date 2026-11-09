import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight,Box,ChevronRight,Download,Focus,Layers3,MapPin,Maximize,Minus,Plus,Ruler,Search,X} from 'lucide-react';
import {Brand} from './kit/Brand.tsx';
import {CollectionNav} from './kit/CollectionNav.tsx';
import {VideoSection} from './kit/VideoSection.tsx';
import {video} from './content/video.ts';
import {Sources} from './ui/Sources.tsx';
import {LayerControls} from './ui/LayerControls.tsx';
import {DepthScale} from './ui/DepthScale.tsx';
import {advanceTransition,interpolateView,type DisplayState} from './simulation/section.ts';
import {TOUR,planStage,planWaterToggle,tourStepOf,type Plan} from './simulation/tour.ts';
import {project,location as place,type SourceId} from './content/project.ts';
import {catalog,type PartId} from './content/catalog.ts';
import type {Mode,SceneHandle} from './scene/types.ts';

type Transition={from:DisplayState;to:DisplayState;progress:number};
const initial:DisplayState=TOUR[0].view;
const normalize=(v:string)=>v.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/\p{Diacritic}/gu,'');
const pad=(n:number)=>String(n).padStart(2,'0');

export function App(){
 const host=useRef<HTMLDivElement>(null),scene=useRef<SceneHandle|null>(null),inspector=useRef<HTMLElement>(null),dialog=useRef<HTMLDialogElement>(null);
 const transitionRef=useRef<Transition|null>(null),displayRef=useRef<DisplayState>(initial);
 const [ready,setReady]=useState(false),[display,setDisplay]=useState<DisplayState>(initial),[animating,setAnimating]=useState(false),[mode,setMode]=useState<Mode>('section'),[poreWater,setPoreWater]=useState(true);
 const [selected,setSelected]=useState<PartId|null>(null),[isolated,setIsolated]=useState(false),[wireframe,setWireframe]=useState(false),[source,setSource]=useState<SourceId|'overview'|null>(null);
 const [drawer,setDrawer]=useState(false),[search,setSearch]=useState(''),[tour,setTour]=useState<number|null>(null),[error,setError]=useState<string|null>(null),[notice,setNotice]=useState('');
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 const reducedRef=useRef(reduced);reducedRef.current=reduced;displayRef.current=display;
 const usable=ready&&!error,current=catalog.find(p=>p.id===selected);
 const filtered=catalog.filter(p=>normalize(p.label).includes(normalize(search)));

 const pause=useCallback(()=>{transitionRef.current=null;setAnimating(false)},[]);
 /** Animate the scene to a state. Never touches the tour or the selection. */
 const animateTo=useCallback((to:DisplayState)=>{
  const from=displayRef.current;
  if(reducedRef.current||(from.water===to.water&&from.separation===to.separation)){pause();setDisplay(to);return}
  transitionRef.current={from,to,progress:0};setAnimating(true);
 },[pause]);
 const guide=useCallback((index:number)=>{
  const step=TOUR[index];if(!step)return;
  setMode('section');setTour(index);setSelected(step.part);setIsolated(false);animateTo(step.view);
  requestAnimationFrame(()=>scene.current?.focus(step.part));
 },[animateTo]);
 const select=useCallback((id:PartId|null)=>{
  setTour(null);setSelected(id);setIsolated(false);
  if(!id)return;
  setMode('section');
  if(id==='water'&&displayRef.current.water<1)animateTo({...displayRef.current,water:1});
 },[animateTo]);
 const run=(plan:Plan|null)=>{
  if(!plan)return;
  if(plan.kind==='guide'){guide(plan.step);return}
  setIsolated(false);if(selected==='water'&&plan.view.water===0)setSelected(null);animateTo(plan.view);
 };
 // The scene keeps one listener; this ref always sees the latest tour state.
 const pick=useRef<(id:PartId)=>void>(()=>{});
 pick.current=id=>{if(tour!==null)guide(tourStepOf(id));else if(id!==selected)select(id)};

 useEffect(()=>{
  let cancelled=false,handle:SceneHandle|null=null;
  const fail=()=>{if(!cancelled)setError('Seu navegador não conseguiu abrir a cena 3D. As explicações e fontes continuam disponíveis.')};
  import('./scene/runtime.ts').then(({createScene})=>{
   if(cancelled||!host.current)return;
   try{handle=createScene(host.current,id=>pick.current(id),text=>{setError(text);pause()});scene.current=handle;setReady(true)}catch{fail()}
  },fail);
  return()=>{cancelled=true;handle?.dispose();scene.current=null};
 },[pause]);
 useEffect(()=>{if(ready)scene.current?.update({...display,mode,poreWater,selected,isolated,wireframe})},[ready,display,mode,poreWater,selected,isolated,wireframe]);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const change=()=>{setReduced(media.matches);const t=transitionRef.current;if(media.matches&&t){pause();setDisplay(t.to)}};
  media.addEventListener('change',change);return()=>media.removeEventListener('change',change);
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
 useEffect(()=>{if(selected&&innerWidth<=900){const id=requestAnimationFrame(()=>inspector.current?.scrollIntoView({block:'nearest',behavior:reduced?'instant':'smooth'}));return()=>cancelAnimationFrame(id)}},[selected,tour,reduced]);
 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{if(document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey||e.target instanceof HTMLInputElement)return;if(e.key.toLowerCase()==='r')scene.current?.home();if(e.key==='Escape')select(null)};
  document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);
 },[select]);

 function change(value:DisplayState){pause();setDisplay(value);setIsolated(false);if(selected==='water'&&value.water<.01){setSelected(null);setTour(null)}}
 function switchMode(next:Mode){pause();setMode(next);setSelected(null);setIsolated(false);setTour(null)}
 function reset(){pause();setDisplay(initial);setMode('section');setPoreWater(true);setSelected(null);setIsolated(false);setWireframe(false);setTour(null);setSearch('');requestAnimationFrame(()=>scene.current?.home());setNotice('Experiência reiniciada.')}
 function showScale(){setTour(null);const target=document.getElementById('escala');target?.scrollIntoView({behavior:reduced?'instant':'smooth'});target?.focus({preventScroll:true})}
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{setNotice('Tela cheia não disponível neste navegador.')}}

 const list=()=> <><label className="search"><Search size={16}/><input aria-label="Encontrar camada" placeholder="Encontrar camada" value={search} onChange={e=>setSearch(e.target.value)}/><span>{pad(filtered.length)}<span className="sr-only"> camadas</span></span></label><div className="parts-list">{filtered.map(p=><button className={'part-row'+(p.id===selected?' selected':'')} aria-pressed={p.id===selected} key={p.id} onClick={()=>{select(p.id);setDrawer(false)}}><span style={{background:p.color}} className="layer-swatch"/><strong>{p.label}</strong><ChevronRight size={14}/></button>)}{filtered.length===0&&<small className="search-hint">Nenhuma camada encontrada.</small>}</div></>;
 const last=TOUR.length-1;
 return <div className="app"><header className="header"><Brand/><div className="collection-label">O MUNDO POR DENTRO <span>/</span> LAB 06</div><a className="video-link" href="#video">Ver o vídeo <ArrowUpRight size={16}/></a></header>
 <main className={'workspace river-workspace '+(mode==='pores'?'pore-mode':'')}>
  <div className="heading"><p className="eyebrow"><span/>EXPERIMENTO 06 <i>—</i> ABAIXO DA SUPERFÍCIE</p><h1>AMAZONAS<br/>EM CAMADAS<span>.</span></h1><p className="intro">{project.intro}</p><button className="location-button" onClick={()=>setSource('chm')}><MapPin size={14}/>{place.name}<ArrowUpRight size={13}/></button></div>
  <div className="canvas-region"><div className="scene-host" ref={host}/>{!ready&&!error&&<p className="loading" role="status">Carregando a cena 3D…</p>}{error&&<div className="scene-error" role="alert"><Box size={28}/><h2>Cena indisponível</h2><p>{error}</p><button className="primary" onClick={()=>location.reload()}>Tentar novamente</button></div>}<div className="scene-mode"><span className="status-dot"/>{mode==='pores'?'AMOSTRA AMPLIADA':'CORTE ILUSTRATIVO'}<span className="mode-divider"/>SEM ESCALA</div><div className="orbit-hint"><span className="hint-fine">Arraste para girar</span><span className="hint-coarse">Deslize para os lados para girar</span><i>·</i>{mode==='pores'?'Água entre os grãos':'Geometria autoral'}</div></div>
  <aside className="sidebar">{mode==='section'?<><div className="sidebar-label">DA SUPERFÍCIE AO SUBSOLO.</div>{list()}<div className="sidebar-foot"><span className="mini-line"/><p>Uma localização real.<br/>Um corte ilustrativo, sem escala.</p><button className="text-button" disabled={!usable} onClick={()=>guide(0)}>Conhecer as camadas <ArrowRight size={15}/></button><button className="text-button" onClick={showScale}>Profundidades em escala real <Ruler size={15}/></button></div></>:<div className="pore-story"><span className="sidebar-label">ÁGUA SUBTERRÂNEA</span><h2>Entre os grãos.</h2><p>A água ocupa espaços no material. Poros conectados permitem sua passagem.</p><p className="muted">Esta amostra é ampliada e conceitual. Não representa o tamanho dos grãos ou um aquífero de Óbidos.</p><button className="text-button" onClick={()=>setSource('usgs')}>Entender a representação <ArrowRight size={15}/></button></div>}<button className="hamza-button" onClick={()=>setSource('hamza')}>E o chamado Hamza?<ArrowUpRight size={14}/></button></aside>
  <nav className="view-switch" aria-label="Vista da experiência"><button aria-pressed={mode==='section'} className={mode==='section'?'active':''} onClick={()=>switchMode('section')}>Trecho em corte</button><button aria-pressed={mode==='pores'} className={mode==='pores'?'active':''} onClick={()=>switchMode('pores')}>Água nos poros</button></nav>
  <div className="camera-tools" role="toolbar" aria-label="Câmera e imagem"><button aria-label="Aproximar" disabled={!usable} onClick={()=>scene.current?.zoom(.85)}><Plus size={18}/></button><button aria-label="Afastar" disabled={!usable} onClick={()=>scene.current?.zoom(1.15)}><Minus size={18}/></button><span/><button aria-label="Reenquadrar" disabled={!usable} onClick={()=>scene.current?.home()}><Focus size={18}/></button><button className="wire-button" aria-label="Mostrar malha" disabled={!usable} aria-pressed={wireframe} onClick={()=>setWireframe(v=>!v)}><Box size={18}/></button><span/><button aria-label="Salvar imagem PNG" disabled={!usable} onClick={()=>scene.current?.capture()}><Download size={18}/></button><button className="format-button" aria-label="Salvar imagem vertical 9 por 16" disabled={!usable} onClick={()=>scene.current?.capture(true)}>9:16</button>{Boolean(document.documentElement.requestFullscreen)&&<button className="fullscreen-button" aria-label="Tela cheia" onClick={fullscreen}><Maximize size={17}/></button>}</div>
  {current&&<section className="inspector" ref={inspector} aria-label="Camada selecionada"><div className="inspector-top"><span className="eyebrow">{tour===null?'EM DETALHE':`CONHEÇA AS CAMADAS · ${tour+1}/${TOUR.length}`}</span><button className="icon-button" aria-label="Fechar detalhe" onClick={()=>select(null)}><X size={16}/></button></div><h2>{current.label}</h2><p>{current.detail}</p>
   {current.facts.length>0&&<ul className="fact-list">{current.facts.map(f=><li key={f.value}><strong>{f.value}</strong><span>{f.text}</span><button onClick={()=>setSource(f.sourceId)}>Fonte <ArrowUpRight size={12}/></button></li>)}</ul>}
   <small>{current.note}</small><button className="part-source" onClick={()=>setSource(current.sourceId)}>Fonte e limites <ArrowUpRight size={12}/></button>
   <div className="inspector-actions"><button disabled={!usable} aria-pressed={isolated} onClick={()=>setIsolated(v=>!v)}><Layers3 size={14}/>{isolated?'Ver todas as camadas':'Isolar'}</button><button disabled={!usable} onClick={()=>scene.current?.focus(current.id)}><Focus size={14}/>Aproximar</button></div>
   {tour!==null&&<div className="inspector-actions"><button disabled={tour===0} onClick={()=>guide(tour-1)}><ArrowLeft size={14}/>Anterior</button>{tour<last?<button onClick={()=>guide(tour+1)}>Próxima camada<ArrowRight size={14}/></button>:<button onClick={showScale}>Ver em escala real<Ruler size={14}/></button>}</div>}
  </section>}
  {mode==='pores'&&<div className="pore-explanation"><h2>Água entre os grãos.</h2><p>Poros conectados permitem a passagem da água. Amostra ampliada e ilustrativa, sem representar um aquífero de Óbidos.</p></div>}
  <div className="mobile-actions">{mode==='section'?<><button onClick={()=>setDrawer(true)}><Layers3 size={16}/>Camadas <span>{catalog.length}</span></button><button disabled={!usable} onClick={()=>guide(0)}>Conhecer as camadas <ArrowRight size={16}/></button></>:<button onClick={()=>setSource('usgs')}>Entender os poros <ArrowUpRight size={16}/></button>}</div>
  {mode==='section'?<LayerControls value={display} animating={animating} disabled={!usable} change={change} stage={i=>run(planStage(i,tour))} toggleWater={()=>run(planWaterToggle(display,tour))} pause={pause} reset={reset}/>:<section className="control-dock river-dock pore-dock" aria-label="Explorar os poros"><button className="primary" disabled={!usable} aria-pressed={poreWater} onClick={()=>setPoreWater(v=>!v)}>{poreWater?'Ocultar água dos poros':'Mostrar água dos poros'}</button><span>Grãos sólidos · espaços com água</span><button className="icon-button" aria-label="Reiniciar experiência" onClick={reset}><RotateIcon/></button></section>}
  <div className="representation-note"><span>{mode==='pores'?'MODELO CONCEITUAL · NÃO É UM CANAL SUBTERRÂNEO':'FORMAS E ESPESSURAS ILUSTRATIVAS · SEM ESCALA'}</span><button onClick={()=>setSource('hamza')}>E o Hamza? <ArrowUpRight size={12}/></button></div>
 </main><DepthScale openSource={setSource}/><VideoSection video={video}/><footer><span>UM EXPERIMENTO DO OVICTORLAB <i>© 2026</i></span><button onClick={()=>setSource('overview')}>Como representamos · Fontes e créditos <ArrowUpRight size={13}/></button><CollectionNav current="amazonas-em-camadas"/></footer>
 <Sources source={source} onClose={()=>setSource(null)}/><dialog ref={dialog} className="parts-dialog" aria-label="Camadas do Amazonas" onClose={()=>setDrawer(false)}><div className="dialog-top"><span className="eyebrow">CONHEÇA AS CAMADAS</span><button className="icon-button" aria-label="Fechar camadas" onClick={()=>setDrawer(false)}><X size={18}/></button></div>{list()}</dialog><span className="sr-only" role="status" aria-live="polite">{notice}</span></div>
}
function RotateIcon(){return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/></svg>}
