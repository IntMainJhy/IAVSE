import * as THREE from 'three';

export type BrandScene = {
  render(time: number, x: number, y: number, open?: boolean): void;
  resize(width: number, height: number): void;
  dispose(): void;
};

type Disposable = {dispose(): void};
type Point = readonly [number, number];

function polygon(points: readonly Point[]) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], index) => index ? shape.lineTo(x, y) : shape.moveTo(x, y));
  shape.closePath();
  return shape;
}

function letterS() {
  const shape = new THREE.Shape();
  shape.moveTo(2.47, 2.97);
  shape.bezierCurveTo(2.13, 3.39, 1.69, 3.55, 1.23, 3.55);
  shape.bezierCurveTo(.46, 3.55, .02, 3.11, .02, 2.49);
  shape.bezierCurveTo(.02, 1.93, .39, 1.65, 1.08, 1.44);
  shape.lineTo(1.63, 1.27);
  shape.bezierCurveTo(1.91, 1.18, 2.03, 1.06, 2.03, .89);
  shape.bezierCurveTo(2.03, .63, 1.78, .48, 1.39, .48);
  shape.bezierCurveTo(.95, .48, .64, .67, .39, .98);
  shape.lineTo(-.04, .46);
  shape.bezierCurveTo(.29, .08, .78, -.1, 1.36, -.1);
  shape.bezierCurveTo(2.2, -.1, 2.73, .32, 2.73, .99);
  shape.bezierCurveTo(2.73, 1.58, 2.31, 1.91, 1.63, 2.11);
  shape.lineTo(1.08, 2.28);
  shape.bezierCurveTo(.82, 2.36, .7, 2.47, .7, 2.65);
  shape.bezierCurveTo(.7, 2.86, .91, 3.02, 1.24, 3.02);
  shape.bezierCurveTo(1.6, 3.02, 1.88, 2.84, 2.08, 2.61);
  shape.lineTo(2.47, 2.97);
  shape.closePath();
  return shape;
}

/** A scene only: the React host owns its clock, input, visibility and lifetime. */
export function createScene(canvas: HTMLCanvasElement): BrandScene {
  const resources = new Set<Disposable>();
  const own = <T extends Disposable>(value: T): T => { resources.add(value); return value; };
  let renderer: THREE.WebGLRenderer | undefined;
  let disposed = false;
  const scene = new THREE.Scene();
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    for (const resource of resources) resource.dispose();
    resources.clear();
    scene.clear();
    renderer?.dispose();
  };

  try {
    renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: false, powerPreference: 'low-power'});
    const view = renderer;
    view.outputColorSpace = THREE.SRGBColorSpace;
    view.toneMapping = THREE.ACESFilmicToneMapping;
    view.toneMappingExposure = 1.14;
    view.shadowMap.enabled = true;
    view.shadowMap.type = THREE.PCFShadowMap;
    scene.background = new THREE.Color('#f7f8fa');
    scene.fog = new THREE.Fog('#f7f8fa', 32, 70);
    const camera = new THREE.OrthographicCamera(-8, 8, 3, -3, .1, 100);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xaeb4bf, 2.05));
    const key = new THREE.DirectionalLight(0xffffff, 4.4);
    key.position.set(-2.4, 14, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, {left: -9, right: 9, top: 7, bottom: -5, near: .5, far: 28});
    key.shadow.normalBias = .035;
    key.shadow.bias = -.0001;
    key.shadow.radius = 3;
    key.shadow.intensity = .48;
    own(key.shadow);
    key.target.position.set(0, 1, 0);
    scene.add(key, key.target);
    const rim = new THREE.DirectionalLight(0xeaf0ff, 1.6);
    rim.position.set(7, 5, -4);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffffff, .8);
    fill.position.set(-8, 2, 6);
    scene.add(fill);

    const floor = new THREE.Mesh(own(new THREE.PlaneGeometry(200, 200)), own(new THREE.ShadowMaterial({color: 0x27313f, opacity: .22})));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -.19;
    floor.receiveShadow = true;
    scene.add(floor);

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 128;
    const context = shadowCanvas.getContext('2d');
    if (!context) throw new Error('Unable to create the studio contact shadow.');
    context.translate(256, 64);
    context.scale(256, 64);
    const gradient = context.createRadialGradient(0, 0, .02, 0, 0, 1);
    gradient.addColorStop(0, 'rgba(36,44,57,.28)');
    gradient.addColorStop(.5, 'rgba(36,44,57,.13)');
    gradient.addColorStop(1, 'rgba(36,44,57,0)');
    context.fillStyle = gradient;
    context.fillRect(-1, -1, 2, 2);
    const shadowTexture = own(new THREE.CanvasTexture(shadowCanvas));
    shadowTexture.colorSpace = THREE.SRGBColorSpace;
    const contact = new THREE.Mesh(own(new THREE.PlaneGeometry(15, 3.2)), own(new THREE.MeshBasicMaterial({map: shadowTexture, transparent: true, depthWrite: false, opacity: .65})));
    contact.rotation.x = -Math.PI / 2;
    contact.position.set(.25, -.18, .35);
    scene.add(contact);

    const letter = (shape: THREE.Shape, x: number, blue = false) => {
      const geometry = own(new THREE.ExtrudeGeometry(shape, {
        depth: .64, steps: 1, bevelEnabled: true, bevelSegments: 10,
        bevelSize: .075, bevelThickness: .075, curveSegments: 48,
      }));
      const positions = geometry.attributes.position;
      const colors = new Float32Array(positions.count * 3);
      const side = new THREE.Color(blue ? '#3868f8' : '#646b75');
      const face = new THREE.Color('#fafbfe');
      const color = new THREE.Color();
      for (let index = 0; index < positions.count; index++) {
        color.copy(side).lerp(face, THREE.MathUtils.smoothstep(positions.getZ(index), .56, .71));
        colors.set([color.r, color.g, color.b], index * 3);
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const material = own(new THREE.MeshPhysicalMaterial({
        color: 0xffffff, vertexColors: true, roughness: .32, metalness: .06,
        clearcoat: .24, clearcoatRoughness: .42,
      }));
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = x;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    const sculpture = new THREE.Group();
    sculpture.position.set(-.18, 0, 0);
    scene.add(sculpture);
    sculpture.add(letter(polygon([[0, 0], [0, 3.5], [.76, 3.5], [.76, 0]]), -6.27));
    const a = polygon([[0, 0], [1.04, 3.5], [1.87, 3.5], [2.91, 0], [2.12, 0], [1.91, .78], [.99, .78], [.77, 0]]);
    const hole = new THREE.Path();
    hole.moveTo(1.17, 1.43);
    hole.lineTo(1.75, 1.43);
    hole.lineTo(1.46, 2.62);
    hole.closePath();
    a.holes.push(hole);
    sculpture.add(letter(a, -5.12));
    const leftWing = new THREE.Group();
    const rightWing = new THREE.Group();
    leftWing.position.x = rightWing.position.x = -.4;
    leftWing.add(letter(polygon([[-1.49, 3.5], [-.66, 3.5], [0, .68], [0, 0], [-.42, 0]]), 0, true));
    rightWing.add(letter(polygon([[0, 0], [0, .68], [.66, 3.5], [1.49, 3.5], [.42, 0]]), 0, true));
    sculpture.add(leftWing, rightWing);
    sculpture.add(letter(letterS(), 1.46));
    sculpture.add(letter(polygon([[0, 0], [0, 3.5], [2.39, 3.5], [2.39, 2.83], [.76, 2.83], [.76, 2.14], [2.14, 2.14], [2.14, 1.48], [.76, 1.48], [.76, .68], [2.39, .68], [2.39, 0]]), 4.6));

    let opening = 0;
    let lastTime: number | null = null;
    const render = (time: number, x: number, y: number, open = false) => {
      if (disposed) return;
      const target = open ? 1 : 0;
      const elapsed = lastTime === null ? 0 : Math.max(0, Math.min(time - lastTime, .05));
      // A repeated clock value is a deliberate still render, including reduced motion.
      opening = elapsed === 0 ? target : THREE.MathUtils.lerp(opening, target, 1 - Math.exp(-elapsed * 7));
      lastTime = time;
      sculpture.position.y = Math.sin(time * .62) * .025;
      leftWing.rotation.y = -.08 - opening * .48;
      rightWing.rotation.y = .08 + opening * .48;
      leftWing.position.x = -.4 - opening * .13;
      rightWing.position.x = -.4 + opening * .13;
      key.position.x = -2.4 + THREE.MathUtils.clamp(x, -1, 1) * .65;
      key.position.z = 6 + THREE.MathUtils.clamp(y, -1, 1) * .35;
      view.render(scene, camera);
    };
    const resize = (width: number, height: number) => {
      if (disposed || width <= 0 || height <= 0) return;
      const mobile = width <= 700;
      const visibleWidth = mobile ? 16.2 : 16.3;
      const visibleHeight = visibleWidth * height / width;
      Object.assign(camera, {left: -visibleWidth / 2, right: visibleWidth / 2, top: visibleHeight / 2, bottom: -visibleHeight / 2});
      camera.position.set(mobile ? 1.3 : 3.3, mobile ? 4.6 : 6.6, 23);
      camera.lookAt(0, mobile ? 1.45 : 1.42, 0);
      camera.updateProjectionMatrix();
      view.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      view.setSize(width, height, false);
    };
    return {render, resize, dispose};
  } catch (error) {
    dispose();
    throw error;
  }
}
