import * as THREE from 'three'; // three จากที่กำหนดใน importmap
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';
import { M3D, createLabel2D, FPS } from './utils-module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

document.addEventListener("DOMContentLoaded", main);

function main() {
// ใช้ M3D ที่นำเข้ามา
document.body.appendChild(M3D.renderer.domElement);


// === ตั้งค่าฉากและเรนเดอร์ ===
M3D.renderer.setPixelRatio(window.devicePixelRatio);
M3D.renderer.shadowMap.enabled = true;
M3D.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
M3D.renderer.physicallyCorrectLights = true;
M3D.renderer.outputEncoding = THREE.sRGBEncoding;


//  fog 
M3D.scene.fog = new THREE.Fog(0x87CEEB, 100, 400);

// === ตั้งค่ากล้องเริ่มต้น ===
M3D.camera.position.set(1, 5, 100);
M3D.camera.lookAt(0, 0, 0);

  // === พื้น (ท้องนา) ===
  const groundGeo = new THREE.PlaneGeometry(200, 200);
  const groundMat = new THREE.MeshPhongMaterial({ color: 0x228B22 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  M3D.scene.add(ground);

  // === ภูเขา ===
  const loaderMountain = new GLTFLoader();
  loaderMountain.load('models/mountain.glb', (gltf) => {
    const mountain = gltf.scene;
    mountain.scale.set(0.10, 0.2, 0.14);
    mountain.position.set(1, 1, -70);
    mountain.rotation.y = Math.PI / -2;
    mountain.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    M3D.scene.add(mountain);
  });

  // ===  พระอาทิตย์ ===
  const sunMat = new THREE.MeshPhongMaterial({
    color: 0xffff00,
    emissive: 0xffaa00,
  });
  const sunGeo = new THREE.SphereGeometry(10, 32, 32);
  const sun = new THREE.Mesh(sunGeo, sunMat);
  sun.position.set(50, 80, -100);
  M3D.scene.add(sun);

  // === 💡 แสงจากพระอาทิตย์ ===
  const sunlight = new THREE.DirectionalLight(0xffffff, 1.2);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  sunlight.shadow.camera.near = 1;
  sunlight.shadow.camera.far = 500;
  sunlight.shadow.camera.left = -150;
  sunlight.shadow.camera.right = 150;
  sunlight.shadow.camera.top = 150;
  sunlight.shadow.camera.bottom = -150;
  sunlight.position.copy(sun.position);
  M3D.scene.add(sunlight);
  M3D.scene.add(sunlight.target); 

  // ===  เมฆ ===
  const clouds = [];
  function createCloud(x, y, z) {
    const group = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    // สร้างเมฆแบบ 3 ก้อนรวมกัน
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.SphereGeometry(8, 16, 16);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(i * 6 - 6, Math.random() * 2 - 1, 0);
      group.add(mesh);
    }
    group.position.set(x, y, z);
    group.userData.baseX = x;
    group.userData.baseY = y;
    M3D.scene.add(group);
    clouds.push(group);
  }

  // วางเมฆ
  createCloud(-80, 35, -30);
  createCloud(-40, 38, -20);
  createCloud(0, 40, -10);
  createCloud(40, 36, -15);
  createCloud(80, 38, -20);

  // ===  ต้นไม้ ===
  function createTree(x, z) {
    const trunkGeo = new THREE.CylinderGeometry(1, 1, 8);
    const trunkMat = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, 4, z);
    trunk.castShadow = true;

    const crownGeo = new THREE.SphereGeometry(5, 16, 16);
    const crownMat = new THREE.MeshPhongMaterial({ color: 0x006400 });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.set(x, 10, z);
    crown.castShadow = true;

    M3D.scene.add(trunk);
    M3D.scene.add(crown);
  }

  const treeSpacing = 20;
  const rows = 3;
  const cols = 10;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = (j - (cols - 1) / 2) * treeSpacing;
      const z = (i - (rows - 1) / 2) * treeSpacing;
      createTree(x, z);
    }
  }

  // ===  กระท่อม ===
  const loaderHouse = new GLTFLoader();
  loaderHouse.load('models/forest_hut.glb', (gltf) => {
    const house = gltf.scene;
    house.scale.set(3, 3, 3);
    house.position.set(10, 3, 80);
    house.rotation.y = Math.PI / 1;
    house.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    M3D.scene.add(house);
  });

  // === แม่น้ำ ===
  const riverGeo = new THREE.PlaneGeometry(200, 30);
  const riverMat = new THREE.MeshPhongMaterial({
    color: 0x1E90FF,
    transparent: true,
    opacity: 0.8,
  });
  const river = new THREE.Mesh(riverGeo, riverMat);
  river.rotation.x = -Math.PI / 2;
  river.position.set(0, 0.01, 40);
  river.receiveShadow = true;
  M3D.scene.add(river);

  // === ไฟพื้นหลัง ===
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  M3D.scene.add(ambient);

  // === ตัวช่วยดูเฟรม ===
  const stats = new Stats();
  document.body.appendChild(stats.dom);
  const gui = new GUI();

  // === ตัวแปรแอนิเมชัน ===
  let sunAngle = 0;
  let cloudOffset = 0;

  // === ฟังก์ชันแอนิเมชันหลัก ===
  function animate() {
    requestAnimationFrame(animate);
    M3D.controls.update();
    stats.update();
    FPS.update();

    //  พระอาทิตย์ตกแบบโค้ง
    sunAngle += 0.0002;
    sun.position.y = 80 - Math.sin(sunAngle) * 60;
    sun.position.x = 60 - Math.cos(sunAngle) * 20;

    //  แสงตามตำแหน่งพระอาทิตย์
    sunlight.position.copy(sun.position);
    sunlight.target.position.set(0, 0, 0);
    sunlight.target.updateMatrixWorld();

    //  เมฆขยับไปกลับ
    cloudOffset += 0.012;
    clouds.forEach((c, i) => {
      c.position.x = c.userData.baseX + Math.sin(cloudOffset + i) * 2;
      c.position.y = c.userData.baseY + Math.sin(cloudOffset + i * 2) * 1;
    });

    // Render
    M3D.renderer.render(M3D.scene, M3D.camera);
    M3D.cssRenderer.render(M3D.scene, M3D.camera);
  }

  animate();
}
