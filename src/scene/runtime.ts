import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createModel, applyDisplay } from './model.ts';
import { fit } from './camera.ts';
import { saveSceneImage } from './capture.ts';
import type { SceneHandle, ViewState } from './types.ts';

export function createScene(host: HTMLElement, onSelect: (id: string | null) => void, onError: (text: string) => void): SceneHandle {
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));renderer.localClippingEnabled = true;
  renderer.toneMapping = T.ACESFilmicToneMapping;renderer.toneMappingExposure = 1;renderer.shadowMap.enabled = true;renderer.shadowMap.type = T.PCFShadowMap;
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
  let disposed = false, active = false, contextLost = false, last = -Infinity;
  let previousPose: {position: T.Vector3; target: T.Vector3} | null = null;
  const direction = new T.Vector3(9, 8, 12);
  const selectedPart = () => model.parts.find(p => p.id === state.selected);
  const bounds = () => {
    if (state.mode === 'pores') return new T.Box3(new T.Vector3(-2.3,-1.35,-1.35),new T.Vector3(2.3,1.35,1.35));
    if (state.isolated && selectedPart()) return new T.Box3().setFromObject(selectedPart()!.group);
    const b = new T.Box3();for (const part of model.parts) if(part.group.visible) b.expandByObject(part.group);return b;

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
  const home = () => {controls.target.copy(fit(camera, bounds(), direction));controls.update();invalidate();};
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();if (width < 1 || height < 1) return;
    const current = renderer.getSize(new T.Vector2()), changed = Math.abs(camera.aspect - width / height) > .0001;
    if (current.x !== width || current.y !== height) renderer.setSize(width, height);
    camera.aspect = width / height;camera.updateProjectionMatrix();if (changed) home();invalidate();
  };
  const observer = new ResizeObserver(resize);observer.observe(host);controls.addEventListener('change', invalidate);
  const down = new T.Vector2();
  const pointerDown = (e: PointerEvent) => down.set(e.clientX, e.clientY);
  const pointerUp = (e: PointerEvent) => {
    if (down.distanceTo(new T.Vector2(e.clientX, e.clientY)) > 6) return;
    const rect = renderer.domElement.getBoundingClientRect(), ray = new T.Raycaster(), candidates: T.Mesh[] = [];
    ray.setFromCamera(new T.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1), camera);
    for (const part of state.mode === 'section' ? model.parts : []) part.group.traverseVisible(o => {if (o instanceof T.Mesh) candidates.push(o);});
    const hits = ray.intersectObjects(candidates, false).filter(hit => {
      const materials = Array.isArray((hit.object as T.Mesh).material) ? (hit.object as T.Mesh).material as T.Material[] : [(hit.object as T.Mesh).material as T.Material];
      return !materials.some(m => m.clippingPlanes?.some(p => p.distanceToPoint(hit.point) < 0));
    });
    let current: T.Object3D | undefined = hits[0]?.object;
    while (current && !current.userData.partId) current = current.parent ?? undefined;
    onSelect(current?.userData.partId ?? null);
  };
  renderer.domElement.addEventListener('pointerdown', pointerDown);renderer.domElement.addEventListener('pointerup', pointerUp);
  const visibility = () => {if (document.hidden) {renderer.setAnimationLoop(null);active = false;} else {last = -Infinity;invalidate();}};
  document.addEventListener('visibilitychange', visibility);
  const lost = (e: Event) => {e.preventDefault();contextLost = true;renderer.setAnimationLoop(null);active = false;onError('A cena 3D foi interrompida. Recarregue para restaurá-la. As explicações e fontes continuam disponíveis.');};
  renderer.domElement.addEventListener('webglcontextlost', lost);
  applyDisplay(model, state);resize();home();
  return {
    parts: model.parts,
    update(next) {
      const wasIsolated = state.isolated, oldSeparation = state.separation, oldMode = state.mode;state = next;
      applyDisplay(model, state);
      model.floor.visible = state.mode === 'section' && !state.isolated && state.separation === 0;
      model.guides.visible = state.mode === 'section' && !state.isolated && state.separation > .01;
      for (const part of model.parts) part.group.visible = (part.id !== 'water' || state.water > .001) && (!state.isolated || part.id === state.selected);
      model.root.traverse(o => {if (o instanceof T.Mesh) for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (m instanceof T.MeshStandardMaterial) m.wireframe = state.wireframe;});
      const selected = selectedPart();highlight.visible = Boolean(selected) && selected!.group.visible && !state.isolated && state.mode === 'section';
      if (selected) highlight.setFromObject(selected.group);
      if (!wasIsolated && state.isolated) {previousPose = {position: camera.position.clone(), target: controls.target.clone()};home();}
      if (wasIsolated && !state.isolated && previousPose) {camera.position.copy(previousPose.position);controls.target.copy(previousPose.target);controls.update();previousPose = null;}
      if ((oldSeparation !== state.separation || oldMode !== state.mode) && !state.isolated) home();
      renderer.domElement.dataset.water = state.water.toFixed(3);renderer.domElement.dataset.separation = state.separation.toFixed(3);renderer.domElement.dataset.mode = state.mode;renderer.domElement.dataset.poreWater = String(state.poreWater);invalidate();
    },
    home,
    focus(id) {const part = model.parts.find(p => p.id === id);if (part) {controls.target.copy(fit(camera, new T.Box3().setFromObject(part.group), direction));controls.update();invalidate();}},
    zoom(factor) {camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target);controls.update();invalidate();},
    capture(portrait = false) {saveSceneImage(renderer, scene, camera, bounds(), portrait, state.mode);invalidate();},
    dispose() {
      disposed = true;renderer.setAnimationLoop(null);observer.disconnect();controls.removeEventListener('change', invalidate);controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', pointerDown);renderer.domElement.removeEventListener('pointerup', pointerUp);renderer.domElement.removeEventListener('webglcontextlost', lost);document.removeEventListener('visibilitychange', visibility);
      model.dispose();env.dispose();highlight.geometry.dispose();(highlight.material as T.Material).dispose();renderer.dispose();renderer.domElement.remove();
    },
  };
}
