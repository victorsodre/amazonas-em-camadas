import test from 'node:test';
import assert from 'node:assert/strict';
import { bedHeight, riverCenter, WATER_Y, HALF_WIDTH, sampleLayers, interpolateView, advanceTransition } from './section.ts';

test('riverbed is continuous, stays above sediment and meets both shorelines', () => {
 for(let ix=0;ix<=120;ix++){
  const x=-6+ix/10;
  for(const sign of [-1,1])assert.ok(Math.abs(bedHeight(x,riverCenter(x)+sign*HALF_WIDTH)-WATER_Y)<1e-10);
  for(let iz=0;iz<=76;iz++){
   const z=-3.8+iz/10,y=bedHeight(x,z);
   assert.ok(Number.isFinite(y)&&y>.03&&y<2.1);
   if(Math.abs(z-riverCenter(x))<HALF_WIDTH)assert.ok(y<=WATER_Y+1e-10);
   assert.ok(Math.abs(bedHeight(x,z+.0001)-y)<.002);
  }
 }
});
test('separating layers opens gaps without changing their order or accumulating motion', () => {
 const initial=sampleLayers(0),full=sampleLayers(1);
 assert.deepEqual(initial,{water:0,bed:0,sediment:0,substrate:0});
 for(let i=0;i<=100;i++){
  const p=sampleLayers(i/100);
  assert.ok(p.water>=p.bed&&p.bed>=p.sediment&&p.sediment>=p.substrate);
 }
 assert.ok(full.water-full.bed>.5&&full.bed-full.sediment>.5&&full.sediment-full.substrate>.5);
 sampleLayers(.9);sampleLayers(.2);assert.deepEqual(sampleLayers(0),initial);
 assert.deepEqual(sampleLayers(-1),initial);assert.deepEqual(sampleLayers(Infinity),initial);assert.deepEqual(sampleLayers(9),full);
});
test('visual transitions are bounded, reversible and reach their requested end states', () => {
 const a={water:1,separation:0},b={water:0,separation:1};
 assert.deepEqual(interpolateView(a,b,0),a);assert.deepEqual(interpolateView(a,b,1),b);
 for(let i=0;i<=100;i++){
  const p=i/100,f=interpolateView(a,b,p),r=interpolateView(b,a,1-p);
  assert.ok(Math.abs(f.water-r.water)<1e-12&&Math.abs(f.separation-r.separation)<1e-12);
  assert.ok(f.water>=0&&f.water<=1&&f.separation>=0&&f.separation<=1);
 }
 assert.deepEqual(interpolateView({water:-2,separation:Infinity},{water:3,separation:-4},NaN),{water:0,separation:0});
});
test('transition clock pauses when hidden, caps long gaps and terminates', () => {
 assert.equal(advanceTransition(.3,.2,false),.3);
 assert.equal(advanceTransition(.3,100,true),advanceTransition(.3,.1,true));
 assert.equal(advanceTransition(.3,-1,true),.3);assert.equal(advanceTransition(.3,NaN,true),.3);
 let p=0;for(let i=0;i<20;i++)p=advanceTransition(p,.1,true);
 assert.equal(p,1);assert.equal(advanceTransition(1,.1,true),1);
});
