import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3,PerspectiveCamera,Vector3} from 'three';
import {framing,framingDistance,resizedOffset} from './camera.ts';
const volumes=[new Box3(new Vector3(-6,-2.5,-3.8),new Vector3(6,3,3.8)),new Box3(new Vector3(-6,-3.7,-3.8),new Vector3(6,4.2,3.8)),new Box3(new Vector3(-2.3,-1.35,-1.35),new Vector3(2.3,1.35,1.35))];
test('assembled, separated and pore views fit portrait, landscape and vertical cameras',()=>{
 for(const bounds of volumes){
  for(const aspect of [.5,1,1.7,2.2])for(const direction of [new Vector3(9,8,12),new Vector3(0,1,0),new Vector3(-3,1,-7)]){
   const camera=new PerspectiveCamera(38,aspect,.01,200),pose=framing(bounds,aspect,direction);camera.position.copy(pose.position);camera.lookAt(pose.center);camera.updateMatrixWorld(true);
   for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
    const projected=new Vector3(x,y,z).project(camera);assert.ok(Math.abs(projected.x)<=1&&Math.abs(projected.y)<=1&&projected.z>-1&&projected.z<1);
   }
  }
 }
});
test('reframing keeps the viewing direction the user chose',()=>{
 const user=new Vector3(-4,2,-9);
 for(const bounds of volumes){const pose=framing(bounds,1.4,user);const offset=pose.position.clone().sub(pose.center);assert.ok(offset.normalize().distanceTo(user.clone().normalize())<1e-9)}
});
test('resizing keeps orbit and zoom: same direction, distance scaled only by the new aspect',()=>{
 const bounds=volumes[0]!,offset=new Vector3(-3,4,-6).multiplyScalar(.7);
 const narrow=resizedOffset(offset,bounds,1.8,.6);
 assert.ok(narrow.clone().normalize().distanceTo(offset.clone().normalize())<1e-9);
 const expected=framingDistance(bounds,.6,offset)/framingDistance(bounds,1.8,offset);
 assert.ok(Math.abs(narrow.length()/offset.length()-expected)<1e-9);
 assert.ok(expected>1,'a narrower screen backs the camera away');
 const back=resizedOffset(narrow,bounds,.6,1.8);assert.ok(back.distanceTo(offset)<1e-9,'resizing back and forth does not drift');
});
