import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---------- 渲染器（canvas 尺寸由 applyResize() 统一管理）----------
const canvas = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
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

// 固定俯视「娃娃屋」视角：房间不随小鹿移动（aspect 由 applyResize() 设置）
const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 200);
camera.position.set(13, 13, 15);
camera.lookAt(0, 1.5, 0);

// ---------- 灯光（明亮、暖色、有窗光）----------
scene.add(new THREE.HemisphereLight(0xfff6ea, 0xd8c2a8, 1.35));
scene.add(new THREE.AmbientLight(0xffffff, 0.55));
const dir = new THREE.DirectionalLight(0xfff0d8, 1.45);
dir.position.set(7, 15, 8);
dir.castShadow = true;
dir.shadow.mapSize.set(2048, 2048);
dir.shadow.bias = -0.0004;
const sc = dir.shadow.camera;
sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16;
sc.near = 1; sc.far = 50;
scene.add(dir);
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

const wallMat = new THREE.MeshStandardMaterial({ color: 0xf4e9da, roughness: 1, side: THREE.DoubleSide });
const back = new THREE.Mesh(new THREE.BoxGeometry(ROOM, 10, 0.4), wallMat);
back.position.set(0, 5, -ROOM / 2);
back.receiveShadow = true;
scene.add(back);

const lw = 0.45;
const lx = -ROOM / 2;
const WIN_W = 6, WIN_H = 4, WIN_Y = 5.5, WIN_Z = 0;
const leftWall = new THREE.Mesh(new THREE.BoxGeometry(lw, 10, ROOM), wallMat);
leftWall.position.set(lx, 5, 0);
leftWall.receiveShadow = true;
scene.add(leftWall);

// 田字格窗户
const glassMat = new THREE.MeshStandardMaterial({
  color: 0xd4ecff, emissive: 0xcce6ff, emissiveIntensity: 1.0,
  roughness: 0.05, metalness: 0.1,
  transparent: true, opacity: 0.72, side: THREE.DoubleSide
});
const frameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, side: THREE.DoubleSide });
const ft = 0.14;
const glass = new THREE.Mesh(new THREE.BoxGeometry(lw + 0.04, WIN_H, WIN_W), glassMat);
glass.position.set(lx, WIN_Y, WIN_Z); scene.add(glass);
const midV = new THREE.Mesh(new THREE.BoxGeometry(lw + 0.06, WIN_H - ft * 2, 0.18), frameMat);
midV.position.set(lx, WIN_Y, WIN_Z); scene.add(midV);
const midH = new THREE.Mesh(new THREE.BoxGeometry(lw + 0.06, 0.18, WIN_W - ft * 2), frameMat);
midH.position.set(lx, WIN_Y, WIN_Z); scene.add(midH);
const fbT = new THREE.Mesh(new THREE.BoxGeometry(lw + 0.08, ft, WIN_W + ft * 2), frameMat);
fbT.position.set(lx, WIN_Y + WIN_H / 2 + ft / 2, WIN_Z); scene.add(fbT);
const fbB = new THREE.Mesh(new THREE.BoxGeometry(lw + 0.08, ft, WIN_W + ft * 2), frameMat);
fbB.position.set(lx, WIN_Y - WIN_H / 2 - ft / 2, WIN_Z); scene.add(fbB);
const fbL = new THREE.Mesh(new THREE.BoxGeometry(lw + 0.08, WIN_H + ft * 2, ft), frameMat);
fbL.position.set(lx, WIN_Y, WIN_Z - WIN_W / 2 - ft / 2); scene.add(fbL);
const fbR = new THREE.Mesh(new THREE.BoxGeometry(lw + 0.08, WIN_H + ft * 2, ft), frameMat);
fbR.position.set(lx, WIN_Y, WIN_Z + WIN_W / 2 + ft / 2); scene.add(fbR);

// 圆形粉色地毯（保留）
const rug = new THREE.Mesh(
  new THREE.CircleGeometry(3.4, 48),
  new THREE.MeshStandardMaterial({ color: 0xe3a0a0, roughness: 1 })
);
rug.rotation.x = -Math.PI / 2;
rug.position.y = 0.012;
rug.receiveShadow = true;
scene.add(rug);

// ---------- 工具函数 ----------
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

// ---------- 沙发（靠后墙，面向房间）----------
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

// ---------- 钓鱼灯（弧形金属杆 + 橙色半圆灯罩，灯座落左后墙角，弧形杆向房间中心延伸，灯罩悬停红线高度 y=4.0）----------
const arcLamp = new THREE.Group();
// 圆盘底座（深灰金属）
const arcBase = cyl(0.42, 0.45, 0.06, 0x4a4a4a, 0.5);
arcBase.position.set(0, 0.03, 0);
arcBase.material.metalness = 0.4;
arcLamp.add(arcBase);
// 弧形金属杆：从底座向上、向外弧出到灯罩位置（缩短 + 抬高到红线 y=4.0）
// 灯座在房间左后墙角（对角线三线交汇处），弧杆一路向房间中心延伸，灯罩 world 落地 (-4, 4.0, -4)
const arcCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0.06, 0),       // 底座中心
  new THREE.Vector3(0.8, 1.5, 0.8),    // 上弧（缩短）
  new THREE.Vector3(1.8, 3.0, 1.8),    // 弧顶
  new THREE.Vector3(3.0, 4.0, 3.0)     // 灯罩位置（红线高度 y=4.0；world ≈ (-4, 4.0, -4)）
]);
const arcTube = new THREE.Mesh(
  new THREE.TubeGeometry(arcCurve, 32, 0.04, 8, false),
  new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.4, metalness: 0.7 })
);
arcTube.castShadow = true;
arcLamp.add(arcTube);
// 橙色半圆灯罩（开口朝下）—— 半球 SphereGeometry
const arcShade = new THREE.Mesh(
  new THREE.SphereGeometry(0.55, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
  new THREE.MeshStandardMaterial({
    color: 0xe07840, roughness: 0.55, metalness: 0.15,
    emissive: 0xffd9a0, emissiveIntensity: 0.45, side: THREE.DoubleSide
  })
);
arcShade.position.set(3.0, 4.0, 3.0);
arcShade.rotation.x = Math.PI; // 开口朝下
arcShade.castShadow = true;
arcLamp.add(arcShade);
// 灯罩下沿的小黑环（增加细节）
const arcShadeRing = cyl(0.55, 0.55, 0.04, 0x1a1a1a, 0.6, 32);
arcShadeRing.position.set(3.0, 3.66, 3.0);
arcLamp.add(arcShadeRing);
// 灯头处微亮（让灯罩看起来有光）
const arcBulb = new THREE.Mesh(
  new THREE.SphereGeometry(0.35, 16, 12),
  new THREE.MeshStandardMaterial({
    color: 0xfff4d0, emissive: 0xffe9a0, emissiveIntensity: 1.8,
    roughness: 0.6, metalness: 0
  })
);
arcBulb.position.set(3.0, 3.75, 3.0);
arcLamp.add(arcBulb);
// 位置：房间左后墙角（对角线三线交汇处 = 左墙 + 后墙 + 地板），弧形杆向房间中心延伸
arcLamp.position.set(-7, 0, -7);
scene.add(arcLamp);

// ---------- 六抽屉柜（招牌家具，靠后墙右侧）----------
const cabinet = new THREE.Group();
const cabBody = box(2.8, 4.6, 1.5, WOOD); cabBody.position.set(0, 2.3, 0); cabinet.add(cabBody);
const cabTop = box(3.0, 0.18, 1.7, WOOD_D); cabTop.position.set(0, 4.69, 0); cabinet.add(cabTop);
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 2; c++) {
    const fy = 3.55 - r * 1.45;
    const fx = c === 0 ? -0.7 : 0.7;
    const f = box(1.2, 1.3, 0.08, CREAM);
    f.position.set(fx, fy, 0.76); cabinet.add(f);
    const handle = box(0.5, 0.1, 0.12, WOOD_D);
    handle.position.set(fx, fy, 0.83); cabinet.add(handle);
  }
}
cabinet.position.set(6.2, 0, -6.6);
scene.add(cabinet);

// ---------- 书桌（长边贴窗）----------
const desk = new THREE.Group();
const DESK = 0xf3e3cb;
const DESK_W = 2.6;
const DESK_L = WIN_W + 1.0;
const DESK_T = 0.28;
const DESK_H = 3.0;
const deskTop = box(DESK_W, DESK_T, DESK_L, DESK); deskTop.position.set(0, DESK_H, 0); desk.add(deskTop);
const legH = DESK_H / 2;
const halfL = DESK_L * 0.45;
[[-DESK_W*0.42, -halfL], [DESK_W*0.42, -halfL], [-DESK_W*0.42, halfL], [DESK_W*0.42, halfL]].forEach(([x, z]) => {
  const leg = box(0.18, DESK_H, 0.18, WOOD_D); leg.position.set(x, legH, z); desk.add(leg);
});

// 【MacBook 笔记本】居中面对椅子（椅子在 +x 方向）
// 整组放在桌子中心，rotation.y = -π/2 让屏幕长边沿 z 方向、屏幕面朝 +x
const macbook = new THREE.Group();
const macBaseMat = new THREE.MeshStandardMaterial({ color: 0xc8ccd0, roughness: 0.45, metalness: 0.55 });
const macBase = box(1.10, 0.06, 0.74, 0xc8ccd0, 0.45, { metalness: 0.55 });
macBase.position.set(0, 0.03, 0);
macbook.add(macBase);
// 底座上的 macbook 凹刻 logo（小黑色方块）
const macLogo = box(0.18, 0.005, 0.18, 0x1a1a1a, 0.8);
macLogo.position.set(0, 0.063, 0.32);
macbook.add(macLogo);
// 屏幕（银灰色金属外框 + 深色内屏）
// 屏幕本地：width 沿 z（面对 +x 椅子时左右方向）、height 沿 y、depth 沿 x
const macScreen = box(0.05, 0.66, 1.00, 0xc8ccd0, 0.45, { metalness: 0.55 });
macScreen.position.set(-0.32, 0.40, 0);  // 在底座 -x 端立起来
macScreen.rotation.x = -0.18;            // 屏幕向后倾（-x 方向）
macbook.add(macScreen);
// 内屏（深色，嵌在外框里）
const macScreenInset = box(0.01, 0.58, 0.92, 0x0e0e12, 0.4, { metalness: 0.1 });
macScreenInset.position.set(-0.28, 0.40, 0);
macScreenInset.rotation.x = -0.18;
macbook.add(macScreenInset);
// 屏幕顶端的小刘海（macbook 标志）
const macNotch = box(0.02, 0.04, 0.12, 0x1a1a1a, 0.7);
macNotch.position.set(-0.30, 0.69, 0);
macNotch.rotation.x = -0.18;
macbook.add(macNotch);
macbook.position.set(0, DESK_H + 0.20, -0.15);  // 抬高 0.20（桌面顶 y=3.14，底座顶 y=3.26 浮在桌面上）
desk.add(macbook);

// 【玻璃水杯 + 2/3 水】
// 玻璃外杯：透明圆柱
const glassCup = cyl(0.17, 0.14, 0.50, 0xffffff, 0.05);
glassCup.material = new THREE.MeshStandardMaterial({
  color: 0xddeef8, roughness: 0.05, metalness: 0.15,
  transparent: true, opacity: 0.45, side: THREE.DoubleSide
});
glassCup.position.set(-0.70, DESK_H + 0.29, DESK_L * 0.32);
desk.add(glassCup);
// 水（2/3 高度，淡蓝半透明）
const waterMat = new THREE.MeshStandardMaterial({
  color: 0x9ec9e8, roughness: 0.20, metalness: 0.05,
  transparent: true, opacity: 0.65, side: THREE.DoubleSide
});
const water = cyl(0.15, 0.13, 0.32, 0x9ec9e8, 0.20);
water.material = waterMat;
water.position.set(-0.70, DESK_H + 0.18, DESK_L * 0.32);  // 杯子下半部 0.18
desk.add(water);
// 水面（薄圆盘，模拟反光）
const waterTop = cyl(0.15, 0.15, 0.005, 0xc4def0, 0.1);
waterTop.position.set(-0.70, DESK_H + 0.34, DESK_L * 0.32);
desk.add(waterTop);

// 【MacBook 鼠标】（长椭圆扁款，黑色，紧贴电脑右侧）
const macMouse = new THREE.Mesh(
  new THREE.SphereGeometry(0.10, 16, 12),
  new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.5, metalness: 0.15 })
);
macMouse.scale.set(1.0, 0.35, 1.5);  // x 扁、y 矮、z 长
macMouse.position.set(0.55, DESK_H + 0.20, -DESK_L * 0.20);  // 抬高 0.20（鼠标底 y=3.165 > 桌面顶 3.14）
macMouse.castShadow = true;
desk.add(macMouse);
// 鼠标表面有一条分隔线（白色细条模拟感应区）
const mouseLine = box(0.005, 0.002, 0.15, 0xcccccc, 0.4);
mouseLine.position.set(0.55, DESK_H + 0.235, -DESK_L * 0.20);  // 跟随鼠标抬高
desk.add(mouseLine);

// 笔筒 + 笔
const holder = cyl(0.20, 0.19, 0.46, 0xc8a06a); holder.position.set(0.78, DESK_H + 0.31, DESK_L * 0.32); desk.add(holder);
[[-0.04, 0.08, 0xe57373], [0.05, -0.03, 0x64b5f6], [0.01, 0.06, 0xffd54f]].forEach(([px, pz, pc]) => {
  const pen = cyl(0.025, 0.025, 0.64, pc); pen.position.set(0.78 + px, DESK_H + 0.68, DESK_L * 0.32 + pz); pen.rotation.z = 0.12; desk.add(pen);
});
// 本子 + 笔
const notebook = box(0.82, 0.06, 0.56, 0xfffaf0); notebook.position.set(0.35, DESK_H + 0.05, DESK_L * 0.10); notebook.rotation.y = 0.2; desk.add(notebook);
const np = box(0.54, 0.04, 0.05, 0x333333); np.position.set(0.35, DESK_H + 0.11, DESK_L * 0.10); np.rotation.y = 0.2; desk.add(np);
// 草稿纸
const paperMat = new THREE.MeshStandardMaterial({ color: 0xfbf7ee, roughness: 0.95 });
[
  [-0.55, DESK_L*0.22, 0.35],
  [0.70, -DESK_L*0.04, -0.42],
  [-0.15, DESK_L*0.14, -0.72],
  [0.15, DESK_L*0.33, 0.10]
].forEach(([x, z, r]) => {
  const p = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.02, 0.54), paperMat);
  p.position.set(x, DESK_H + 0.03, z); p.rotation.y = r; p.castShadow = true; p.receiveShadow = true; desk.add(p);
});
desk.position.set(-6.45, 0, 0);
scene.add(desk);

// ---------- 皮质黑色椅子 ----------
const chair = new THREE.Group();
const CH = 0x1c1c1c;
const chSeatH = (DESK_H - 0.7) * (2/3);
const chScale = 1.55;  // 加宽（原 1.35 → 1.55，约 +15%）
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
chair.rotation.y = Math.PI / 2;
// 加宽后椅子深度 = 1.08*1.55 = 1.67，原位 -4.7 时左缘 x=-5.535 会撞桌子右缘 -5.15；往 +x 挪 0.45 → -4.25，左缘 -5.085 不撞
chair.position.set(-4.25, 0, 0);
scene.add(chair);

// ---------- 龟背竹 B 方案（6 片叶不对称散开、向沙发侧倾斜，沙发左扶手外侧）----------
const monstera = new THREE.Group();
// 陶土盆（比仙人掌大）
const mPot = cyl(0.55, 0.42, 1.0, 0xc97650, 0.95);
mPot.position.set(0, 0.50, 0);
mPot.castShadow = true; mPot.receiveShadow = true;
monstera.add(mPot);
// 盆口薄沿
const mPotRim = cyl(0.58, 0.58, 0.07, 0xb56843, 0.95);
mPotRim.position.set(0, 1.04, 0);
monstera.add(mPotRim);
// 土壤层
const mSoil = cyl(0.52, 0.52, 0.05, 0x4a3320, 1.0);
mSoil.position.set(0, 1.10, 0);
monstera.add(mSoil);
// 主茎
const mStem = cyl(0.10, 0.13, 2.2, 0x5a3f2a, 0.85);
mStem.position.set(0, 2.20, 0);
mStem.castShadow = true;
monstera.add(mStem);
// 龟背竹叶片：每片用 ShapeGeometry（带羽裂洞）做大叶
function makeMonsteraLeaf() {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, 0.78, 0, Math.PI * 2, false);
  // 中心小孔（茎连接点）
  shape.holes.push(new THREE.Path().absarc(0, 0, 0.12, 0, Math.PI * 2, true));
  // 6 个羽裂侧孔（龟背竹标志）
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.15;
    const cx = Math.cos(a) * 0.42;
    const cy = Math.sin(a) * 0.42;
    const hole = new THREE.Path();
    hole.absarc(cx, cy, 0.16, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  return new THREE.ShapeGeometry(shape, 24);
}
const leafMat = new THREE.MeshStandardMaterial({
  color: 0x3a7a4a, roughness: 0.6, metalness: 0.05, side: THREE.DoubleSide
});
// 6 片叶 B 方案：不对称 + 向沙发（+x 方向）侧倾斜，整体错落有动感
const leafConfigs = [
  { y: 1.40, a: 0.30, tilt: -0.25, leanX: 0.20, s: 1.10 },  // 低位大叶，偏沙发
  { y: 1.75, a: 1.10, tilt: -0.05, leanX: 0.30, s: 1.20 },  // 主叶，最大，向沙发侧探
  { y: 2.10, a: 1.85, tilt:  0.18, leanX: 0.18, s: 1.15 },  // 中部
  { y: 2.45, a: 2.55, tilt:  0.38, leanX: 0.05, s: 1.05 },  // 高位前倾
  { y: 2.75, a: 3.30, tilt:  0.55, leanX: 0.00, s: 0.95 },  // 顶前
  { y: 2.95, a: 4.20, tilt:  0.65, leanX: 0.00, s: 0.85 }   // 顶小
];
leafConfigs.forEach(cfg => {
  const leaf = new THREE.Mesh(makeMonsteraLeaf(), leafMat);
  leaf.position.set(Math.cos(cfg.a) * 0.28, cfg.y, Math.sin(cfg.a) * 0.28);
  // 让叶面朝外（径向）+ 偏沙发侧
  leaf.lookAt(
    Math.cos(cfg.a) * 1.5 + cfg.leanX,
    cfg.y + Math.sin(cfg.tilt) * 0.5,
    Math.sin(cfg.a) * 1.5
  );
  leaf.rotateX(cfg.tilt);
  leaf.scale.setScalar(cfg.s);
  leaf.castShadow = true;
  leaf.receiveShadow = true;
  monstera.add(leaf);
});
monstera.scale.setScalar(1.60);  // 整体放大（原仙人掌小巧，龟背竹要大气）
monstera.position.set(-2.2, 0, -5.5);  // 沙发左扶手外侧
scene.add(monstera);

// ---------- 墙上挂画（用户提供的爬山图）----------
const wallArtGroup = new THREE.Group();
wallArtGroup.position.set(0, 6.4, -7.78);
scene.add(wallArtGroup);
const wallFrame = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 0.18),
  new THREE.MeshStandardMaterial({ color: WOOD_D, roughness: 0.85 })
);
wallFrame.castShadow = true; wallFrame.receiveShadow = true;
wallArtGroup.add(wallFrame);
const wallArt = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide })
);
wallArt.position.z = 0.10;
wallArtGroup.add(wallArt);

// ---------- 小鹿（2D 立牌 Sprite） ----------
let deer = null, deerShadow = null, deerBaseY = 0;
let texStand = null, texWalk = null;
let facing = 1;
const SPEED = 4.4;
const vel = new THREE.Vector3();
const keys = {};
let target = null;
const clock = new THREE.Clock();

const DEER_H = 2.4;
const DEER_ASPECT = 1024 / 1536;
const DEER_FOOT_FRAC = 0.05;
deerBaseY = DEER_H * (0.5 - DEER_FOOT_FRAC);

const deerMat = new THREE.SpriteMaterial({
  color: 0xd9b8e0, transparent: true, opacity: 0.85, depthWrite: false
});
deer = new THREE.Sprite(deerMat);
deer.scale.set(DEER_H * DEER_ASPECT, DEER_H, 1);
deer.position.set(0, deerBaseY, 2.5);
scene.add(deer);

const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 });
deerShadow = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), shadowMat);
deerShadow.rotation.x = -Math.PI / 2;
deerShadow.position.set(0, 0.008, 2.5);
scene.add(deerShadow);

const loadingEl = document.getElementById('loading');
loadingEl.classList.add('done');
setTimeout(() => { loadingEl.style.display = 'none'; }, 500);

const texLoader = new THREE.TextureLoader();

// 加载墙上挂画
texLoader.load(
  'assets/wallart/deer-climbing.png',
  t => {
    t.colorSpace = THREE.SRGBColorSpace;
    const img = t.image;
    const ratio = img.height / img.width;
    const W = 4.8, H = W * ratio;
    wallFrame.geometry.dispose();
    wallFrame.geometry = new THREE.BoxGeometry(W + 0.30, H + 0.30, 0.18);
    wallArt.geometry.dispose();
    wallArt.geometry = new THREE.PlaneGeometry(W, H);
    wallArt.material.map = t;
    wallArt.material.needsUpdate = true;
  },
  undefined,
  err => console.warn('墙上挂画加载失败', err)
);

// 加载小鹿贴图
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

// 加载毛茸茸苔藓地毯（沙发前面）
const mossRug = new THREE.Mesh(
  new THREE.PlaneGeometry(6.4, 4.0),   // 宽度对齐沙发宽（沙发座 4 + 扶手 0.45×2 = 4.25，×1.5 scale = 6.4），深度 4
  new THREE.MeshStandardMaterial({
    transparent: true, alphaTest: 0.45, side: THREE.DoubleSide,
    roughness: 0.95, metalness: 0
  })
);
mossRug.rotation.x = -Math.PI / 2;
mossRug.position.set(1.4, 0.018, -2.5);  // 居中 x=1.4 对齐沙发中线，z=-2.5 往房间中心挪（沙发前缘 z=-4.6，地毯 4 深 z 范围 [-4.5, -0.5]，沙发下重叠 ≈ 0.1 已无）
mossRug.receiveShadow = true;
scene.add(mossRug);
texLoader.load(
  'assets/textures/moss-rug.png',
  t => {
    t.colorSpace = THREE.SRGBColorSpace;
    mossRug.material.map = t;
    mossRug.material.needsUpdate = true;
    // 按图原比例调整 plane 尺寸（保持铺满感）
    const img = t.image;
    if (img) {
      const r = img.height / img.width;
      // 平面已 2.4x2.4（方形），地毯本身略方形也行
    }
  },
  undefined,
  err => console.warn('苔藓地毯加载失败', err)
);

// ---------- 输入 ----------
addEventListener('keydown', (e) => (keys[e.key.toLowerCase()] = true));
addEventListener('keyup', (e) => (keys[e.key.toLowerCase()] = false));

const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
addEventListener('pointerdown', (e) => {
  if (e.target !== canvas) return;
  const rect = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.intersectObject(floor)[0];
  if (hit) target = hit.point.clone();
});

// ---------- 相机控制 ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.5, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 10;
controls.maxDistance = 36;
controls.maxPolarAngle = Math.PI / 2.15;
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

    const moving = vel.lengthSq() > 0.05;
    if (Math.abs(vel.x) > 0.05) facing = vel.x > 0 ? 1 : -1;
    const baseW = DEER_H * DEER_ASPECT;
    deer.scale.set(baseW * facing, DEER_H, 1);

    if (texStand && texWalk) {
      deerMat.map = moving ? texWalk : texStand;
      deerMat.needsUpdate = true;
    }

    deer.position.y = deerBaseY + Math.abs(Math.sin(performance.now() * 0.006)) * 0.07 * (moving ? 1 : 0.3);

    if (deerShadow) {
      deerShadow.position.x = deer.position.x;
      deerShadow.position.z = deer.position.z;
    }
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();

// ---------- 自适应：让 canvas 只占面板左侧 ----------
function getPanelW() {
  return window.matchMedia('(max-width: 640px)').matches ? 0 : 320;
}
function applyResize() {
  const w = Math.max(0, innerWidth - getPanelW());
  const h = innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
}
applyResize();
addEventListener('resize', applyResize);
if (window.matchMedia) {
  const mql = window.matchMedia('(max-width: 640px)');
  if (mql.addEventListener) mql.addEventListener('change', applyResize);
  else if (mql.addListener) mql.addListener(applyResize);
}
