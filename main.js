import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---------- 渲染器 ----------
const canvas = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

// ---------- 场景 ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfbf3e8);
scene.fog = new THREE.Fog(0xfbf3e8, 26, 50);

// 固定俯视「娃娃屋」视角：房间不随小鹿移动
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 200);
camera.position.set(13, 13, 15);
camera.lookAt(0, 1.5, 0);

// ---------- 灯光（明亮、暖色、有窗光）----------
// 半球光：天空暖白 + 地面反光，整体提亮
scene.add(new THREE.HemisphereLight(0xfff6ea, 0xd8c2a8, 1.35));
// 环境光：消除死黑阴影
scene.add(new THREE.AmbientLight(0xffffff, 0.55));
// 主光：暖色阳光（带阴影）
const dir = new THREE.DirectionalLight(0xfff0d8, 1.45);
dir.position.set(7, 15, 8);
dir.castShadow = true;
dir.shadow.mapSize.set(2048, 2048);
dir.shadow.bias = -0.0004;
const sc = dir.shadow.camera;
sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16;
sc.near = 1; sc.far = 50;
scene.add(dir);
// 窗光：冷一点的补光，从窗户方向打进来，增加层次
const win = new THREE.DirectionalLight(0xdfe9ff, 0.7);
win.position.set(-9, 8, 4);
scene.add(win);

// ---------- 房间 ----------
const ROOM = 16;
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(ROOM, ROOM),
  new THREE.MeshStandardMaterial({ color: 0xe0c298, roughness: 0.9 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 墙体材质（双面渲染，避免从外看穿）
const wallMat = new THREE.MeshStandardMaterial({ color: 0xf4e9da, roughness: 1, side: THREE.DoubleSide });

// 后墙（实体）
const back = new THREE.Mesh(new THREE.BoxGeometry(ROOM, 10, 0.4), wallMat);
back.position.set(0, 5, -ROOM / 2);
back.receiveShadow = true;
scene.add(back);

// 左墙：完整实体墙（除了窗户区域被玻璃覆盖）
const lw = 0.45;          // 墙厚
const lx = -ROOM / 2;     // 左墙 x
const WIN_W = 6;          // 窗宽（z 方向）
const WIN_H = 4;          // 窗高
const WIN_Y = 5.5;        // 窗中心高度
const WIN_Z = 0;          // 窗中心 z（居中）

// 左墙主体：完整一面实心墙
const leftWall = new THREE.Mesh(new THREE.BoxGeometry(lw, 10, ROOM), wallMat);
leftWall.position.set(lx, 5, 0);
leftWall.receiveShadow = true;
scene.add(leftWall);

// ====== 田字格窗户（固定，不可开）======
const glassMat = new THREE.MeshStandardMaterial({
  color: 0xd4ecff, emissive: 0xcce6ff, emissiveIntensity: 1.0,
  roughness: 0.05, metalness: 0.1,
  transparent: true, opacity: 0.72, side: THREE.DoubleSide
});
const frameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, side: THREE.DoubleSide });
const ft = 0.14;

// 玻璃
const glass = new THREE.Mesh(new THREE.BoxGeometry(lw + 0.04, WIN_H, WIN_W), glassMat);
glass.position.set(lx, WIN_Y, WIN_Z);
scene.add(glass);

// 田字内框：竖 + 横（十字把窗分成 4 格）
const midV = new THREE.Mesh(new THREE.BoxGeometry(lw + 0.06, WIN_H - ft * 2, 0.18), frameMat);
midV.position.set(lx, WIN_Y, WIN_Z); scene.add(midV);
const midH = new THREE.Mesh(new THREE.BoxGeometry(lw + 0.06, 0.18, WIN_W - ft * 2), frameMat);
midH.position.set(lx, WIN_Y, WIN_Z); scene.add(midH);

// 外框四边
const fbT = new THREE.Mesh(new THREE.BoxGeometry(lw + 0.08, ft, WIN_W + ft * 2), frameMat);
fbT.position.set(lx, WIN_Y + WIN_H / 2 + ft / 2, WIN_Z); scene.add(fbT);
const fbB = new THREE.Mesh(new THREE.BoxGeometry(lw + 0.08, ft, WIN_W + ft * 2), frameMat);
fbB.position.set(lx, WIN_Y - WIN_H / 2 - ft / 2, WIN_Z); scene.add(fbB);
const fbL = new THREE.Mesh(new THREE.BoxGeometry(lw + 0.08, WIN_H + ft * 2, ft), frameMat);
fbL.position.set(lx, WIN_Y, WIN_Z - WIN_W / 2 - ft / 2); scene.add(fbL);
const fbR = new THREE.Mesh(new THREE.BoxGeometry(lw + 0.08, WIN_H + ft * 2, ft), frameMat);
fbR.position.set(lx, WIN_Y, WIN_Z + WIN_W / 2 + ft / 2); scene.add(fbR);

const rug = new THREE.Mesh(
  new THREE.CircleGeometry(3.4, 48),
  new THREE.MeshStandardMaterial({ color: 0xe3a0a0, roughness: 1 })
);
rug.rotation.x = -Math.PI / 2;
rug.position.y = 0.012;
rug.receiveShadow = true;
scene.add(rug);

// ---------- 家具 ----------
function box(w, h, d, color, rough = 0.9, opts = {}) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: rough, ...opts })
  );
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
function cyl(rt, rb, h, color, rough = 0.9, seg = 24) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(rt, rb, h, seg),
    new THREE.MeshStandardMaterial({ color, roughness: rough })
  );
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
const WOOD = 0xb9824f, WOOD_D = 0x9c6a3c, CREAM = 0xf0e2cf, LAV = 0xd9b8e0, PINK = 0xe8b4b8;

// 沙发（靠后墙，面向房间）
const sofa = new THREE.Group();
const sofaSeat = box(4, 0.7, 1.9, LAV); sofaSeat.position.set(0, 0.45, 0); sofa.add(sofaSeat);
const sofaBack = box(4, 1.1, 0.45, LAV); sofaBack.position.set(0, 1.05, -0.72); sofa.add(sofaBack);
const sofaArmL = box(0.45, 0.9, 1.9, LAV); sofaArmL.position.set(-1.9, 0.6, 0); sofa.add(sofaArmL);
const sofaArmR = box(0.45, 0.9, 1.9, LAV); sofaArmR.position.set(1.9, 0.6, 0); sofa.add(sofaArmR);
[[-1.0], [1.0]].forEach(([x]) => {
  const c = box(1.7, 0.35, 1.5, 0xf3dcef); c.position.set(x, 0.92, 0.05); sofa.add(c);
});
sofa.scale.setScalar(1.5);
sofa.position.set(1.4, 0, -6);
scene.add(sofa);

// 落地灯（沙发旁）
const lamp = new THREE.Group();
const lampBase = cyl(0.45, 0.45, 0.1, WOOD_D); lampBase.position.set(0, 0.05, 0); lamp.add(lampBase);
const lampPole = cyl(0.06, 0.06, 2.3, 0x6b6b6b); lampPole.position.set(0, 1.2, 0); lamp.add(lampPole);
const lampShade = new THREE.Mesh(
  new THREE.ConeGeometry(0.65, 0.7, 24, 1, true),
  new THREE.MeshStandardMaterial({ color: 0xf7e3a8, roughness: 0.8, emissive: 0xffe9a0, emissiveIntensity: 0.6, side: THREE.DoubleSide })
);
lampShade.position.set(0, 2.45, 0); lamp.add(lampShade);
lamp.scale.setScalar(1.5);
lamp.position.set(4.7, 0, -4.6);
scene.add(lamp);

// 六抽屉柜（招牌家具，靠后墙右侧）
const cabinet = new THREE.Group();
const cabBody = box(2.8, 4.6, 1.5, WOOD); cabBody.position.set(0, 2.3, 0); cabinet.add(cabBody);
const cabTop = box(3.0, 0.18, 1.7, WOOD_D); cabTop.position.set(0, 4.69, 0); cabinet.add(cabTop);
const drawerFronts = [];
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 2; c++) {
    const fy = 3.55 - r * 1.45;
    const fx = c === 0 ? -0.7 : 0.7;
    const f = box(1.2, 1.3, 0.08, CREAM);
    f.position.set(fx, fy, 0.76);
    cabinet.add(f);
    const handle = box(0.5, 0.1, 0.12, WOOD_D);
    handle.position.set(fx, fy, 0.83);
    cabinet.add(handle);
    drawerFronts.push(f);
  }
}
cabinet.position.set(6.2, 0, -6.6);
scene.add(cabinet);

// 书架已移除（用户要求去掉角落的衣柜/书架）

// 书桌（长边贴窗，与窗等宽，桌面高度在窗下沿下方一点）
const desk = new THREE.Group();
const DESK = 0xf3e3cb; // 柔和杏白色
const DESK_W = 2.6;           // 桌面短边（x 方向）—— 加宽
const DESK_L = WIN_W + 1.0;     // 长边比窗略长，更舒展
const DESK_T = 0.28;           // 桌面厚度
const DESK_H = 3.0;            // 桌面高度（窗下沿 3.5 下方一点）
const deskTop = box(DESK_W, DESK_T, DESK_L, DESK); deskTop.position.set(0, DESK_H, 0); desk.add(deskTop);
const legH = DESK_H / 2;
const halfL = DESK_L * 0.45;
[[-DESK_W*0.42, -halfL], [DESK_W*0.42, -halfL], [-DESK_W*0.42, halfL], [DESK_W*0.42, halfL]].forEach(([x, z]) => {
  const leg = box(0.18, DESK_H, 0.18, WOOD_D); leg.position.set(x, legH, z); desk.add(leg);
});
// 电脑（笔记本，屏幕面朝椅子方向 / +x）
const laptopBase = box(1.05, 0.08, 0.72, 0x4a4a4a);
laptopBase.position.set(-0.2, DESK_H + 0.06, -DESK_L*0.25);
laptopBase.rotation.y = 0.35; // 稍微斜向椅子
desk.add(laptopBase);
const laptopScreen = box(1.05, 0.72, 0.06, 0x2b2b2b);
laptopScreen.position.set(-0.2, DESK_H + 0.44, -DESK_L*0.25 - 0.32);
laptopScreen.rotation.x = -0.30;
laptopScreen.rotation.y = 0.35; // 屏幕跟随底座朝向椅子
desk.add(laptopScreen);
// 鼠标（电脑旁边）
const mouse = new THREE.Mesh(
  new THREE.CylinderGeometry(0.07, 0.08, 0.05, 16),
  new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.4, metalness: 0.3 })
);
mouse.rotation.x = Math.PI / 2;
mouse.position.set(0.55, DESK_H + 0.05, -DESK_L*0.24);
mouse.castShadow = true;
desk.add(mouse);
// 有纹路的玻璃杯（半透明 + 高光）
const glassMat = new THREE.MeshStandardMaterial({
  color: 0xddeef8, roughness: 0.05, metalness: 0.15,
  transparent: true, opacity: 0.45
});
const glassCup = cyl(0.17, 0.14, 0.50, 0xffffff, 0.05);
glassCup.material = glassMat;
glassCup.position.set(0.65, DESK_H + 0.29, DESK_L*0.34);
desk.add(glassCup);
// 玻璃杯外层（纹路效果：稍大的半透明壳）
const glassOuter = cyl(0.20, 0.17, 0.50, 0xe8f4fc, 0.08);
glassOuter.material = new THREE.MeshStandardMaterial({
  color: 0xe8f4fc, roughness: 0.12, metalness: 0.1,
  transparent: true, opacity: 0.25
});
glassOuter.position.set(0.65, DESK_H + 0.29, DESK_L*0.34);
desk.add(glassOuter);
// 笔筒 + 笔
const holder = cyl(0.20, 0.19, 0.46, 0xc8a06a); holder.position.set(-0.75, DESK_H + 0.31, DESK_L*0.34); desk.add(holder);
[[-0.04, 0.08, 0xe57373], [0.05, -0.03, 0x64b5f6], [0.01, 0.06, 0xffd54f]].forEach(([px, pz, pc]) => {
  const pen = cyl(0.025, 0.025, 0.64, pc); pen.position.set(-0.75 + px, DESK_H + 0.68, DESK_L*0.34 + pz); pen.rotation.z = 0.12; desk.add(pen);
});
// 本子 + 笔
const notebook = box(0.82, 0.06, 0.56, 0xfffaf0); notebook.position.set(0.35, DESK_H + 0.05, DESK_L*0.10); notebook.rotation.y = 0.2; desk.add(notebook);
const np = box(0.54, 0.04, 0.05, 0x333333); np.position.set(0.35, DESK_H + 0.11, DESK_L*0.10); np.rotation.y = 0.2; desk.add(np);
// 草稿纸摊开（多加一张）
const paperMat = new THREE.MeshStandardMaterial({ color: 0xfbf7ee, roughness: 0.95 });
[
  [-0.55, DESK_L*0.22, 0.35],
  [0.70, -DESK_L*0.04, -0.42],
  [-0.15, DESK_L*0.14, -0.72],
  [0.15, DESK_L*0.33, 0.10]   // 新增一张草稿纸
].forEach(([x, z, r]) => {
  const p = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.02, 0.54), paperMat);
  p.position.set(x, DESK_H + 0.03, z); p.rotation.y = r; p.castShadow = true; p.receiveShadow = true; desk.add(p);
});
desk.position.set(-7.1, 0, 0); // 贴左墙，长边沿窗（窗 z∈[-WIN_W/2, WIN_W/2]）
scene.add(desk);

// 皮质黑色椅子（矮 1/3、整体更大）
const chair = new THREE.Group();
const CH = 0x1c1c1c;
const chSeatH = (DESK_H - 0.7) * (2/3);  // 座面高度降低 1/3
const chScale = 1.35;                     // 整体放大系数
const chSeat = box(1.08 * chScale, 0.20, 1.08 * chScale, CH, 0.6);
chSeat.position.set(0, chSeatH, 0); chair.add(chSeat);
const chBack = box(1.08 * chScale, 1.25 * chScale, 0.20, CH, 0.6);
chBack.position.set(0, chSeatH + 0.68 * chScale, 0.44); chair.add(chBack);
[[-0.55 * chScale], [0.55 * chScale]].forEach(([x]) => {
  const chArm = box(0.18, 0.55 * chScale, 1.08 * chScale, CH, 0.6);
  chArm.position.set(x, chSeatH + 0.3 * chScale, 0); chair.add(chArm);
});
const chLegH = chSeatH - 0.10;
[[-0.42 * chScale, -0.42 * chScale], [0.42 * chScale, -0.42 * chScale], [-0.42 * chScale, 0.42 * chScale], [0.42 * chScale, 0.42 * chScale]].forEach(([x, z]) => {
  const chLeg = cyl(0.09, 0.09, chLegH, 0x2a2a2a, 0.5, 12);
  chLeg.position.set(x, chLegH / 2, z); chair.add(chLeg);
});
chair.rotation.y = Math.PI / 2; // 椅背朝房间外侧，面向桌子(-x)
chair.position.set(-5.0, 0, 0); // 稍微往外挪一点配合更宽的桌子
scene.add(chair);

// 绿植（角落）
const plant = new THREE.Group();
const pot = cyl(0.45, 0.34, 0.8, 0xcf8a6a); pot.position.set(0, 0.4, 0); plant.add(pot);
const leafMat = new THREE.MeshStandardMaterial({ color: 0x7fae6b, roughness: 0.9 });
for (let i = 0; i < 7; i++) {
  const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32 + Math.random() * 0.15, 0), leafMat);
  leaf.castShadow = true;
  const a = (i / 7) * Math.PI * 2;
  leaf.position.set(Math.cos(a) * 0.25, 1.1 + (i % 3) * 0.22, Math.sin(a) * 0.25);
  plant.add(leaf);
}
plant.scale.setScalar(1.5);
plant.position.set(-6.6, 0, 5.5);
scene.add(plant);

// 墙上挂画（后墙）
const frame = box(1.7, 1.3, 0.1, WOOD_D); frame.position.set(-2.5, 6.2, -7.78); frame.scale.setScalar(1.5); scene.add(frame);
const canvasArt = box(1.4, 1.0, 0.06, 0x9ec5e8); canvasArt.position.set(-2.5, 6.2, -7.72); canvasArt.scale.setScalar(1.5); scene.add(canvasArt);

// 小鹿初始位置避开家具

// ---------- 小鹿（2D 立牌 Sprite，透明 PNG，秒开） ----------
let deer = null;
let deerShadow = null;
let deerBaseY = 0;
let texStand = null, texWalk = null;  // 站立 / 走动贴图
let facing = 1;                       // 1=右 -1=左（水平翻转）
const SPEED = 4.4;
const vel = new THREE.Vector3();
const keys = {};
let target = null;
const clock = new THREE.Clock();

const DEER_H = 2.4;                  // 小鹿世界高度（与之前 GLB 一致）
const DEER_ASPECT = 1024 / 1536;     // 贴图宽高比
const DEER_FOOT_FRAC = 0.05;         // 脚底距图片底部的比例（目测约 5%）
deerBaseY = DEER_H * (0.5 - DEER_FOOT_FRAC); // 让脚踩在 y=0

// 创建立牌（先无贴图，加载后填入；用淡紫色占位避免完全透明）
const deerMat = new THREE.SpriteMaterial({
  color: 0xd9b8e0, transparent: true, opacity: 0.85, depthWrite: false
});
deer = new THREE.Sprite(deerMat);
deer.scale.set(DEER_H * DEER_ASPECT, DEER_H, 1);
deer.position.set(0, deerBaseY, 2.5);
scene.add(deer);

// 地面阴影（跟随小鹿的暗色椭圆）
const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 });
deerShadow = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), shadowMat);
deerShadow.rotation.x = -Math.PI / 2;
deerShadow.position.set(0, 0.008, 2.5);
scene.add(deerShadow);

// 加载小鹿贴图（异步，不阻塞场景渲染）
const loadingEl = document.getElementById('loading');
// 场景构建完毕立即隐藏 loading，让用户先看到房间
loadingEl.classList.add('done');
setTimeout(() => { loadingEl.style.display = 'none'; }, 500);

const texLoader = new THREE.TextureLoader();
// 先用纯色占位，贴图加载后替换
texLoader.load(
  'assets/deer/deer-stand.png',
  t => { t.colorSpace = THREE.SRGBColorSpace; texStand = t; if (!texWalk) { deerMat.map = t; deerMat.needsUpdate = true; } },
  undefined,
  err => console.warn('站立贴图加载失败', err)
);
texLoader.load(
  'assets/deer/deer-walk.png',
  t => { t.colorSpace = THREE.SRGBColorSpace; texWalk = t; deerMat.map = texStand || t; deerMat.needsUpdate = true; },
  undefined,
  err => console.warn('走动贴图加载失败', err)
);

// ---------- 输入 ----------
addEventListener('keydown', (e) => (keys[e.key.toLowerCase()] = true));
addEventListener('keyup', (e) => (keys[e.key.toLowerCase()] = false));

const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
addEventListener('pointerdown', (e) => {
  if (e.target !== canvas) return;
  ndc.x = (e.clientX / innerWidth) * 2 - 1;
  ndc.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.intersectObject(floor)[0];
  if (hit) target = hit.point.clone();
});

// ---------- 相机控制（固定俯视 + 用户可微调，但不跟随小鹿）----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.5, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 10;
controls.maxDistance = 36;
controls.maxPolarAngle = Math.PI / 2.15; // 不允许转到地板以下
controls.update();

// ---------- 主循环 ----------
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (deer) {
    let mx = 0, mz = 0;
    if (keys['w'] || keys['arrowup']) mz -= 1;
    if (keys['s'] || keys['arrowdown']) mz += 1;
    if (keys['a'] || keys['arrowleft']) mx -= 1;
    if (keys['d'] || keys['arrowright']) mx += 1;
    const dv = new THREE.Vector3(mx, 0, mz);
    if (dv.lengthSq() > 0) {
      dv.normalize();
      target = null;
    } else if (target) {
      const to = target.clone().sub(deer.position); to.y = 0;
      if (to.length() < 0.25) target = null;
      else dv.copy(to.normalize());
    }
    vel.lerp(dv.multiplyScalar(SPEED), 1 - Math.pow(0.0009, dt));
    const HALF = ROOM / 2 - 1.2;
    deer.position.addScaledVector(vel, dt);
    deer.position.x = THREE.MathUtils.clamp(deer.position.x, -HALF, HALF);
    deer.position.z = THREE.MathUtils.clamp(deer.position.z, -HALF, HALF);

    // Sprite 立牌：水平翻转代替旋转朝向
    const moving = vel.lengthSq() > 0.05;
    if (Math.abs(vel.x) > 0.05) facing = vel.x > 0 ? 1 : -1;
    const baseW = DEER_H * DEER_ASPECT;
    deer.scale.set(baseW * facing, DEER_H, 1);

    // 走动时换贴图，静止用站立贴图
    if (texStand && texWalk) {
      deerMat.map = moving ? texWalk : texStand;
      deerMat.needsUpdate = true;
    }

    // 上下浮动（走路幅度大，站立幅度小）
    deer.position.y = deerBaseY + Math.abs(Math.sin(performance.now() * 0.006)) * 0.07 * (moving ? 1 : 0.3);

    // 阴影跟随小鹿
    if (deerShadow) {
      deerShadow.position.x = deer.position.x;
      deerShadow.position.z = deer.position.z;
    }
  }
  controls.update(); // 相机固定，仅响应用户拖拽/缩放
  renderer.render(scene, camera);
}
animate();

// ---------- 自适应 ----------
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
