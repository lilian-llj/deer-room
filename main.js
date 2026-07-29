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
sofa.position.set(1.1, 0, -6);  // 往 -x（绿植方向）挪 0.3，间隙 0.16（不重叠）
scene.add(sofa);

// ---------- 钓鱼灯（弧形金属杆 + 橙色半圆灯罩，灯座落左后墙角，弧形杆向房间中心延伸，灯罩悬停红线高度 y=4.0）----------
const arcLamp = new THREE.Group();
// 圆盘底座（深灰金属）
const arcBase = cyl(0.42, 0.45, 0.06, 0x4a4a4a, 0.5);
arcBase.position.set(0, 0.03, 0);
arcBase.material.metalness = 0.4;
arcLamp.add(arcBase);
// 弧形金属杆：从底座先垂直上升，再自然往外水平延伸至灯罩（更有弧度的优雅曲线）
// 灯座在房间中后偏左（不再贴墙），弧杆从底座垂直升起，再水平弯出到灯罩位置
// 本轮（v10）：整体杆子高度+1/5，灯罩同步抬高到 y=7.0（+1 单位）
// 本轮（v12）：灯杆末端接进灯罩"碗口"内（y=6.45 → y=7.0），与碗口平面同高
// 本轮（v13）：整体下降 0.5（灯杆顶 y=6.5、灯罩 y=6.5、灯泡 y=6.68）—— 让灯罩离桌面/挂画更近，视觉层次更好
// 本轮（v15）：灯罩/灯泡/灯罩下沿环/灯杆末端控制点 y 全部 -0.8（其余 4 个灯杆控制点不动）
//               灯杆末端从 (3.0, 6.5, 3.0) 下垂到 (3.0, 5.7, 3.0)，末段微垂挂住碗口；灯杆前 4 段弧度形态完全保留
// 本轮（v16）：仅灯泡保留 v15 位置 y=5.88；灯杆末端控制点 + 灯罩球心 + 灯罩下沿环 全部还原到 v14 的 y=6.5
//               灯罩回到 v14 原位（开口朝下、球心 y=6.5、碗底 y=7.05），灯泡单独下垂到 y=5.88 = 碗口下方 0.62 单位（外露爱迪生灯泡效果）
//               灯杆前 4 段：不动
const arcCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0.07, 0),       // 底座中心（保持贴地，未动）
  new THREE.Vector3(0.18, 1.9, 0.18),  // 先垂直上升（未动）
  new THREE.Vector3(0.36, 4.9, 0.36),  // 弧杆高点（未动）
  new THREE.Vector3(1.5, 6.45, 1.5),   // 开始水平弯出（未动）
  new THREE.Vector3(3.0, 6.5, 3.0)     // 灯罩碗口位置（v16: 从 v15 的 5.7 还原到 v14 的 6.5；灯杆顶面"插入"碗口平面 y=6.5）
]);
const arcTube = new THREE.Mesh(
  new THREE.TubeGeometry(arcCurve, 32, 0.04, 8, false),
  new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.4, metalness: 0.7 })
);
arcTube.castShadow = true;
arcLamp.add(arcTube);
// 橙色半圆灯罩（开口朝下）—— 半球 SphereGeometry
// 关键：SphereGeometry 上半球（thetaStart=0, thetaLength=π/2）默认开口就在 y=0 朝 -y（朝下）
// 上一版 bug：rotation.x = π 把"默认朝下"翻成"朝上"，用户看到灯罩开口朝天 —— 已修
const arcShade = new THREE.Mesh(
  new THREE.SphereGeometry(0.55, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
  new THREE.MeshStandardMaterial({
    color: 0xe07840, roughness: 0.55, metalness: 0.15,
    emissive: 0xffd9a0, emissiveIntensity: 0.45, side: THREE.DoubleSide
  })
);
arcShade.position.set(3.0, 6.5, 3.0);  // v16：球心 = 碗口平面 y=6.5（v14 还原；碗口朝下，碗底 y=7.05 朝天）
// arcShade.rotation.x = 0;  // 不旋转，默认开口朝下（朝 -y，照桌面）—— v12 修复
arcShade.castShadow = true;
arcLamp.add(arcShade);
// 灯罩下沿的小黑环（碗口边缘装饰）
const arcShadeRing = cyl(0.55, 0.55, 0.04, 0x1a1a1a, 0.6, 32);
arcShadeRing.position.set(3.0, 6.5, 3.0);  // v16：碗口边缘 y=6.5（v14 还原；与球心同高 = 开口平面；与灯杆顶面 y=6.5 接触）
arcLamp.add(arcShadeRing);
// 灯头处微亮（让灯罩看起来有光）—— 灯泡挂在碗内
const arcBulb = new THREE.Mesh(
  new THREE.SphereGeometry(0.20, 16, 12),
  new THREE.MeshStandardMaterial({
    color: 0xfff4d0, emissive: 0xffe9a0, emissiveIntensity: 1.8,
    roughness: 0.6, metalness: 0
  })
);
arcBulb.position.set(3.0, 5.88, 3.0);  // v16：灯泡保留 v15 位置 y=5.88（碗口 y=6.5 下方 0.62 单位 = 灯罩外露下垂到碗口下方 0.62 = 爱迪生灯泡外露效果）
arcLamp.add(arcBulb);
// 位置：房间中后偏左（从墙角往中央挪 2.5，灯更偏房间中心），弧形杆垂直上升后水平延伸
arcLamp.position.set(-4.5, 0, -4.5);
scene.add(arcLamp);

// ---------- 六抽屉柜（招牌家具，靠后墙右侧）---------- 高度降低 1/3，抽屉变长方形
const cabinet = new THREE.Group();
const cabBody = box(2.8, 3.07, 1.5, WOOD); cabBody.position.set(0, 1.535, 0); cabinet.add(cabBody);  // 高度 4.6 → 3.07（4.6×2/3）
const cabTop = box(3.0, 0.18, 1.7, WOOD_D); cabTop.position.set(0, 3.16, 0); cabinet.add(cabTop);  // 顶板 y=3.16
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 2; c++) {
    const fy = 2.5 - r * 1.0;  // 顶抽屉 y=2.5, 中=1.5, 底=0.5（间隔 1.0 = 抽屉 0.65 + 间隙 0.35）
    const fx = c === 0 ? -0.7 : 0.7;
    const f = box(1.2, 0.65, 0.08, CREAM);  // 抽屉变扁：高度 1.3 → 0.65（长方形 1.2×0.65）
    f.position.set(fx, fy, 0.76); cabinet.add(f);
    const handle = box(0.5, 0.08, 0.12, WOOD_D);  // 把手缩小匹配
    handle.position.set(fx, fy, 0.83); cabinet.add(handle);
  }
}
cabinet.position.set(6.0, 0, -6.6);  // 往沙发右侧挪 2.0（沙发右扶手外缘 x=4.29，柜左缘 x=4.5，间隙 0.21 紧贴但不重叠）
scene.add(cabinet);

// ---------- 杂志架（黑色铁艺 4 层 + 顶半圆拱）
// v11：桌子左侧 x=-7.0；
// v12：挪到桌子正前方贴左墙 + 整体放大 5 倍（在 -6.5, 0, +2.2）；
// v13：缩小 1/2（scale→2.5）+ 往 +Z 外移（z→3.5）+ 绕 y 旋转 90°（长边沿 z 靠墙）；
// v14（本轮）：①位置 x-0.5→-7.0、z+2→5.5；②长边 0.5→1.0（几何加宽，scale 仍 2.5 → 世界长边 2.5m = v13 1.25m 的 2 倍，高度 5.18m 不变）；③物件沿长边均匀铺开不拥挤；④书比例改 3:4
// 位置：中心 (-7.0, 0, +5.5)，立柱 ±0.50×scale 沿 z，shelf 长边 1.0×scale=2.5m 沿 z（平行左墙=长边靠墙）✓
const magazineRack = new THREE.Group();
magazineRack.position.set(-7.0, 0, 5.5);
magazineRack.scale.setScalar(2.5);  // v13 定标 2.5（高 5.18m）；v14 仅加宽长边几何，高度/缩放不变
magazineRack.rotation.y = Math.PI / 2;  // v13：绕 y 旋转 90°（shelf 长边沿 z 靠墙）
const ironMat = new THREE.MeshStandardMaterial({
  color: 0x121212, roughness: 0.45, metalness: 0.75
});
// 2 根立柱（黑色铁艺）
[-0.50, 0.50].forEach(x => {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 1.85, 12),
    ironMat
  );
  pole.position.set(x, 0.925, 0);
  pole.castShadow = true;
  magazineRack.add(pole);
});
// 顶半圆拱（拱门造型）
const arch = new THREE.Mesh(
  new THREE.TorusGeometry(0.50, 0.018, 10, 32, Math.PI),
  ironMat
);
arch.rotation.x = Math.PI;  // 半圆开口朝下
arch.position.set(0, 1.85, 0);
arch.castShadow = true;
magazineRack.add(arch);
// 4 层搁板（每层宽 0.50, 深 0.25, 厚 0.025）
const SHELF_LEVELS = [0.18, 0.63, 1.08, 1.53];
SHELF_LEVELS.forEach(y => {
  const shelf = new THREE.Mesh(
    new THREE.BoxGeometry(1.00, 0.025, 0.25),
    ironMat
  );
  shelf.position.set(0, y, 0);
  shelf.castShadow = true; shelf.receiveShadow = true;
  magazineRack.add(shelf);
  // 每层前缘"挡条"（防止书/CD 滑出）
  // v13：rotation.y = π/2 后，原 z=+0.115 偏移旋转成 +x 方向，但 slot 已改成沿 x 偏移
  //      凸出 +z 方向（朝相机），所以挡条也要相应调整：原 z=+0.115 改 z=-0.115
  //      旋转后挡条凸出 -x 方向（远离桌子）= 防止 slot 朝 -z 方向（旋转后 -x 方向）滑出 ✓
  const rail = new THREE.Mesh(
    new THREE.BoxGeometry(1.00, 0.025, 0.02),
    ironMat
  );
  rail.position.set(0, y + 0.06, -0.115);
  magazineRack.add(rail);
});
// 底部踢脚（架子底座）
const rackBase = new THREE.Mesh(
  new THREE.BoxGeometry(1.02, 0.05, 0.27),
  ironMat
);
rackBase.position.set(0, 0.025, 0);
magazineRack.add(rackBase);
scene.add(magazineRack);

// ---------- 杂志架上的物件（圆形黑胶 / 方形专辑 / 长方形书籍）—— 全部预留图片位 ----------
// 占位纹理生成器（用 Canvas 画占位图，标注 slot 编号，方便后期传图替换）
function makeMagPlaceholderTexture(label, type, w = 256, h = 256) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  // 背景（按 type 区分颜色）
  const bgMap = { record: '#1a1a1a', album: '#3a4a6a', book: '#6a4a2a' };
  ctx.fillStyle = bgMap[type] || '#444';
  ctx.fillRect(0, 0, w, h);
  // 斜纹底（增加质感）
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let i = -w; i < w; i += 16) {
    ctx.fillRect(i, 0, 8, h);
  }
  // 边框
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, w - 12, h - 12);
  // 中心文字
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, w / 2, h / 2 - 14);
  // 副标题
  ctx.font = '18px sans-serif';
  const subMap = { record: '黑胶唱片 · 封面位', album: '音乐专辑 · 封面位', book: '书籍 · 封面位' };
  ctx.fillText(subMap[type] || '封面位', w / 2, h / 2 + 30);
  // 提示
  ctx.font = '14px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('放图: assets/mag/' + label.toLowerCase().replace(/\s+/g, '-') + '.png', w / 2, h / 2 + 60);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// 异步加载真实图片（失败时保持占位纹理）
function tryLoadMagCover(coverMesh, filename) {
  const loader = new THREE.TextureLoader();
  loader.load(
    'assets/mag/' + filename,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      coverMesh.material.map = tex;
      coverMesh.material.needsUpdate = true;
    },
    undefined,
    () => { /* 文件不存在，保留占位纹理 */ }
  );
}

// 物件生成器：type = 'record' | 'album' | 'book'
function makeMagItem(filename, label, type, w, h, x, y, z) {
  const grp = new THREE.Group();
  grp.position.set(x, y, z);
  // 中心点放在物件底部中央（搁板面 y=0）
  let coverMesh;
  if (type === 'record') {
    // 黑胶唱片：黑色圆盘 + 中心圆形封面
    const vinyl = new THREE.Mesh(
      new THREE.CylinderGeometry(Math.min(w, h) / 2, Math.min(w, h) / 2, 0.006, 48),
      new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.4, metalness: 0.15 })
    );
    vinyl.rotation.x = Math.PI / 2;  // 轴沿 z，圆面朝 +z
    vinyl.castShadow = true;
    grp.add(vinyl);
    // 中心圆标贴（封面位置）
    coverMesh = new THREE.Mesh(
      new THREE.CircleGeometry(Math.min(w, h) * 0.32, 32),
      new THREE.MeshStandardMaterial({
        map: makeMagPlaceholderTexture(label, 'record', 256, 256),
        roughness: 0.6, metalness: 0.0
      })
    );
    coverMesh.position.z = 0.004;
    grp.add(coverMesh);
  } else if (type === 'album') {
    // 方形专辑：薄盒 + 正面封面
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 0.012),
      new THREE.MeshStandardMaterial({ color: 0x222a3a, roughness: 0.5, metalness: 0.1 })
    );
    box.castShadow = true;
    grp.add(box);
    coverMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 0.94, h * 0.94),
      new THREE.MeshStandardMaterial({
        map: makeMagPlaceholderTexture(label, 'album', 256, 256),
        roughness: 0.55, metalness: 0.05
      })
    );
    coverMesh.position.z = 0.007;
    grp.add(coverMesh);
  } else { // book
    // 长方形书：书盒 + 封面
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 0.10),
      new THREE.MeshStandardMaterial({ color: 0x553a22, roughness: 0.75, metalness: 0.05 })
    );
    book.castShadow = true;
    grp.add(book);
    coverMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 0.94, h * 0.94),
      new THREE.MeshStandardMaterial({
        map: makeMagPlaceholderTexture(label, 'book', 256, 256),
        roughness: 0.6, metalness: 0.05
      })
    );
    coverMesh.position.z = 0.052;
    grp.add(coverMesh);
  }
  tryLoadMagCover(coverMesh, filename);
  return grp;
}

// 物件摆放规则（v14：长边 2x 加宽后，slot 沿 x 均匀铺开，黑胶/专辑/书籍不再拥挤）
// 说明：magazineRack 已 rotation.y = π/2，物件凸出 +z 局部 → 旋后 +x 世界（朝相机）。
//       slot 的 x 即沿搁板长边（世界 z）的位置；z 固定 0（搁板中心深度）。
// 第 1 层（y=1.53）：1 圆形黑胶 + 1 方形专辑
magazineRack.add(makeMagItem('record-1.png', 'Record 1', 'record', 0.34, 0.34, -0.25, 1.53 + 0.17, 0));
magazineRack.add(makeMagItem('album-1.png',   'Album 1',  'album',  0.20, 0.20,  0.25, 1.53 + 0.10, 0));
// 第 2 层（y=1.08）：2 本长方形书（比例 3:4）
magazineRack.add(makeMagItem('book-1.png', 'Book 1', 'book', 0.18, 0.24, -0.22, 1.08 + 0.12, 0));
magazineRack.add(makeMagItem('book-2.png', 'Book 2', 'book', 0.18, 0.24,  0.22, 1.08 + 0.12, 0));
// 第 3 层（y=0.63）：2 方形专辑 + 1 本书（书比例 3:4）
magazineRack.add(makeMagItem('album-2.png', 'Album 2', 'album', 0.18, 0.18, -0.35, 0.63 + 0.09, 0));
magazineRack.add(makeMagItem('book-3.png',  'Book 3',  'book',  0.18, 0.24,  0.00, 0.63 + 0.12, 0));
magazineRack.add(makeMagItem('album-3.png', 'Album 3', 'album', 0.18, 0.18,  0.35, 0.63 + 0.09, 0));
// 第 4 层（y=0.18）：1 圆形黑胶 + 1 方形专辑（补回原设计的第 9 个 slot album-4）
magazineRack.add(makeMagItem('record-2.png', 'Record 2', 'record', 0.32, 0.32, -0.25, 0.18 + 0.16, 0));
magazineRack.add(makeMagItem('album-4.png',  'Album 4',  'album',  0.18, 0.18,  0.25, 0.18 + 0.09, 0));
magazineRack.add(makeMagItem('album-4.png',  'Album 4',  'album',  0.18, 0.18,  0.11 - 0.115, 0.18 + 0.09, 0));

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

// 【MacBook 笔记本开盖】居中面对椅子（椅子在 +x 方向）
// 整组放在桌子中心，屏幕 hinge 在底座 -z 端立起，rotation 略向后倾
const macbook = new THREE.Group();
// 底座（梯形：靠屏幕端 0.74 厚，靠用户端 0.78 厚，更像真笔记本）
// 简化为 box 1.20×0.04×0.78 银灰金属
const macBase = box(1.20, 0.04, 0.78, 0xc8ccd0, 0.4, { metalness: 0.6 });
macBase.position.set(0, 0.02, 0);
macbook.add(macBase);
// 键盘区（黑色凹陷，整体大方块，不再画键位细节）
const macKeyboard = box(0.95, 0.006, 0.50, 0x1c1c1c, 0.5);
macKeyboard.position.set(0, 0.045, 0.10);
macbook.add(macKeyboard);
// TouchPad（触摸板，银灰）
const macTouchPad = box(0.42, 0.006, 0.22, 0xa8acaf, 0.35);
macTouchPad.position.set(0, 0.045, -0.24);
macbook.add(macTouchPad);
// 屏幕组（hinge 在底座 -z 端，立起来）
const macScreen = new THREE.Group();
macScreen.position.set(0, 0.04, -0.39);
macScreen.rotation.x = 0.349;  // 约 110° 翻盖（从合盖 -90° 翻 110°，屏幕和底座夹角 110°）
macbook.add(macScreen);
// 屏幕外框（银灰金属）
const macFrame = box(1.20, 0.78, 0.04, 0xc8ccd0, 0.4, { metalness: 0.6 });
macFrame.position.set(0, 0.39, 0);
macScreen.add(macFrame);
// 屏幕内屏（**深蓝色**，不是纯黑，更像"开机的电脑"）
const macInset = box(1.10, 0.66, 0.005, 0x1a3a60, 0.4, { metalness: 0.05, emissive: 0x0a1a30, emissiveIntensity: 0.3 });
macInset.position.set(0, 0.40, 0.022);
macScreen.add(macInset);
// 屏幕顶端的小刘海（macbook 标志）
const macNotch = box(0.18, 0.04, 0.015, 0x0a0a0a, 0.7);
macNotch.position.set(0, 0.78, 0.020);
macScreen.add(macNotch);
// 屏幕底部的 Apple Logo（屏幕中央略偏下，银灰金属反光）
const macApple = new THREE.Mesh(
  new THREE.CircleGeometry(0.06, 24),
  new THREE.MeshStandardMaterial({ color: 0xe8ecf0, roughness: 0.25, metalness: 0.7 })
);
macApple.position.set(0, 0.39, -0.022);
macApple.rotation.y = Math.PI;  // 朝外（屏幕背面，朝向相机）
macScreen.add(macApple);
macbook.position.set(0, DESK_H + 0.20, -0.15);  // 抬到桌面上方（110° 翻盖后屏幕底部 y=0.197 > 桌面 0 浮在桌面上）
macbook.rotation.y = Math.PI / 2;  // 转方向：屏幕朝 -x 椅子方向（椅子在桌子 +x 方向，屏幕 normal 指向 -x 面对用户）
desk.add(macbook);

// 【玻璃水杯 + 2/3 水】保留不动
// （水杯已经 2/3 水 + 玻璃透明，看起来"像水杯"，不动）
const glassCup = cyl(0.17, 0.14, 0.50, 0xffffff, 0.05);
glassCup.material = new THREE.MeshStandardMaterial({
  color: 0xddeef8, roughness: 0.05, metalness: 0.15,
  transparent: true, opacity: 0.45, side: THREE.DoubleSide
});
glassCup.position.set(-0.70, DESK_H + 0.29, DESK_L * 0.32);
desk.add(glassCup);
const waterMat = new THREE.MeshStandardMaterial({
  color: 0x9ec9e8, roughness: 0.20, metalness: 0.05,
  transparent: true, opacity: 0.65, side: THREE.DoubleSide
});
const water = cyl(0.15, 0.13, 0.32, 0x9ec9e8, 0.20);
water.material = waterMat;
water.position.set(-0.70, DESK_H + 0.18, DESK_L * 0.32);
desk.add(water);
const waterTop = cyl(0.15, 0.15, 0.005, 0xc4def0, 0.1);
waterTop.position.set(-0.70, DESK_H + 0.34, DESK_L * 0.32);
desk.add(waterTop);

// 【MacBook 鼠标】传统圆滑鼠标（用 LatheGeometry 旋转面，更像"鼠标"而不是"耳机"）
// 鼠标侧面轮廓（半剖面）：从底面到顶部拱起，前端圆后端略平
const mouseProfile = [
  new THREE.Vector2(0.00, 0.00),   // 底面中线
  new THREE.Vector2(0.07, 0.00),   // 底面边缘
  new THREE.Vector2(0.085, 0.015), // 底弧
  new THREE.Vector2(0.090, 0.035), // 中部下
  new THREE.Vector2(0.085, 0.055), // 中部
  new THREE.Vector2(0.065, 0.080), // 中上
  new THREE.Vector2(0.030, 0.095), // 顶前
  new THREE.Vector2(0.000, 0.100)  // 顶部中线
];
const macMouse = new THREE.Mesh(
  new THREE.LatheGeometry(mouseProfile, 28),
  new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.32, metalness: 0.15 })
);
macMouse.scale.set(1.0, 1.0, 1.45);  // z 拉长 1.45 倍（前长后短）
macMouse.position.set(0.62, DESK_H + 0.18, -DESK_L * 0.20);  // 抬到桌面上方
macMouse.castShadow = true;
desk.add(macMouse);
// 鼠标中线（左右键分隔线）
const mouseLine = box(0.003, 0.002, 0.18, 0xaaaaaa, 0.4);
mouseLine.position.set(0.62, DESK_H + 0.275, -DESK_L * 0.20 + 0.02);  // y 略高，z 微偏前
desk.add(mouseLine);
// 滚轮（小圆柱，横向）
const mouseWheel = cyl(0.012, 0.012, 0.022, 0x333333, 0.5, 16);
mouseWheel.rotation.z = Math.PI / 2;
mouseWheel.position.set(0.62, DESK_H + 0.275, -DESK_L * 0.20 - 0.01);
desk.add(mouseWheel);

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

// ---------- 普通绿叶盆栽（6 片普通椭圆/水滴形绿叶，整体大小与原 monstera 一致）----------
// 保持 scale 1.60 + position (-2.2, 0, -5.5) 不变；只把龟背竹羽裂叶换成普通椭圆叶，画面更协调
const monstera = new THREE.Group();
// 陶土盆（与上轮一致）
const mPot = cyl(0.55, 0.42, 1.0, 0xc97650, 0.95);
mPot.position.set(0, 0.50, 0);
mPot.castShadow = true; mPot.receiveShadow = true;
monstera.add(mPot);
const mPotRim = cyl(0.58, 0.58, 0.07, 0xb56843, 0.95);
mPotRim.position.set(0, 1.04, 0);
monstera.add(mPotRim);
const mSoil = cyl(0.52, 0.52, 0.05, 0x4a3320, 1.0);
mSoil.position.set(0, 1.10, 0);
monstera.add(mSoil);
// 主茎
const mStem = cyl(0.10, 0.13, 2.2, 0x5a3f2a, 0.85);
mStem.position.set(0, 2.20, 0);
mStem.castShadow = true;
monstera.add(mStem);
// 普通绿叶：每片用水滴形 ShapeGeometry（顶端尖、底部圆），不挖洞
function makeOvalLeaf() {
  const shape = new THREE.Shape();
  // 水滴形：底部圆弧收尾，顶部尖收尾
  shape.moveTo(0, 0.78);                       // 顶部尖
  shape.bezierCurveTo(0.55, 0.55, 0.62, 0.0, 0, -0.62);  // 右侧
  shape.bezierCurveTo(-0.62, 0.0, -0.55, 0.55, 0, 0.78); // 左侧回到顶
  return new THREE.ShapeGeometry(shape, 24);
}
const leafMat = new THREE.MeshStandardMaterial({
  color: 0x4a8a5a, roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide
});
// 6 片叶错落摆放（高度和方向错开）
const leafConfigs = [
  { y: 1.40, a: 0.30, tilt: -0.25, leanX: 0.20, s: 1.10 },
  { y: 1.75, a: 1.10, tilt: -0.05, leanX: 0.30, s: 1.20 },
  { y: 2.10, a: 1.85, tilt:  0.18, leanX: 0.18, s: 1.15 },
  { y: 2.45, a: 2.55, tilt:  0.38, leanX: 0.05, s: 1.05 },
  { y: 2.75, a: 3.30, tilt:  0.55, leanX: 0.00, s: 0.95 },
  { y: 2.95, a: 4.20, tilt:  0.65, leanX: 0.00, s: 0.85 }
];
leafConfigs.forEach(cfg => {
  const leaf = new THREE.Mesh(makeOvalLeaf(), leafMat);
  leaf.position.set(Math.cos(cfg.a) * 0.28, cfg.y, Math.sin(cfg.a) * 0.28);
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
monstera.scale.setScalar(1.60);  // 整体大小与上轮一致
monstera.position.set(-3.5, 0, -5.5);  // 往左挪避开沙发左扶手（原 -2.2 与沙发 -1.825 重叠 ~0.9）
scene.add(monstera);

// ---------- 墙上挂画（用户提供的爬山图）----------
const wallArtGroup = new THREE.Group();
wallArtGroup.position.set(1.1, 6.4, -7.78);  // 水平移到沙发正上方（沙发中心 x=1.1）
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
