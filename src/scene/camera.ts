import { Box3, PerspectiveCamera, Vector3 } from 'three';

function basis(direction: Vector3) {
  const forward = direction.lengthSq() > 1e-12 ? direction.clone().normalize() : new Vector3(0, 0, 1);
  // Match lookAt's vertical-view adjustment before measuring projected corners.
  if (Math.abs(forward.y) > .9999) forward.z += .001;
  forward.normalize();
  const right = new Vector3(0, 1, 0).cross(forward).normalize();
  const up = forward.clone().cross(right).normalize();
  return { forward, right, up };
}

/** Distance from the bounds' center, along `direction`, at which every corner fits the view. */
export function framingDistance(bounds: Box3, aspect: number, direction: Vector3, fov = 38) {
  const center = bounds.getCenter(new Vector3()), { forward, right, up } = basis(direction);
  const tanV = Math.tan(fov * Math.PI / 360), tanH = tanV * Math.max(.1, aspect);
  let distance = 1;
  for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
    const p = new Vector3(x, y, z).sub(center), toward = p.dot(forward);
    distance = Math.max(distance, Math.abs(p.dot(right)) / tanH + toward, Math.abs(p.dot(up)) / tanV + toward);
  }
  return distance * 1.08;
}

export function framing(bounds: Box3, aspect: number, direction: Vector3, fov = 38) {
  const center = bounds.getCenter(new Vector3());
  return { center, position: center.clone().addScaledVector(basis(direction).forward, framingDistance(bounds, aspect, direction, fov)) };
}

export function fit(camera: PerspectiveCamera, bounds: Box3, direction: Vector3) {
  const pose = framing(bounds, camera.aspect, direction, camera.fov);
  camera.position.copy(pose.position); camera.lookAt(pose.center); camera.updateProjectionMatrix();
  return pose.center;
}

/**
 * New camera offset (position − target) after the viewport aspect changes: same direction,
 * distance scaled by what the new aspect needs, so the user's orbit and zoom survive a resize.
 */
export function resizedOffset(offset: Vector3, bounds: Box3, fromAspect: number, toAspect: number, fov = 38) {
  const before = framingDistance(bounds, fromAspect, offset, fov), after = framingDistance(bounds, toAspect, offset, fov);
  return offset.clone().multiplyScalar(after / before);
}
