import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { createModel, applyDisplay } from './model.ts';

test('four selectable layers assemble without gaps and separate deterministically',()=>{
 const m=createModel();
 try{
  assert.deepEqual(m.parts.map(p=>p.id),['water','bed','sediment','substrate']);
  const initial=m.parts.map(p=>p.group.position.clone());
  applyDisplay(m,{water:0,separation:1,mode:'section',poreWater:true});
  assert.equal(m.parts[0]!.group.visible,false);
  for(let i=1;i<3;i++){
   const upper=new T.Box3().setFromObject(m.parts[i]!.group),lower=new T.Box3().setFromObject(m.parts[i+1]!.group);
   assert.ok(upper.min.y>lower.max.y+.5);
  }
  applyDisplay(m,{water:1,separation:0,mode:'section',poreWater:true});
  for(let i=0;i<4;i++)assert.deepEqual(m.parts[i]!.group.position,initial[i]);
  for(let i=1;i<3;i++){
   const upper=new T.Box3().setFromObject(m.parts[i]!.group),lower=new T.Box3().setFromObject(m.parts[i+1]!.group);
   assert.ok(Math.abs(upper.min.y-lower.max.y)<.002);
  }
  m.root.traverse(o=>{if(o instanceof T.Mesh){const pos=o.geometry.getAttribute('position');for(let i=0;i<pos.count;i++)assert.ok(Number.isFinite(pos.getX(i))&&Number.isFinite(pos.getY(i))&&Number.isFinite(pos.getZ(i)));}});
 }finally{m.dispose()}
});
test('pore sample is a separate explanatory view and its water can be hidden',()=>{
 const m=createModel();
 try{
  applyDisplay(m,{water:1,separation:0,mode:'pores',poreWater:true});
  assert.equal(m.section.visible,false);assert.equal(m.pores.visible,true);assert.equal(m.poreWater.visible,true);
  assert.ok(m.grains.count>20);
  applyDisplay(m,{water:1,separation:0,mode:'pores',poreWater:false});assert.equal(m.poreWater.visible,false);
  applyDisplay(m,{water:1,separation:0,mode:'section',poreWater:true});assert.equal(m.pores.visible,false);assert.equal(m.section.visible,true);
 }finally{m.dispose()}
});
