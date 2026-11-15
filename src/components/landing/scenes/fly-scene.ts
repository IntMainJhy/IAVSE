import * as THREE from 'three';

export type FlyScene = {
  render(time: number, x: number, y: number): void;
  resize(width: number, height: number): void;
  dispose(): void;
};

/** A front-facing character cloth. The host owns motion, input and lifecycle. */
export function createScene(canvas: HTMLCanvasElement): FlyScene {
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: false, powerPreference: 'low-power'});
  renderer.setClearColor(0x101113);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
  camera.position.set(0, 0, 3.12);
  let disposed = false;
  let atlas: THREE.CanvasTexture | undefined;
  let material: THREE.ShaderMaterial | undefined;
  let geometry: THREE.PlaneGeometry | undefined;

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    geometry?.dispose();
    material?.dispose();
    atlas?.dispose();
    scene.clear();
    renderer.dispose();
  };

  try {
    const symbols = [...'01.:+-/\\<>[]{}=*_#%@IAVSEabcdefghijklmnopqrstuvwxyz0123456789'];
    const sheet = document.createElement('canvas');
    sheet.width = 512;
    sheet.height = 640;
    const context = sheet.getContext('2d');
    if (!context) throw new Error('Character atlas unavailable');
    context.fillStyle = '#000';
    context.fillRect(0, 0, sheet.width, sheet.height);
    context.fillStyle = '#fff';
    context.font = '500 53px Menlo, Consolas, monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    symbols.forEach((symbol, index) => context.fillText(symbol, (index % 8) * 64 + 32, Math.floor(index / 8) * 80 + 39));
    atlas = new THREE.CanvasTexture(sheet);
    atlas.minFilter = THREE.LinearMipmapLinearFilter;
    atlas.magFilter = THREE.LinearFilter;
    atlas.generateMipmaps = true;
    const glyphAtlas = {texture: atlas, count: symbols.length, letters: [...'IAVSE'].map(letter => symbols.indexOf(letter))};
    const uniforms = {
      uTime: {value: 0},
      uPointer: {value: new THREE.Vector2()},
      uViewport: {value: new THREE.Vector2(1, 1)},
      uGrid: {value: new THREE.Vector2(1, 1)},
      uAtlas: {value: glyphAtlas.texture},
      uCount: {value: glyphAtlas.count},
    };
    material = new THREE.ShaderMaterial({
      side: THREE.FrontSide,
      uniforms,
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vPosition;
      float surface(vec2 p) {
        float diagonal = p.x * 3.3 + p.y * 4.5;
        float broadFold = sin(diagonal + sin(p.x * 1.5) * 1.25 - uTime * .22);
        float crossingFold = sin(p.x * 5.4 - p.y * 3.1 + uTime * .13);
        return broadFold * .22 + crossingFold * .085 + sin(p.y * 8.0 + p.x * 1.9 + uTime * .2) * .035;
      }
      void main() {
        vUv = uv;
        vec3 p = position;
        float fold = surface(p.xy);
        p.z = fold;
        p.y += sin(p.x * 2.7 + p.y * 2.2 - uTime * .19) * .095;
        p.x += sin(p.y * 4.0 + p.x * 1.3 + uTime * .12) * .045;
        vPosition = (modelMatrix * vec4(p, 1.0)).xyz;
        gl_Position = projectionMatrix * viewMatrix * vec4(vPosition, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec2 uPointer;
      uniform vec2 uViewport;
      uniform vec2 uGrid;
      uniform sampler2D uAtlas;
      uniform float uCount;
      varying vec2 vUv;
      varying vec3 vPosition;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec2 grid = vUv * uGrid + vec2(uTime * .12, uTime * .34);
        vec2 cell = floor(grid);
        vec2 local = fract(grid);
        float index = floor(hash(cell) * uCount);
        // Quiet strings of the community's name pass through the single-character weave.
        float groupX = floor(cell.x / 12.0);
        if (hash(vec2(groupX, cell.y)) > .91 && mod(cell.x, 12.0) < 5.0) {
          float letter = mod(cell.x, 12.0);
          index = letter < .5 ? ${glyphAtlas.letters[0]}.0 : letter < 1.5 ? ${glyphAtlas.letters[1]}.0 : letter < 2.5 ? ${glyphAtlas.letters[2]}.0 : letter < 3.5 ? ${glyphAtlas.letters[3]}.0 : ${glyphAtlas.letters[4]}.0;
        }
        vec2 atlasUV = vec2((mod(index, 8.0) + local.x) / 8.0, (7.0 - floor(index / 8.0) + local.y) / 8.0);
        float glyph = texture2D(uAtlas, atlasUV).r;
        vec3 normal = normalize(cross(dFdx(vPosition), dFdy(vPosition)));
        vec3 light = normalize(vec3(-.7 + uPointer.x * 1.1, .8 - uPointer.y * .7, 1.0));
        float diffuse = max(dot(normal, light), 0.0);
        float ridge = pow(max(dot(normal, normalize(vec3(.3, .5, 1.0))), 0.0), 12.0);
        float illumination = .11 + diffuse * .63 + ridge * .36;
        float variation = .64 + hash(cell + 37.0) * .36;
        vec2 screen = gl_FragCoord.xy / uViewport;
        // A local, soft reading area keeps the rest of the cloth visible edge to edge.
        float reading = exp(-pow((screen.x - .5) / .29, 4.0) - pow((screen.y - .34) / .22, 4.0));
        float dim = 1.0 - reading * .83;
        float edge = .63 + .37 * smoothstep(0.0, .16, screen.y);
        vec3 charcoal = vec3(.007, .008, .010) + vec3(.013, .014, .016) * illumination * dim;
        vec3 silver = vec3(.58, .61, .65) * illumination * variation * dim * edge;
        gl_FragColor = vec4(charcoal + glyph * silver, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    });
    geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);
    renderer.debug.onShaderError = () => { throw new Error('Character shader unavailable'); };

    return {
      render(time, x, y) {
        if (disposed) return;
        uniforms.uTime.value = time;
        uniforms.uPointer.value.set(x, y);
        renderer.render(scene, camera);
      },
      resize(width, height) {
        if (disposed) return;
        width = Math.max(1, width);
        height = Math.max(1, height);
        const pixelCap = Math.sqrt(3000000 / (width * height));
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5, pixelCap);
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        geometry?.dispose();
        geometry = new THREE.PlaneGeometry(camera.aspect * 2.95, 2.95, width < 600 ? 144 : 240, 160);
        mesh.geometry = geometry;
        const mobile = width < 600;
        uniforms.uGrid.value.set(width / (mobile ? 10.5 : 11.2) * 1.37, height / (mobile ? 16 : 17) * 1.37);
        uniforms.uViewport.value.set(Math.floor(width * dpr), Math.floor(height * dpr));
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
