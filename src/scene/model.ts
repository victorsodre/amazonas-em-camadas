import * as T from 'three';
import {catalog} from '../content/catalog.ts';
import {bedHeight,riverCenter,BED_FLOOR,HALF_WIDTH,WATER_Y,sampleLayers,unit} from '../simulation/section.ts';
import type {Part,Mode} from './types.ts';

function solid(nx:number,nz:number,coordinate:(i:number,j:number)=>[number,number],top:(x:number,z:number)=>number,bottom:(x:number,z:number)=>number,color:(x:number,y:number,z:number,upper:boolean)=>T.Color){
 const positions:number[]=[],colors:number[]=[],indices:number[]=[];
 const add=(x:number,y:number,z:number,upper:boolean)=>{positions.push(x,y,z);const c=color(x,y,z,upper);colors.push(c.r,c.g,c.b)};
 for(const upper of [true,false])for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const [x,z]=coordinate(i/nx,j/nz);add(x,(upper?top:bottom)(x,z),z,upper)}
 const size=(nx+1)*(nz+1),index=(i:number,j:number)=>i*(nz+1)+j;
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){
  const a=index(i,j),b=index(i+1,j),c=index(i,j+1),d=index(i+1,j+1);
  indices.push(a,c,b,b,c,d,a+size,b+size,c+size,b+size,d+size,c+size);
 }
 const edge:number[]=[];for(let i=0;i<=nx;i++)edge.push(index(i,0));for(let j=1;j<=nz;j++)edge.push(index(nx,j));for(let i=nx-1;i>=0;i--)edge.push(index(i,nz));for(let j=nz-1;j>0;j--)edge.push(index(0,j));
 for(let i=0;i<edge.length;i++){
  const a=edge[i]!,b=edge[(i+1)%edge.length]!;
  for(let row=0;row<8;row++){
   const start=positions.length/3;
   for(const [idx,t] of [[a,row/8],[b,row/8],[b,(row+1)/8],[a,(row+1)/8]]){
    const x=positions[idx!*3]!,z=positions[idx!*3+2]!,y=positions[idx!*3+1]!*(1-t!)+positions[(idx!+size)*3+1]!*t!;
    add(x,y,z,false);
   }
   indices.push(start,start+1,start+2,start,start+2,start+3);
  }
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
const MUDDY_SURFACE=new T.Color('#a5824f'),MUDDY_DEPTH=new T.Color('#24190f');
/** Illustrative only: sediment-laden water darkens quickly below the surface. Not a measured light profile. */
export function waterColor(y:number){
 const depth=Math.max(0,Math.min(1,(WATER_Y-y)/(WATER_Y-BED_FLOOR)));
 return MUDDY_SURFACE.clone().lerp(MUDDY_DEPTH,Math.pow(depth,.55));
}
const rectangle=(u:number,v:number):[number,number]=>[-6+12*u,-3.8+7.6*v];
export function createModel(){
 const root=new T.Group(),section=new T.Group(),pores=new T.Group();root.add(section,pores);pores.visible=false;
 const parts:Part[]=catalog.map(p=>{const group=new T.Group();group.userData.partId=p.id;group.name=p.id;section.add(group);return {...p,group}});
 const materials:T.Material[]=[],geometries:T.BufferGeometry[]=[];
 const material=(color:string,options:T.MeshStandardMaterialParameters={})=>{const m=new T.MeshStandardMaterial({color,roughness:.9,...options});materials.push(m);return m};
 const mesh=(g:T.BufferGeometry,m:T.Material,parent:T.Object3D)=>{geometries.push(g);const o=new T.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
 const earth=material('#ffffff',{vertexColors:true});
 mesh(solid(96,64,rectangle,bedHeight,()=>-.15,(x,_y,z,upper)=>{
  const t=Math.abs(z-riverCenter(x))/HALF_WIDTH;
  return new T.Color(upper?(t>1.02?'#4b6345':t>.85?'#948063':'#897355'):'#725638').multiplyScalar(.88+.09*Math.sin(x*2+z*3)+.06*Math.sin(_y*19+x*3));
 }),earth,parts[1]!.group);
 mesh(solid(64,16,rectangle,()=>-.15,()=>-1.1,(x,y,z)=>new T.Color('#96754c').multiplyScalar(.87+.07*Math.sin(x*1.4+z)+.09*Math.sin(y*17+x*.4))),earth,parts[2]!.group);
 mesh(solid(64,16,rectangle,()=>-1.1,()=>-2.5,(x,_y,z)=>new T.Color('#685044').multiplyScalar(.86+.08*Math.cos(x*.7+z*.8)+.08*Math.sin(_y*19+x*.6))),earth,parts[3]!.group);
 for(const [part,levels,color] of [[parts[2]!,[-.38,-.67,-.88],'#97754e'],[parts[3]!,[-1.35,-1.75,-2.1,-2.35],'#624b43']] as const){
  const pts:T.Vector3[]=[];
  for(const y of levels)for(const sign of [-1,1])for(let i=0;i<100;i++){
   for(const x of [-6+i*.12,-6+(i+1)*.12])pts.push(new T.Vector3(x,y+.035*Math.sin(x*1.2+y*4),sign*3.803));
  }
  const g=new T.BufferGeometry().setFromPoints(pts);geometries.push(g);const m=new T.LineBasicMaterial({color,transparent:true,opacity:.5});materials.push(m);const lines=new T.LineSegments(g,m);lines.raycast=()=>{};part.group.add(lines);
 }
 // A straight, schematic channel; measured survey geometry is intentionally not imported.
 const waterMaterial=material('#ffffff',{vertexColors:true,roughness:.35,metalness:0,transparent:true,opacity:1,depthWrite:false});
 const water=mesh(solid(96,32,(u,v)=>{const x=-6+u*12;return [x,riverCenter(x)+(v*2-1)*HALF_WIDTH]},()=>WATER_Y,bedHeight,(x,y,z,upper)=>waterColor(upper?WATER_Y-(WATER_Y-bedHeight(x,z))*.2:y).multiplyScalar(.96+.04*Math.sin(x*2.3+z*1.7))),waterMaterial,parts[0]!.group);water.castShadow=false;
 const ripples:T.Vector3[]=[];
 for(let row=0;row<11;row++)for(let j=0;j<5;j++){const x=-5.7+row*1.03+j*.07,z=riverCenter(x)+(j-2)*.65;for(let k=0;k<6;k++)ripples.push(new T.Vector3(x+k*.08,WATER_Y+.004,z+.018*Math.sin(k)),new T.Vector3(x+(k+1)*.08,WATER_Y+.004,z+.018*Math.sin(k+1)));}
 const rippleGeometry=new T.BufferGeometry().setFromPoints(ripples);geometries.push(rippleGeometry);const rippleMaterial=new T.LineBasicMaterial({color:'#d8c497',transparent:true,opacity:.22,depthWrite:false});materials.push(rippleMaterial);const rippleLines=new T.LineSegments(rippleGeometry,rippleMaterial);rippleLines.raycast=()=>{};parts[0]!.group.add(rippleLines);
 // Vegetation is an illustrative cue, not a land-cover dataset.
 let seed=62;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const leafGeometry=new T.IcosahedronGeometry(1,1),leafMaterial=material('#40583e');geometries.push(leafGeometry);
 const trees=new T.InstancedMesh(leafGeometry,leafMaterial,220),dummy=new T.Object3D();
 for(let i=0;i<trees.count;i++){
  const x=-5.8+random()*11.6,sign=i%2?1:-1,z=sign*(2.55+random()*1.02),size=.13+random()*.14;
  dummy.position.set(x,bedHeight(x,z)+size*.65,z);dummy.scale.set(size,size*(.9+random()*.4),size);dummy.rotation.set(random(),random()*Math.PI,random());dummy.updateMatrix();trees.setMatrixAt(i,dummy.matrix);trees.setColorAt(i,new T.Color().setHSL(.22+random()*.08,.19+random()*.15,.19+random()*.08));
 }
 trees.castShadow=true;trees.receiveShadow=true;parts[1]!.group.add(trees);
 const guideGeometry=new T.BufferGeometry().setFromPoints([-6,6].flatMap(x=>[-3.8,3.8].flatMap(z=>[new T.Vector3(x,-3.7,z),new T.Vector3(x,4,z)])));geometries.push(guideGeometry);
 const guideMaterial=new T.LineDashedMaterial({color:'#b9bdc8',transparent:true,opacity:.45,dashSize:.1,gapSize:.12});materials.push(guideMaterial);const guides=new T.LineSegments(guideGeometry,guideMaterial);guides.computeLineDistances();guides.raycast=()=>{};section.add(guides);guides.visible=false;
 const grainGeometry=new T.SphereGeometry(.25,16,12);geometries.push(grainGeometry);const grainMaterial=material('#bba182');
 const grains=new T.InstancedMesh(grainGeometry,grainMaterial,7*4*4);let n=0;
 for(let x=0;x<7;x++)for(let y=0;y<4;y++)for(let z=0;z<4;z++){
  dummy.position.set((x-3)*.64+(random()-.5)*.04,(y-1.5)*.64+(random()-.5)*.04,(z-1.5)*.64+(random()-.5)*.04);dummy.scale.setScalar(.9+random()*.15);dummy.rotation.set(0,0,0);dummy.updateMatrix();grains.setMatrixAt(n,dummy.matrix);grains.setColorAt(n,new T.Color().setHSL(.08+random()*.04,.2,.54+random()*.14));n++;
 }
 grains.castShadow=true;grains.receiveShadow=true;pores.add(grains);
 const poreWater=mesh(new T.BoxGeometry(4.45,2.55,2.55),material('#64a2bd',{transparent:true,opacity:.23,roughness:.3,depthWrite:false,side:T.DoubleSide}),pores);poreWater.castShadow=false;poreWater.raycast=()=>{};
 const poreEdgesGeometry=new T.EdgesGeometry(poreWater.geometry);geometries.push(poreEdgesGeometry);const poreEdgesMaterial=new T.LineBasicMaterial({color:'#8dacc1',transparent:true,opacity:.6});materials.push(poreEdgesMaterial);const poreEdges=new T.LineSegments(poreEdgesGeometry,poreEdgesMaterial);poreEdges.raycast=()=>{};pores.add(poreEdges);
 const shadowMaterial=new T.ShadowMaterial({opacity:.2,color:'#000000'});materials.push(shadowMaterial);const floor=mesh(new T.PlaneGeometry(30,30),shadowMaterial,root);floor.rotation.x=-Math.PI/2;floor.position.y=-2.52;floor.castShadow=false;floor.raycast=()=>{};
 root.updateMatrixWorld(true);
 return {root,section,pores,parts,waterMaterial,rippleMaterial,guides,floor,grains,poreWater,
 dispose(){for(const g of new Set(geometries))g.dispose();for(const m of new Set(materials))m.dispose()}};
}
export type RiverModel=ReturnType<typeof createModel>;
export function applyDisplay(model:RiverModel,state:{water:number;separation:number;mode:Mode;poreWater:boolean}){
 const positions=sampleLayers(state.separation);
 for(const part of model.parts){part.group.position.set(0,positions[part.id],0);part.group.visible=part.id!=='water'||unit(state.water)>.001;}
 model.waterMaterial.opacity=unit(state.water);model.rippleMaterial.opacity=.22*unit(state.water);
 model.section.visible=state.mode==='section';model.pores.visible=state.mode==='pores';model.poreWater.visible=state.poreWater;
 model.guides.visible=state.separation>.01;model.floor.visible=state.mode==='section'&&state.separation===0;
 model.root.updateMatrixWorld(true);
}
