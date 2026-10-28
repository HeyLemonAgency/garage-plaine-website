// The 3D turntable behind the S-Cross on /suzuki. Loaded on demand (three.js is large), it
// spins the car slowly on a glossy showroom floor, lets the visitor turn it by dragging, and
// reports where each detail point sits on screen so the page can draw its own labels.
import {
  ACESFilmicToneMapping,
  BackSide,
  BoxGeometry,
  Box3,
  CanvasTexture,
  Color,
  DoubleSide,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Material,
  type Object3D,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";

export type Vec3 = readonly [number, number, number];

/** A detail point, in car units: x from -0.5 (rear) to 0.5 (nose), y from 0 (ground) to 1
 *  (roof), z from -0.5 to 0.5 across the width; `normal` is the way the point faces. */
export type SpinSpot = { id: string; at: Vec3; normal: Vec3 };

export type SpinModel = {
  url: string;
  /** Turn applied to the file so that the nose points to +x (radians). */
  yawFix: number;
  /** Real length of the car in metres, to scale the file. */
  length: number;
  /** Material names by role. When none are given, roles are guessed from the names. */
  paint: readonly string[];
  glass: readonly string[];
  chrome: readonly string[];
  rubber: readonly string[];
  /** Finishes for the file's other materials (many exports come out flat and matte). */
  finish: Readonly<Record<string, Finish>>;
  /** Lamps that light up while the matching detail point is open. */
  lamps: Readonly<Record<string, readonly string[]>>;
};

export type Finish = {
  color?: string;
  metalness?: number;
  roughness?: number;
  clearcoat?: number;
  /** Below 1, the material becomes see-through (lamp lenses). */
  opacity?: number;
  /** A colour it glows with, faintly, all the time (tail lights). */
  glow?: string;
  /** Drawn after the tinted glass, so lamps behind a shared cover keep their colour. */
  overGlass?: boolean;
};

export type SpinPoint = { id: string; x: number; y: number; facing: number };

export type SpinOptions = {
  stage: HTMLElement;
  canvas: HTMLCanvasElement;
  model: SpinModel;
  spots: readonly SpinSpot[];
  paint: string;
  autoRotate: boolean;
  reducedMotion: boolean;
  /** Where the car faces at first (radians, 0 = side on). */
  startYaw: number;
  onProgress: (share: number) => void;
  onReady: () => void;
  onError: (error: unknown) => void;
  onFrame: (points: SpinPoint[], yaw: number) => void;
  /** The visitor turned the car by hand (closes any open detail). */
  onDrag: () => void;
};

export type Spin = {
  setPaint: (hex: string) => void;
  focus: (id: string | null) => void;
  setAutoRotate: (on: boolean) => void;
  snapshot: () => string;
  dispose: () => void;
};

const TURN = Math.PI * 2;
/** One full turn every 40 seconds: slow enough to read the car. */
const SPIN_SPEED = TURN / 40;
const ELEVATION = 0.16;

const damp = (from: number, to: number, rate: number, dt: number) =>
  to + (from - to) * Math.exp(-rate * dt);
const wrapAngle = (a: number) => a - TURN * Math.round(a / TURN);

const guesses: [RegExp, keyof Pick<SpinModel, "paint" | "glass" | "chrome" | "rubber">][] = [
  [/glass|vidrio|cristal|window|windshield|verre/i, "glass"],
  [/chrom|cromo|mirror_chrome|metal_bright/i, "chrome"],
  [/tire|tyre|rubber|llanta|neum|pneu/i, "rubber"],
  [/paint|body|carro|pintura|color_car|exterior/i, "paint"],
];

/** A soft dark ellipse under the car, drawn once on a canvas. */
function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, "rgba(0,0,0,0.85)");
  grad.addColorStop(0.55, "rgba(0,0,0,0.42)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/**
 * What the car reflects: a dark studio lit by long softbox strips, as in car photography.
 * The strips draw clean highlights along the bonnet and the flanks instead of a grey wash.
 */
function studio() {
  const room = new Scene();
  room.add(
    new Mesh(
      new BoxGeometry(40, 16, 40),
      new MeshBasicMaterial({ color: 0x0c1016, side: BackSide }),
    ),
  );
  const panel = (w: number, h: number, at: Vec3, rx: number, ry: number, power: number) => {
    const m = new Mesh(
      new PlaneGeometry(w, h),
      new MeshBasicMaterial({ color: new Color(1, 1, 1).multiplyScalar(power), side: DoubleSide }),
    );
    m.position.set(...at);
    m.rotation.set(rx, ry, 0);
    room.add(m);
  };
  panel(18, 1.1, [0, 7, 4], Math.PI / 2, 0, 9);
  panel(18, 1.1, [0, 7, -4], Math.PI / 2, 0, 7);
  panel(1.2, 14, [0, 7.5, 0], Math.PI / 2, 0, 3);
  panel(8, 5, [-14, 3.5, 2], 0, Math.PI / 2, 2.6);
  panel(8, 5, [14, 3.5, -2], 0, -Math.PI / 2, 2.2);
  panel(14, 3, [0, 2.5, 15], 0, Math.PI, 1.4);
  panel(14, 3, [0, 2.5, -15], 0, 0, 0.8);
  return room;
}

/** The reflection on the floor, fading out away from the car. */
const floorShader = {
  name: "SpinFloor",
  uniforms: {
    color: { value: new Color(0x7f7f7f) },
    tDiffuse: { value: null },
    textureMatrix: { value: null },
    opacity: { value: 0.32 },
  },
  vertexShader: /* glsl */ `
    uniform mat4 textureMatrix;
    varying vec4 vUv;
    varying vec2 vPlane;
    void main() {
      vUv = textureMatrix * vec4(position, 1.0);
      vPlane = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float opacity;
    varying vec4 vUv;
    varying vec2 vPlane;
    void main() {
      vec4 base = texture2DProj(tDiffuse, vUv);
      float d = length((vPlane - 0.5) * vec2(1.0, 1.6));
      float fade = smoothstep(0.5, 0.06, d);
      gl_FragColor = vec4(base.rgb, base.a * opacity * fade);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
};

export function createSpin(o: SpinOptions): Spin {
  const lowPower = window.matchMedia("(max-width: 700px), (pointer: coarse)").matches;
  const renderer = new WebGLRenderer({
    canvas: o.canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.5 : 2));

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const studioScene = studio();
  const env = pmrem.fromScene(studioScene, 0.02).texture;
  studioScene.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    (mesh.material as Material).dispose();
  });
  scene.environment = env;
  scene.environmentIntensity = 1;

  const key = new DirectionalLight(0xffffff, 2.4);
  key.position.set(4, 8, 6);
  const rim = new DirectionalLight(0xbcd0ff, 1.6);
  rim.position.set(-7, 3, -5);
  scene.add(key, rim);

  const camera = new PerspectiveCamera(26, 1, 0.1, 100);
  const turntable = new Group();
  scene.add(turntable);

  let w = 1;
  let h = 1;
  let dims = { L: 4.3, H: 1.6, W: 1.8 };
  let yaw = o.startYaw;
  let velocity = 0;
  let speed = 0;
  let target: number | null = null;
  let zoom = 1;
  let zoomTarget = 1;
  let lookY = 0.65;
  let lookTarget = 0.65;
  let auto = o.autoRotate && !o.reducedMotion;
  let lastTouch = -Infinity;
  let ready = false;
  let visible = true;
  let raf = 0;
  let last = performance.now();
  let activeId: string | null = null;
  let reflector: Reflector | null = null;
  let drag: { x: number; y: number; t: number; moved: boolean; id: number } | null = null;
  /** What the last frame showed: when nothing has moved, the next frame is skipped. */
  let shown = "";
  let dragging = false;

  const paint = new MeshPhysicalMaterial({
    color: new Color(o.paint),
    metalness: 0.55,
    roughness: 0.32,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1,
  });
  const paintTarget = new Color(o.paint);
  const lampMats = new Map<string, MeshStandardMaterial[]>();
  const anchors = o.spots.map((s) => ({
    id: s.id,
    local: new Vector3(),
    normal: new Vector3(...s.normal).normalize(),
    spot: s,
  }));

  const roles = ["paint", "glass", "chrome", "rubber"] as const;
  const explicit = roles.some((role) => o.model[role].length > 0);
  function roleOf(material: Material, mesh: Object3D) {
    for (const role of roles) if (o.model[role].includes(material.name)) return role;
    if (explicit) return null;
    const name = material.name || mesh.name;
    for (const [re, role] of guesses) if (re.test(name)) return role;
    return null;
  }

  function finish(material: Material) {
    const f = o.model.finish[material.name];
    if (!f) return material;
    const m = new MeshPhysicalMaterial({
      name: material.name,
      color: f.color ? new Color(f.color) : (material as MeshStandardMaterial).color,
      map: (material as MeshStandardMaterial).map ?? null,
      metalness: f.metalness ?? 0,
      roughness: f.roughness ?? 0.6,
      clearcoat: f.clearcoat ?? 0,
      clearcoatRoughness: 0.08,
      side: material.side,
    });
    const opacity = f.opacity ?? (material.transparent ? material.opacity : 1);
    if (opacity < 1 || f.overGlass) {
      m.transparent = true;
      m.opacity = opacity;
      m.depthWrite = opacity >= 1;
    }
    if (f.glow) {
      m.emissive = new Color(f.glow);
      m.emissiveIntensity = 0.6;
    }
    material.dispose();
    return m;
  }

  function tune(source: Material, mesh: Object3D): Material {
    const role = roleOf(source, mesh);
    const material = role ? source : finish(source);
    const std = material as MeshStandardMaterial;
    for (const [id, names] of Object.entries(o.model.lamps))
      if (names.includes(material.name) && "emissive" in std) {
        const lamp = std.clone();
        lamp.emissive = new Color(0xeef4ff);
        lamp.emissiveIntensity = 0;
        lampMats.set(id, [...(lampMats.get(id) ?? []), lamp]);
        return lamp;
      }
    if (role === "paint") return paint;
    if (role === "glass")
      return new MeshPhysicalMaterial({
        color: 0x05070a,
        metalness: 0,
        roughness: 0.04,
        transparent: true,
        opacity: 0.86,
        envMapIntensity: 0.55,
        depthWrite: false,
      });
    if (role === "chrome")
      return new MeshStandardMaterial({ color: 0xdfe3e8, metalness: 1, roughness: 0.12 });
    if (role === "rubber")
      return new MeshStandardMaterial({ color: 0x111214, metalness: 0, roughness: 0.92 });
    if ("envMapIntensity" in std) std.envMapIntensity = 1.1;
    return material;
  }

  function prepare(root: Object3D) {
    root.rotation.y = o.model.yawFix;
    const holder = new Group();
    holder.add(root);
    holder.updateMatrixWorld(true);
    const box = new Box3().setFromObject(holder);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    root.position.sub(new Vector3(center.x, box.min.y, center.z));
    const scale = o.model.length / size.x;
    holder.scale.setScalar(scale);
    dims = { L: size.x * scale, H: size.y * scale, W: size.z * scale };
    root.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      const name = Array.isArray(mesh.material) ? mesh.material[0]?.name : mesh.material.name;
      if (name && o.model.finish[name]?.overGlass) mesh.renderOrder = 3;
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map((m) => tune(m, mesh))
        : tune(mesh.material, mesh);
    });
    for (const a of anchors)
      a.local.set(a.spot.at[0] * dims.L, a.spot.at[1] * dims.H, a.spot.at[2] * dims.W);

    const shadow = new Mesh(
      new PlaneGeometry(dims.L * 1.22, dims.W * 1.5),
      new MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.004;
    shadow.renderOrder = 2;
    turntable.add(holder, shadow);

    const floorSize = Math.hypot(dims.L, dims.W) * 1.7;
    reflector = new Reflector(new PlaneGeometry(floorSize, floorSize), {
      textureWidth: Math.round(w * renderer.getPixelRatio() * (lowPower ? 0.4 : 0.6)),
      textureHeight: Math.round(h * renderer.getPixelRatio() * (lowPower ? 0.4 : 0.6)),
      clipBias: 0.003,
      shader: floorShader,
    });
    const floorMat = reflector.material as Material;
    floorMat.transparent = true;
    floorMat.depthWrite = false;
    reflector.rotation.x = -Math.PI / 2;
    reflector.renderOrder = 1;
    scene.add(reflector);
    lookY = lookTarget = dims.H * 0.42;
  }

  function resize() {
    w = Math.max(1, o.stage.clientWidth);
    h = Math.max(1, o.stage.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // On wide screens the car sits right of centre, leaving room for the title.
    const shift = w > 980 ? w * 0.15 : 0;
    camera.setViewOffset(w, h, -shift, 0, w, h);
    camera.updateProjectionMatrix();
    reflector
      ?.getRenderTarget()
      .setSize(
        Math.round(w * renderer.getPixelRatio() * (lowPower ? 0.4 : 0.6)),
        Math.round(h * renderer.getPixelRatio() * (lowPower ? 0.4 : 0.6)),
      );
  }

  function placeCamera() {
    const vfov = (camera.fov * Math.PI) / 180;
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
    // Fit the car whichever way it faces (its widest extent is the diagonal): on wide
    // screens into the right part of the stage, on phones into almost all of it.
    const reach = Math.hypot(dims.L, dims.W) / 2;
    const share = w > 980 ? 0.54 : 0.94;
    const byWidth = reach / (share * Math.tan(hfov / 2));
    const byHeight = dims.H / (0.46 * 2 * Math.tan(vfov / 2));
    const dist = Math.max(byWidth, byHeight) * zoom;
    camera.position.set(0, lookY + Math.sin(ELEVATION) * dist, Math.cos(ELEVATION) * dist);
    camera.lookAt(0, lookY, 0);
  }

  const v = new Vector3();
  const n = new Vector3();
  const toCam = new Vector3();
  function points(): SpinPoint[] {
    turntable.updateMatrixWorld();
    return anchors.map((a) => {
      v.copy(a.local).applyMatrix4(turntable.matrixWorld);
      n.copy(a.normal).applyQuaternion(turntable.quaternion);
      toCam.copy(camera.position).sub(v).normalize();
      const facing = n.dot(toCam);
      v.project(camera);
      return { id: a.id, x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, facing };
    });
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!ready || !visible) return;
    const quick = o.reducedMotion ? 60 : 1;
    if (target !== null) {
      yaw = damp(yaw, target, 4.5 * quick, dt);
      speed = 0;
    } else if (!dragging) {
      if (Math.abs(velocity) > 0.01) {
        yaw += velocity * dt;
        velocity *= Math.exp(-2.6 * dt);
      } else if (auto && now - lastTouch > 2600) {
        speed = damp(speed, SPIN_SPEED, 1.2, dt);
        yaw += speed * dt;
      }
    }
    turntable.rotation.y = yaw;
    zoom = damp(zoom, zoomTarget, 3.5 * quick, dt);
    lookY = damp(lookY, lookTarget, 3.5 * quick, dt);
    paint.color.lerp(paintTarget, 1 - Math.exp(-6 * quick * dt));
    let glow = 0;
    for (const [id, mats] of lampMats)
      for (const m of mats) {
        m.emissiveIntensity = damp(m.emissiveIntensity, id === activeId ? 2.2 : 0, 5, dt);
        glow += m.emissiveIntensity;
      }
    // Render only when something changed: a still car costs no battery.
    const state = [
      yaw.toFixed(5),
      zoom.toFixed(4),
      lookY.toFixed(4),
      paint.color.getHexString(),
      glow.toFixed(3),
      w,
      h,
    ].join();
    if (state === shown) return;
    shown = state;
    placeCamera();
    renderer.render(scene, camera);
    o.onFrame(points(), yaw);
  }

  // Dragging: sideways turns the car; on touch screens an upward swipe still scrolls the page.
  function down(e: PointerEvent) {
    if ((e.target as Element).closest("button, a")) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false, id: e.pointerId };
  }
  function move(e: PointerEvent) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < 6) return;
      if (e.pointerType !== "mouse" && Math.abs(dy) > Math.abs(dx)) {
        drag = null;
        return;
      }
      drag.moved = dragging = true;
      o.stage.setPointerCapture(e.pointerId);
      target = null;
      zoomTarget = 1;
      lookTarget = dims.H * 0.42;
      o.onDrag();
    }
    const now = performance.now();
    const turn = (dx / Math.max(w, 600)) * TURN * 0.85;
    yaw += turn;
    velocity = turn / Math.max(0.008, (now - drag.t) / 1000);
    drag.x = e.clientX;
    drag.y = e.clientY;
    drag.t = now;
    lastTouch = now;
  }
  function up(e: PointerEvent) {
    if (!drag || e.pointerId !== drag.id) return;
    if (performance.now() - drag.t > 80) velocity = 0;
    drag = null;
    dragging = false;
    lastTouch = performance.now();
  }
  o.stage.addEventListener("pointerdown", down);
  o.stage.addEventListener("pointermove", move);
  o.stage.addEventListener("pointerup", up);
  o.stage.addEventListener("pointercancel", up);

  const sizer = new ResizeObserver(resize);
  sizer.observe(o.stage);
  const watcher = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting;
    last = performance.now();
  });
  watcher.observe(o.stage);
  const lost = (e: Event) => {
    e.preventDefault();
    o.onError(new Error("WebGL context lost"));
  };
  o.canvas.addEventListener("webglcontextlost", lost);
  resize();

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(
    o.model.url,
    (gltf) => {
      prepare(gltf.scene);
      resize();
      ready = true;
      last = performance.now();
      o.onReady();
    },
    (e) => {
      if (e.total) o.onProgress(e.loaded / e.total);
    },
    (error) => o.onError(error),
  );
  raf = requestAnimationFrame(frame);

  return {
    setPaint(hex) {
      paintTarget.set(hex);
    },
    focus(id) {
      activeId = id;
      const a = anchors.find((x) => x.id === id);
      if (!a) {
        target = null;
        zoomTarget = 1;
        lookTarget = dims.H * 0.42;
        lastTouch = performance.now();
        return;
      }
      velocity = 0;
      const flat = Math.hypot(a.normal.x, a.normal.z);
      // Face the point towards the camera, slightly turned for a three-quarter view.
      const want = flat > 0.25 ? -Math.atan2(a.normal.x, a.normal.z) + 0.32 : yaw;
      target = yaw + wrapAngle(want - yaw);
      // Closer on wide screens; on phones the car already fills the frame.
      zoomTarget = w > 640 ? 0.82 : 0.97;
      lookTarget = Math.min(dims.H * 0.55, Math.max(dims.H * 0.3, a.local.y * 0.85));
    },
    setAutoRotate(on) {
      auto = on && !o.reducedMotion;
      if (on) lastTouch = -Infinity;
    },
    snapshot() {
      placeCamera();
      renderer.render(scene, camera);
      return renderer.domElement.toDataURL("image/png");
    },
    dispose() {
      cancelAnimationFrame(raf);
      sizer.disconnect();
      watcher.disconnect();
      o.stage.removeEventListener("pointerdown", down);
      o.stage.removeEventListener("pointermove", move);
      o.stage.removeEventListener("pointerup", up);
      o.stage.removeEventListener("pointercancel", up);
      o.canvas.removeEventListener("webglcontextlost", lost);
      scene.traverse((obj) => {
        const mesh = obj as Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) m.dispose();
      });
      reflector?.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
