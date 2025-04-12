import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

//INIT
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.6, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();

//SKYBOX
const skyTexture = textureLoader.load('textures/sky.jpg');

const skyGeo = new THREE.SphereGeometry(500, 60, 40);
const skyMat = new THREE.MeshBasicMaterial({
  map: skyTexture,
  side: THREE.BackSide
});
const skydome = new THREE.Mesh(skyGeo, skyMat);
scene.add(skydome);

//CONTROLS
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());
scene.add(controls.getObject());

//ANIMATE
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
