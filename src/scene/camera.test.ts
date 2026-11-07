import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3,PerspectiveCamera,Vector3} from 'three';
import {framing} from './camera.ts';
test('assembled, separated and pore views fit portrait, landscape and vertical cameras',()=>{
 for(const bounds of [new Box3(new Vector3(-6,-2.5,-3.8),new Vector3(6,3,3.8)),new Box3(new Vector3(-6,-3.7,-3.8),new Vector3(6,4.2,3.8)),new Box3(new Vector3(-2.3,-1.35,-1.35),new Vector3(2.3,1.35,1.35))]){
  for(const aspect of [.5,1,1.7,2.2])for(const direction of [new Vector3(9,8,12),new Vector3(0,1,0)]){
   const camera=new PerspectiveCamera(38,aspect,.01,200),pose=framing(bounds,aspect,direction);camera.position.copy(pose.position);camera.lookAt(pose.center);camera.updateMatrixWorld(true);
   for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
    const projected=new Vector3(x,y,z).project(camera);assert.ok(Math.abs(projected.x)<=1&&Math.abs(projected.y)<=1&&projected.z>-1&&projected.z<1);
   }
  }
 }
});
