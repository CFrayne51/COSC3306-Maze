//used npm and vite to import, couldn't get the other fashion to work
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'; 
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

//INIT
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
//camera.position.set(0, 1.6, 0); --- Camera position set later when the walls are created

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//For updating the size renderer size whenever the window is resized
window.addEventListener('resize', () => {
  //Update camera aspect ratio
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  //Update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const textureLoader = new THREE.TextureLoader();

//STUFF

//skybox
const skyTexture = textureLoader.load('textures/sky.jpg');

const skyGeo = new THREE.SphereGeometry(500, 60, 40);
const skyMat = new THREE.MeshBasicMaterial({
  map: skyTexture,
  side: THREE.BackSide
});
const skydome = new THREE.Mesh(skyGeo, skyMat);
scene.add(skydome);

//ground
const groundTexture = textureLoader.load('textures/Ground.png');
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(25, 25);

const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), groundMaterial);
ground.rotation.x = -Math.PI / 2; //rotates the ground 90 degreesa so it lays flat
//ground.receiveShadow = true;
scene.add(ground);


//walls
const TILE_SIZE = 2;
camera.position.set(1 * TILE_SIZE, 1.6, 1 * TILE_SIZE); //Set position of camera so it starts inside the maze 
const wallGeometry = new THREE.BoxGeometry(TILE_SIZE, TILE_SIZE, TILE_SIZE);
const wallTexture = textureLoader.load('textures/Wall.jpg');
wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(1, 1);

const wallMaterial = new THREE.MeshStandardMaterial({ map: wallTexture});

function createWall(x, z) {
  const wall = new THREE.Mesh(wallGeometry, wallMaterial);
  wall.position.set(x, TILE_SIZE / 2, z);
  //wall.castShadow = true;
  scene.add(wall);
}

//place walls
const mazeLayout = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0],
  [1, 0, 0, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 1],
  [1, 1, 0, 1, 1, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];

mazeLayout.forEach((row, rowIndex) => {
  row.forEach((cell, colIndex) => {
    if (cell === 1) {
      const x = colIndex * TILE_SIZE;
      const z = rowIndex * TILE_SIZE;
      createWall(x, z);
    }
  });
});

//OBJECTS
const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();

//Not sure why this one isn't working, let me know
mtlLoader.load('/models/grassandrocks.mtl', (materials) => {
  materials.preload();

objLoader.load(
  '/models/grassandrocks.obj',
  function (object) {
    console.log('Loaded object:', object);
    object.position.set(TILE_SIZE*2, 1, TILE_SIZE*2);
    scene.add(object);
  },
	function ( xhr ) {
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},
	function ( err ) {
		console.error( 'An error happened' );
	});
});

//rubber duck
objLoader.load(
  '/models/Duck.obj',
  function (object) {
    object.position.set(TILE_SIZE*5, 0, TILE_SIZE);
    object.scale.set(0.04,0.04,0.04)
    object.rotation.y = Math.PI / 2;
    object.traverse(child => {
      if (child.isMesh) {
        child.material = wallMaterial; //applying the walls texture
      }
    });
    scene.add(object);
  },
  function ( xhr ) {
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},
	// onError callback
	function ( err ) {
		console.error( 'An error happened' );
	}
);

//LIGHT
//ambient
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

//directional
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

//shadows --- Doesn't function properly
//renderer.shadowMap.enabled = true;
//directionalLight.castShadow = true;
//directionalLight.shadow.mapSize.width = 1024;
//directionalLight.shadow.mapSize.height = 1024;
//directionalLight.shadow.camera.near = 0.5;
//directionalLight.shadow.camera.far = 50;

//CONTROLS
//mouse controls
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());
scene.add(controls.getObject());

//keyboard controls
const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false
};
//Move when WASD or arrow keys are pressed down
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      keys.forward = true;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      keys.left = true;
      break;
    case 'ArrowDown':
    case 'KeyS':
      keys.backward = true;
      break;
    case 'ArrowRight':
    case 'KeyD':
      keys.right = true;
      break;
  }
});
//Stop moving when keys are let up
document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      keys.forward = false;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      keys.left = false;
      break;
    case 'ArrowDown':
    case 'KeyS':
      keys.backward = false;
      break;
    case 'ArrowRight':
    case 'KeyD':
      keys.right = false;
      break;
  }
});
const speed = 0.05;

//ANIMATE
function animate() {
  requestAnimationFrame(animate);
  
  //movement
  const direction = new THREE.Vector3();

  if (keys.forward) direction.z -= 1;
  if (keys.backward) direction.z += 1;
  if (keys.left) direction.x -= 1;
  if (keys.right) direction.x += 1;

  direction.normalize();
  controls.moveRight(direction.x * speed);
  controls.moveForward(-direction.z * speed);

  renderer.render(scene, camera);
}
animate();
