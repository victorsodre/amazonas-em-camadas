import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createModel, applyDisplay } from './model.ts';
import { fit, resizedOffset } from './camera.ts';
import { saveSceneImage } from './capture.ts';
import { isTap, type PointerSample } from './tap.ts';
import type { PartId } from '../content/catalog.ts';
import type { SceneHandle, ViewState } from './types.ts';

const DEFAULT_DIRECTION = new T.Vector3(9, 8, 12);

export function createScene(host: HTMLElement, onPick: (id: PartId) => void, onError: (text: string) => void): SceneHandle {
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));renderer.localClippingEnabled = true;
  renderer.toneMapping = T.ACESFilmicToneMapping;renderer.toneMappingExposure = 1;renderer.shadowMap.enabled = true;renderer.shadowMap.type = T.PCFShadowMap;
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', 'Corte ilustrativo do Amazonas, sem escala. Arraste para girar ou selecione uma camada na lista.');
  host.append(renderer.domElement);
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(38, 1, .01, 200);
  const controls = new OrbitControls(camera, renderer.domElement);controls.enableDamping = false;controls.minDistance = 2;controls.maxDistance = 75;
  const room = new RoomEnvironment(), pmrem = new T.PMREMGenerator(renderer), env = pmrem.fromScene(room, .04);scene.environment = env.texture;scene.environmentIntensity = .5;room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight('#dbe8ff', '#483d30', 1.15));
  const key = new T.DirectionalLight('#fff1d2', 2.5);key.position.set(4, 10, 8);key.castShadow = true;key.shadow.mapSize.set(1024, 1024);key.shadow.camera.left = -15;key.shadow.camera.right = 15;key.shadow.camera.top = 10;key.shadow.camera.bottom = -10;key.shadow.camera.far = 45;key.shadow.bias = -.0005;scene.add(key);
  const rim = new T.DirectionalLight('#b4d3ff', 1.9);rim.position.set(-6, 5, -5);scene.add(rim);
  const model = createModel();scene.add(model.root);
  const highlight = new T.BoxHelper(new T.Object3D(), '#ffd21f');highlight.visible = false;scene.add(highlight);
  let state: ViewState = { water: 1, separation: 0, mode: 'section', poreWater: true, selected: null, isolated: false, wireframe: false };
  let disposed = false, active = false, contextLost = false, framed = false, last = -Infinity;
  /** Part the camera is framed on (tour step or "Aproximar"); follows the part while layers move. */
  let focusId: PartId | null = null;
  let previousPose: {position: T.Vector3; target: T.Vector3} | null = null;
  const partById = (id: PartId | null) => model.parts.find(p => p.id === id);
  const frameBounds = () => {
    if (state.mode === 'pores') return new T.Box3(new T.Vector3(-2.3,-1.35,-1.35),new T.Vector3(2.3,1.35,1.35));
    const part = partById(state.isolated ? state.selected : focusId);
    if (part) return new T.Box3().setFromObject(part.group);
    const b = new T.Box3();for (const p of model.parts) if (p.group.visible) b.expandByObject(p.group);return b;
  };
  const invalidate = () => {if (disposed || active || document.hidden || contextLost) return;active = true;renderer.setAnimationLoop(frame);};
  function frame(time: number) {
    if (time - last < 1000 / 30) return;last = time;
    renderer.render(scene, camera);
    const data = renderer.domElement.dataset;data.renderCount = String(Number(data.renderCount ?? 0) + 1);
    data.drawCalls = String(renderer.info.render.calls);data.triangles = String(renderer.info.render.triangles);
    data.cameraPose = JSON.stringify([...camera.position.toArray(), ...controls.target.toArray()]);
    renderer.setAnimationLoop(null);active = false;
  }
  const orbit = () => camera.position.clone().sub(controls.target);
  /** Fit the current bounds from `direction`; by default the user's current viewing direction. */
  const frameTo = (direction = orbit()) => {controls.target.copy(fit(camera, frameBounds(), direction));controls.update();framed = true;invalidate();};
  const home = () => {focusId = null;frameTo(DEFAULT_DIRECTION);};
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();if (width < 1 || height < 1) return;
    const current = renderer.getSize(new T.Vector2()), fromAspect = camera.aspect, toAspect = width / height;
    if (current.x !== width || current.y !== height) renderer.setSize(width, height);
    camera.aspect = toAspect;camera.updateProjectionMatrix();
    if (framed && Math.abs(fromAspect - toAspect) > .0001) {
      // Measure the orbit before moving the camera: copying the target first collapsed the offset to zero
      // (camera glued to the grains when the pore tab resized the stage).
      const offset = resizedOffset(orbit(), frameBounds(), fromAspect, toAspect, camera.fov);
      camera.position.copy(controls.target).add(offset);controls.update();
    }
    invalidate();
  };
  const observer = new ResizeObserver(resize);observer.observe(host);controls.addEventListener('change', invalidate);
  // Only a deliberate tap on a layer selects it. Drags, pinches, long presses and taps on empty space change nothing.
  const pointers = new Set<number>();
  let down: PointerSample | null = null, multiTouch = false;
  const sample = (e: PointerEvent): PointerSample => ({ id: e.pointerId, x: e.clientX, y: e.clientY, time: e.timeStamp });
  const pointerDown = (e: PointerEvent) => {
    pointers.add(e.pointerId);
    if (pointers.size === 1) {down = e.button === 0 ? sample(e) : null;multiTouch = false;} else multiTouch = true;
  };
  const pointerCancel = (e: PointerEvent) => {pointers.delete(e.pointerId);down = null;};
  const pointerUp = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    const tap = isTap(down, sample(e), multiTouch);
    if (pointers.size === 0) down = null;
    if (!tap || state.mode !== 'section') return;
    const rect = renderer.domElement.getBoundingClientRect(), ray = new T.Raycaster(), candidates: T.Mesh[] = [];
    ray.setFromCamera(new T.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1), camera);
    for (const part of model.parts) part.group.traverseVisible(o => {if (o instanceof T.Mesh) candidates.push(o);});
    let hit: T.Object3D | undefined = ray.intersectObjects(candidates, false)[0]?.object;
    while (hit && !hit.userData.partId) hit = hit.parent ?? undefined;
    if (hit) onPick(hit.userData.partId as PartId);
  };
  const canvas = renderer.domElement;
  canvas.addEventListener('pointerdown', pointerDown);canvas.addEventListener('pointerup', pointerUp);canvas.addEventListener('pointercancel', pointerCancel);
  const visibility = () => {if (document.hidden) {renderer.setAnimationLoop(null);active = false;} else {last = -Infinity;invalidate();}};
  document.addEventListener('visibilitychange', visibility);
  const lost = (e: Event) => {e.preventDefault();contextLost = true;renderer.setAnimationLoop(null);active = false;onError('A cena 3D foi interrompida. Recarregue para restaurá-la. As explicações e fontes continuam disponíveis.');};
  canvas.addEventListener('webglcontextlost', lost);
  applyDisplay(model, state);resize();home();
  return {
    update(next) {
      const previous = state;state = next;
      if (state.selected !== focusId) focusId = null;
      applyDisplay(model, state);
      model.floor.visible = state.mode === 'section' && !state.isolated && state.separation === 0;
      model.guides.visible = state.mode === 'section' && !state.isolated && state.separation > .01;
      for (const part of model.parts) part.group.visible = (part.id !== 'water' || state.water > .001) && (!state.isolated || part.id === state.selected);
      model.root.traverse(o => {if (o instanceof T.Mesh) for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (m instanceof T.MeshStandardMaterial) m.wireframe = state.wireframe;});
      const selected = partById(state.selected);highlight.visible = Boolean(selected) && selected!.group.visible && !state.isolated && state.mode === 'section';
      if (selected) highlight.setFromObject(selected.group);
      const contentChanged = previous.separation !== state.separation || previous.mode !== state.mode || (previous.water > .001) !== (state.water > .001);
      if (!previous.isolated && state.isolated) {previousPose = {position: camera.position.clone(), target: controls.target.clone()};frameTo();}
      else if (previous.isolated && !state.isolated && previousPose) {camera.position.copy(previousPose.position);controls.target.copy(previousPose.target);controls.update();previousPose = null;}
      // A new view (cut or pore sample) always opens from the home angle, like "Reenquadrar".
      if (previous.mode !== state.mode) home();
      else if (contentChanged) frameTo();
      const data = canvas.dataset;data.water = state.water.toFixed(3);data.separation = state.separation.toFixed(3);data.mode = state.mode;data.poreWater = String(state.poreWater);invalidate();
    },
    home,
    focus(id) {if (!partById(id)) return;focusId = id;frameTo();},
    zoom(factor) {camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);controls.update();invalidate();},
    capture(portrait = false) {saveSceneImage(renderer, scene, camera, frameBounds(), portrait, state.mode);invalidate();},
    dispose() {
      disposed = true;renderer.setAnimationLoop(null);observer.disconnect();controls.removeEventListener('change', invalidate);controls.dispose();
      canvas.removeEventListener('pointerdown', pointerDown);canvas.removeEventListener('pointerup', pointerUp);canvas.removeEventListener('pointercancel', pointerCancel);canvas.removeEventListener('webglcontextlost', lost);document.removeEventListener('visibilitychange', visibility);
      model.dispose();env.dispose();highlight.geometry.dispose();(highlight.material as T.Material).dispose();renderer.dispose();canvas.remove();
    },
  };
}
