// 髋关节助力外骨骼（助力行走）· Sketch3D 示例
// 单位 cm，y 朝上，人朝 +x 走，+z 是人的右侧。
//
// 数据与依据（按性质分开）：
// 【产品备案】三星 GEMS-H，美国 FDA 510(k) K213452（2022-04-21）：整机 2.1 kg；两个电机都在髋部，辅助屈髋和伸髋；
//            最大扭矩 12 Nm ± 15%；髋关节角度传感器 + 电流传感器测扭矩；锂电池 21.6 V / 2950 mAh，连续步行约 2 小时（增益 7）；
//            故障时切断电机扭矩，变成被动穿戴；用途：康复机构里、受训治疗师监督下的中风后步行训练。
// 【研究论文】Frontiers in Bioengineering 2024（e-Walk，HPT 控制器）：以脚跟着地为 0%，伸髋助力峰值在 10%，
//            135 mNm/kg；屈髋助力峰值在 60%，67.5 mNm/kg；相位由髋关节角度（和它的积分）算出来。
// 【开源样机】Omnics Portable Hip Exoskeleton：准直驱电机 + 8:1 减速。
// 【模拟假设】使用者 60 kg → 伸髋峰值 8.1 Nm、屈髋峰值 4.1 Nm；髋/膝/踝角度曲线按常见步态形状示意；
//            驱动器里“电机 + 行星减速器”是示意结构，GEMS-H 内部结构未公开；动画放慢约 8 倍。
// 颜色按 Agingbuy 2.0 功能色：电路/信号 = 黄绿，人体/接触 = 粉紫；机械输出（齿轮、助力方向）用黄色。
export const makeScene = (S, M) => {
  const C = {
    skin: '#e3b8f0', strap: '#c77dde', bone: '#fff1c1', alu: '#c7ced6', slate: '#5c677d', steel: '#a9b4c2',
    signal: '#8ac926', gear: '#ffd166', shell: '#dfe6ee', floor: '#f7f3ea'
  };

  /* ───────── 1. 几何常数（关节、接触点、接口都从这里算） ───────── */
  const L_TH = 42, L_SH = 41, HIP_Z = 9;                 // 大腿、小腿长；两髋关节中心各离中线 9 cm
  const TH_R0 = 8, TH_R1 = 5.5;                           // 大腿上端、下端半径
  const rTh = (y) => TH_R0 + (TH_R1 - TH_R0) * (-y / L_TH);   // 大腿在 y（相对髋关节，向下为负）处的半径
  const HEEL = [-6, -7.5], TOE = [18, -7.5];              // 足跟、足尖相对踝关节
  const BELT = { y: 8, h: 5.5, rx: 11.6, rz: 17.2 };       // 腰带（椭圆环），相对髋关节中点
  const ACT = { r: 5.5, d: 4.5, z0: 17.75 };              // 驱动器：半径、厚度、内侧面离中线
  const ACT_Z = ACT.z0 + ACT.d / 2, ACT_OUT = ACT.z0 + ACT.d;
  const CUFF_Y = -20, CUFF_H = 5, CUFF_IN = rTh(CUFF_Y) + 0.15;
  const HUB_Z = ACT_OUT - HIP_Z;                          // 大腿支架的输出盘，在大腿坐标里的 z
  const PACK = { x0: -(BELT.rx + 6.7), x1: -(BELT.rx + 0.7), y0: 1.5, y1: 15, z: 9 };   // 控制盒挂在腰带后面
  const RATIO = 8, SUN = 0.6, PLA = 1.8, RING = SUN + 2 * PLA;                 // 行星减速：太阳轮 / 行星轮 / 内齿圈（示意，8:1）
  const MASS = 60, EXT_PK = 0.135 * MASS, FLX_PK = 0.0675 * MASS, T_MAX = 12;  // Nm

  /* ───────── 2. 步态模型（u = 右腿一个步态周期，0 = 右脚跟着地） ───────── */
  const sm = M.smooth, TAU = M.TAU;
  const wrap = (x) => M.frac(x);
  const bump = (u, c, w) => { let d = Math.abs(wrap(u - c + 0.5) - 0.5); return d < w ? 0.5 * (1 + Math.cos(Math.PI * d / w)) : 0; };
  const hip = (u) => 10 + 20 * Math.cos(TAU * (u - 0.9));                       // 屈为正：着地 +26°，40% 时 -10°，90% 时 +30°
  const knee = (u) => 5 + 13 * bump(u, 0.15, 0.13) + 57 * bump(u, 0.73, 0.24);  // 屈膝为正
  const footG = (u) => 12 * (1 - sm(0, 0.08, u)) - 35 * sm(0.4, 0.62, u) + 25 * sm(0.62, 0.75, u) + 10 * sm(0.75, 0.85, u) + 12 * sm(0.88, 1, u);
  const torque = (u) => FLX_PK * bump(u, 0.6, 0.14) - EXT_PK * bump(u, 0.1, 0.17);   // + 屈髋助力，- 伸髋助力（Nm）
  const rot2 = (p, deg) => { const a = deg * M.D2R, c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
  function leg(u) {                                       // 平面运动学：髋 → 膝 → 踝 → 足跟 / 足尖
    const h = hip(u), k = knee(u), g = footG(u);
    const kn = rot2([0, -L_TH], h), an = rot2([0, -L_SH], h - k);
    const ank = [kn[0] + an[0], kn[1] + an[1]], he = rot2(HEEL, g), to = rot2(TOE, g);
    return { h, k, a: g - h + k, g, ank, low: Math.min(ank[1] + he[1], ank[1] + to[1]), heelX: ank[0] + he[0] };
  }
  const pelvisY = (u) => -Math.min(leg(u).low, leg(u + 0.5).low);              // 较低的那只脚刚好踩在地面 y = 0
  const BELT_V = (leg(0.06).heelX - leg(0.36).heelX) / 0.30;                    // 支撑脚往后滑的速度（地面线跟着走）

  /* ───────── 3. 形状 ───────── */
  const ell = (rx, ry, rz) => S.xf(S.sphere(1, { seg: 18, rings: 10 }), { scale: [rx, ry, rz] });
  const torsoMesh = S.xf(S.lathe([[0, -9], [13, -8], [17, 0], [16, 8], [14.5, 20], [16.5, 34], [18, 44], [16, 52], [7, 55], [0, 55.5]], { seg: 30 }), { scale: [0.62, 1, 1] });
  const thighMesh = S.xf(S.cyl(rTh(-L_TH), L_TH + 2, { r2: rTh(2), seg: 22 }), { at: [0, -L_TH / 2 + 1, 0] });   // 半径和 rTh() 同一条线
  const shankMesh = S.merge(S.xf(S.cyl(3.6, L_SH, { r2: 5.4, seg: 20 }), { at: [0, -L_SH / 2, 0] }), S.xf(ell(5.6, 3, 5.6), { at: [0, -0.5, 0] }));
  const footMesh = S.merge(S.xf(S.box(TOE[0] - HEEL[0] - 4, 5.5, 9, { sub: 2 }), { at: [(TOE[0] + HEEL[0]) / 2 - 1, -4.75, 0] }),
    S.xf(ell(3.2, 3.6, 4.4), { at: [HEEL[0] + 3.2, -3.9, 0] }), S.xf(ell(4, 2.8, 4.6), { at: [TOE[0] - 4, -4.7, 0] }));
  const armMesh = (s) => S.xf(S.merge(S.xf(S.cyl(3.2, 28, { r2: 4.2, seg: 16 }), { at: [0, -14, 0] }), S.xf(S.cyl(2.4, 25, { r2: 3.1, seg: 14 }), { at: [3, -40, 0], rot: [0, 0, 12] }),
    S.xf(ell(3, 4.5, 1.8), { at: [5.6, -54.5, 0] })), { rot: [-s * 12, 0, 0] });
  const beltMesh = S.xf(S.cyl(1, BELT.h, { inner: 0.94, seg: 44 }), { at: [0, BELT.y, 0], scale: [BELT.rx, 1, BELT.rz] });
  const beltPt = (phi, y, off = 0.7) => [(BELT.rx + off) * Math.cos(phi), y, (BELT.rz + off) * Math.sin(phi)];
  const arcMesh = (() => {                                 // 助力方向箭头：绕 z 轴的弧，箭头朝逆时针（= 屈髋方向）
    const R = ACT.r + 2, pts = []; for (let i = 0; i <= 18; i++) { const a = (-55 + (110 * i) / 18) * M.D2R; pts.push([R * Math.cos(a), R * Math.sin(a), 0]); }
    const a1 = 55 * M.D2R, tip = [R * Math.cos(a1 + 0.32), R * Math.sin(a1 + 0.32), 0];
    return S.merge(S.tube(pts, 0.45, { seg: 8 }), S.xf(S.cone(1.2, 2.6, { seg: 12 }), { at: [(pts[18][0] + tip[0]) / 2, (pts[18][1] + tip[1]) / 2, 0], rot: [0, 0, 55 + 90 + 10] }));
  })();

  /* ───────── 4. 部件 ───────── */
  const parts = [
    { id: 'floor', role: 'ground', mesh: S.box(100, 1, 64), at: [5, -0.5, 0], color: C.floor, hatch: false, pick: false, dim: false, name: '地面' },
    { id: 'dashes', mesh: S.merge(...Array.from({ length: 5 }, (_, i) => [-24, 24].map((zz) => S.xf(S.box(9, 0.1, 1.2), { at: [-35 + i * 20, 0.05, zz] }))).flat()), color: '#e9e2d2', pick: false, dim: false, hatch: false, name: '地面线' },

    // 使用者（外壳角色：点“透视”就看到骨头和驱动器里面）
    { id: 'torso', role: 'shell', mesh: torsoMesh, color: C.skin, label: '使用者（示意）', anchor: [0, 40, 16],
      note: 'GEMS-H 在美国备案的用途是：康复机构里、受训治疗师在旁监督，帮助中风后步行有困难的人做行走训练；不用于运动，严重骨质疏松等情况禁用。' },
    { id: 'head', role: 'shell', parent: 'torso', mesh: S.merge(S.xf(S.cyl(5, 6, { seg: 16 }), { at: [0, 57, 0] }), S.xf(ell(9.5, 11.5, 8.5), { at: [1, 70, 0] })), color: C.skin, name: '头' },
    ...[1, -1].flatMap((s) => {
      const k = s > 0 ? 'R' : 'L', side = s > 0 ? '右' : '左';
      return [
        { id: 'arm' + k, role: 'shell', parent: 'torso', mesh: armMesh(s), at: [0, 50, s * 21], color: C.skin, name: side + '臂' },
        { id: 'thigh' + k, role: 'shell', parent: 'torso', mesh: thighMesh, at: [0, 0, s * HIP_Z], color: C.skin, name: side + '大腿' },
        { id: 'shank' + k, role: 'shell', parent: 'thigh' + k, mesh: shankMesh, at: [0, -L_TH, 0], color: C.skin, name: side + '小腿' },
        { id: 'foot' + k, role: 'shell', parent: 'shank' + k, mesh: footMesh, at: [0, -L_SH, 0], color: C.skin, name: side + '脚' },
        // 骨头（透视才看得见）：髋关节中心就是驱动器要对准的轴
        { id: 'femur' + k, role: 'inside', in: 'thigh' + k, parent: 'thigh' + k, color: C.bone, hatch: false,
          mesh: S.merge(S.sphere(2.2, { seg: 14 }), S.tube(S.curve([[0, 0, 0], [0, -3, s * 3], [0, -9, s * 3.4], [0, -L_TH + 2, s * 0.6]], 5), 1.3, { seg: 8 }),
            S.xf(ell(2.6, 2.2, 3.4), { at: [0, -L_TH + 1, 0] })),
          label: s > 0 ? '髋关节（股骨头）' : undefined, name: side + '股骨', anchor: [0, 0, 0],
          note: '股骨头在骨盆的髋臼里转动，这里就是髋关节的转动中心。驱动器的转轴要和它对齐，否则走路时支架会和大腿“别劲”、绑带来回蹭。' },
        { id: 'tibia' + k, role: 'inside', in: 'shank' + k, parent: 'shank' + k, color: C.bone, hatch: false,
          mesh: S.tube([[0, -1.5, 0], [0, -L_SH + 2, 0]], 1.4, { seg: 8 }), name: side + '胫骨' }
      ];
    }),
    { id: 'pelvisBone', role: 'inside', in: 'torso', parent: 'torso', color: C.bone, hatch: false, name: '骨盆',
      mesh: S.merge(S.xf(S.cyl(12, 12, { r2: 14, inner: 9, inner2: 11, seg: 26 }), { at: [0, 4, 0], scale: [0.55, 1, 1] }),
        ...[1, -1].map((s) => S.xf(S.cyl(2.9, 2.2, { axis: 'z', inner: 2.3, seg: 16 }), { at: [0, 0, s * (HIP_Z - 1.8)] }))) },

    // 腰带 + 控制盒
    { id: 'belt', parent: 'torso', mesh: beltMesh, color: C.strap, label: '腰带', anchor: [BELT.rx * 0.7, BELT.y + 2, BELT.rz * 0.7],
      note: '软腰带绕在髂骨上方，把整套装置挂在骨盆上。电机推大腿时，反作用力就由腰带传给骨盆。' },
    { id: 'pack', role: 'shell', parent: 'torso', mesh: S.box(PACK.x1 - PACK.x0, PACK.y1 - PACK.y0, PACK.z * 2, { sub: 2 }), at: [(PACK.x0 + PACK.x1) / 2, (PACK.y0 + PACK.y1) / 2, 0],
      color: C.shell, label: '控制盒', anchor: [0, 6.75, 0], note: '挂在腰后，里面是电池、主控板和惯性传感器。点“透视”能看到里面。' },
    { id: 'battery', role: 'inside', in: 'pack', parent: 'torso', mesh: S.box(3.2, 10, 15), at: [PACK.x0 + 2.2, 8.25, 0], color: C.slate, label: '电池',
      note: 'GEMS-H 用 21.6 V、2950 mAh 的锂电池，充电约 2 小时；连续步行约 2 小时（增益 7，0.8–1.1 m/s），增益 8 时约 1 小时。' },
    { id: 'board', role: 'inside', in: 'pack', parent: 'torso', mesh: S.merge(S.box(0.4, 10, 15), S.xf(S.box(1, 2, 2), { at: [0.7, 2, -3] })), at: [PACK.x1 - 1.4, 8.25, 0], color: C.signal, glow: 'active',
      label: '主控板', note: '每一刻都在算：现在走到一步里的百分之几、该给多大扭矩、往哪个方向。故障时立刻切断电机扭矩，装置变成被动的“绑腿”。' },
    { id: 'imu', role: 'inside', in: 'pack', parent: 'torso', mesh: S.box(1.2, 1.6, 1.6), at: [PACK.x1 - 2.4, 4, 4], color: C.signal, name: '惯性传感器', note: '测躯干的加速度和姿态，辅助判断脚跟着地。' },

    // 两侧驱动器
    ...[1, -1].flatMap((s) => {
      const k = s > 0 ? 'R' : 'L', side = s > 0 ? '右' : '左', z = (v) => s * v;
      const g = 'drive' + k;
      return [
        { id: 'bracket' + k, parent: 'torso', mesh: S.box(5, BELT.y + BELT.h / 2 - ACT.r + 1.5, 0.9), at: [0, (BELT.y + BELT.h / 2 + ACT.r - 1.5) / 2, z(BELT.rz + 0.6)], color: C.alu, pick: false, name: side + '挂板' },
        { id: 'act' + k, role: 'shell', parent: 'torso', mesh: S.cyl(ACT.r, ACT.d, { axis: 'z', seg: 30 }), at: [0, 0, z(ACT_Z)], color: C.shell, group: g,
          label: s > 0 ? '髋关节驱动器' : undefined, name: side + '髋关节驱动器', anchor: [0, ACT.r, 0],
          note: '两侧髋部各一个，转轴对准髋关节。GEMS-H 备案写明：最大扭矩 12 Nm ± 15%，整机 2.1 kg。点“透视”看里面的电机和减速器（示意）。' },
        { id: 'stator' + k, role: 'inside', in: 'act' + k, parent: 'torso', mesh: S.cyl(4.9, 1.8, { axis: 'z', inner: 3.1, seg: 26 }), at: [0, 0, z(ACT.z0 + 1.15)], color: C.signal, group: g,
          label: s > 0 ? '电机' : undefined, name: side + '电机', anchor: [0, 4.9, 0], note: '通电产生扭矩。扭矩大小靠控制电流，电流传感器同时用来估算实际输出的扭矩。' },
        { id: 'rotor' + k, role: 'inside', in: 'act' + k, parent: 'torso', mesh: S.merge(S.cyl(2.9, 1.6, { axis: 'z', seg: 20 }), S.xf(S.box(4.6, 0.5, 1.7), { at: [0, 0, 0] })), at: [0, 0, z(ACT.z0 + 1.15)], color: C.slate, group: g, name: side + '电机转子' },
        { id: 'encoder' + k, role: 'inside', in: 'act' + k, parent: 'torso', mesh: S.cyl(1.6, 0.5, { axis: 'z', seg: 16 }), at: [0, 0, z(ACT.z0 + 0.3)], color: C.signal, glow: 'active',
          label: s > 0 ? '角度传感器' : undefined, name: side + '髋角度传感器', anchor: [0, 1.6, 0], note: '一直在测髋关节角度。控制器靠角度曲线判断现在走到一步的哪个位置（相位）。' },
        { id: 'ring' + k, role: 'inside', in: 'act' + k, parent: 'torso', mesh: S.cyl(RING + 0.7, 1.2, { axis: 'z', inner: RING, seg: 30 }), at: [0, 0, z(ACT.z0 + 2.75)], color: C.steel, group: g, name: side + '内齿圈（固定）' },
        { id: 'sun' + k, role: 'inside', in: 'act' + k, parent: 'torso', mesh: S.gear(8, SUN + 0.25, 1.2, { tooth: 0.25 }), at: [0, 0, z(ACT.z0 + 2.75)], color: C.gear, group: g, name: side + '太阳轮' },
        { id: 'carrier' + k, role: 'inside', in: 'act' + k, parent: 'torso', mesh: S.merge(S.cyl(RING - 0.1, 0.5, { axis: 'z', seg: 26 }), S.xf(S.box(0.6, 0.6, 0.6), { at: [SUN + PLA, 0, 0] })),
          at: [0, 0, z(ACT_OUT - 0.55)], color: C.gear, group: g, label: s > 0 ? '行星减速器' : undefined, name: side + '行星架（输出）', anchor: [0, RING, 0],
          note: '电机转得快、劲小；行星减速器把转速降下来、扭矩放大（这里画成 8:1，参考一款开源样机），从行星架输出给大腿支架。比例小、摩擦小，人自己迈腿时也能轻松带着它转。' },
        ...[0, 1, 2].map((i) => ({ id: `planet${k}${i}`, role: 'inside', in: 'act' + k, parent: 'carrier' + k, mesh: S.gear(24, PLA, 1.2, { tooth: 0.25 }),
          at: [(SUN + PLA) * Math.cos((i * 120) * M.D2R), (SUN + PLA) * Math.sin((i * 120) * M.D2R), z(ACT.z0 + 2.75 - (ACT_OUT - 0.55))], color: C.gear, group: g, name: side + '行星轮' })),
        { id: 'arc' + k, parent: 'torso', mesh: arcMesh, at: [0, 0, z(ACT_OUT + 0.6)], color: '#ffb703', hatch: false, pick: false, group: g, name: side + '助力方向' },
        // 大腿支架（跟着大腿转）+ 绑带
        { id: 'frame' + k, parent: 'thigh' + k, color: C.alu, group: 'frame' + k,
          mesh: S.merge(S.xf(S.cyl(1.8, 0.8, { axis: 'z', seg: 18 }), { at: [0, 0, z(HUB_Z + 0.4)] }),
            S.tube(S.curve([[0, -1.5, z(HUB_Z + 0.4)], [0, -9, z(HUB_Z + 0.2)], [0, -15, z(CUFF_IN + 2.5)], [0, CUFF_Y + CUFF_H / 2, z(CUFF_IN + 0.6)]], 5), 0.7, { seg: 8 })),
          ports: [[0, 0, z(HUB_Z)], [0, CUFF_Y + CUFF_H / 2, z(CUFF_IN + 0.6)]],
          label: s > 0 ? '大腿支架' : undefined, name: side + '大腿支架', anchor: [0, -9, z(HUB_Z + 0.2)],
          note: '上端固定在驱动器输出盘上，下端连着大腿绑带。电机的扭矩就是通过它“推”或“拉”大腿。' },
        { id: 'cuff' + k, parent: 'thigh' + k, mesh: S.cyl(CUFF_IN + 0.6, CUFF_H, { inner: CUFF_IN, seg: 30 }), at: [0, CUFF_Y, 0], color: C.strap, group: 'frame' + k,
          label: s > 0 ? '大腿绑带' : undefined, name: side + '大腿绑带', anchor: [CUFF_IN + 0.6, 0, 0],
          note: '魔术贴绑在大腿上，隔着衣服穿。扭矩最后由它压在大腿前面（屈髋）或后面（伸髋）。绑太松会打滑、助力变小；太紧会勒。' },
        { id: 'wire' + k, parent: 'torso', color: C.signal, pick: false, name: side + '线缆',
          mesh: S.tube([[PACK.x1 - 0.2, 12, z(5)], ...Array.from({ length: 9 }, (_, i) => beltPt(M.lerp(Math.PI - 0.55, Math.PI / 2, i / 8) * s, 12.2)), [0, 11, z(BELT.rz + 1)], [0, ACT.r - 0.2, z(ACT_Z)]], 0.25, { seg: 6 }) }
      ];
    })
  ];

  /* ───────── 拆开（E）：人不动；驱动器沿转轴一层层往外，支架、绑带往外侧，腰带和控制盒往上 ───────── */
  const EXPLODE = {
    belt: [0, 22, 0], wireR: [0, 22, 6], wireL: [0, 22, -6],
    pack: [-26, 22, 0], battery: [-18, 22, 0], board: [-11, 22, 0], imu: [-11, 22, 0]
  };
  for (const [k, s] of [['R', 1], ['L', -1]]) Object.assign(EXPLODE, {
    ['bracket' + k]: [0, 22, s * 2], ['encoder' + k]: [0, 0, s * 8], ['stator' + k]: [0, 0, s * 13], ['rotor' + k]: [0, 0, s * 13],
    ['ring' + k]: [0, 0, s * 18], ['sun' + k]: [0, 0, s * 18], ['carrier' + k]: [0, 0, s * 22], ['act' + k]: [0, 0, s * 28], ['arc' + k]: [0, 0, s * 28],
    ['frame' + k]: [0, 0, s * 34], ['cuff' + k]: [0, 0, s * 12]
  });
  parts.forEach((p) => { if (EXPLODE[p.id]) p.explode = EXPLODE[p.id]; });

  /* ───────── 5. 零件清单（Truth first） ───────── */
  const MANIFEST = {
    torso: { on: 'free' },                                   // 人是自己站着的；脚和地面的接触由 pelvisY() 保证（较低的脚 y = 0）
    dashes: { on: 'floor' },
    belt: { on: 'torso' }, pack: { on: 'belt' }, battery: { on: 'pack' }, board: { on: 'pack' }, imu: { on: 'board' },
    ...Object.fromEntries(['R', 'L'].flatMap((k) => [
      ['bracket' + k, { on: 'belt' }], ['act' + k, { on: 'bracket' + k }],
      ['stator' + k, { on: 'act' + k }], ['rotor' + k, { on: 'stator' + k }], ['encoder' + k, { on: 'act' + k }],
      ['ring' + k, { on: 'act' + k }], ['sun' + k, { on: 'rotor' + k }], ['carrier' + k, { on: 'act' + k }],
      ['arc' + k, { on: 'act' + k }],
      // 支架输出盘贴在行星架上（同一组常数：HUB_Z = ACT_OUT - HIP_Z）
      ['frame' + k, { on: 'thigh' + k, drive: { by: 'carrier' + k, at: [0, 0, (k === 'R' ? 1 : -1) * HUB_Z], tol: 0.6 }, connects: ['carrier' + k, 'cuff' + k] }],
      // 绑带内圈贴着大腿表面（CUFF_IN = rTh(CUFF_Y) + 0.15）
      ['cuff' + k, { on: 'thigh' + k, drive: { by: 'thigh' + k, at: [CUFF_IN, 0, 0], tol: 0.4 } }],
      ['wire' + k, { on: 'belt', connects: ['pack', 'act' + k] }],
      ['femur' + k, { on: 'pelvisBone' }], ['tibia' + k, { on: 'shank' + k }]
    ])),
    pelvisBone: { on: 'torso' }
  };

  /* ───────── 6. 粒子流（跟着躯干一起起伏：parent = torso） ───────── */
  const wirePath = (s) => [[PACK.x1 - 0.2, 12, s * 5], ...Array.from({ length: 9 }, (_, i) => beltPt(M.lerp(Math.PI - 0.55, Math.PI / 2, i / 8) * s, 12.2)), [0, 11, s * (BELT.rz + 1)], [0, ACT.r - 0.2, s * ACT_Z]];
  const flows = [
    ...[1, -1].flatMap((s) => {
      const k = s > 0 ? 'R' : 'L', p = wirePath(s);
      return [
        { id: 'sense' + k, role: 'part', parent: 'torso', from: 'act' + k, to: 'pack', color: '#d9ff9e', count: 10, speed: 1.6, size: 0.45, path: p.slice().reverse() },
        { id: 'cmd' + k, role: 'part', parent: 'torso', from: 'pack', to: 'act' + k, color: C.signal, count: 16, speed: 1.8, size: 0.55, path: p }
      ];
    })
  ];

  /* ───────── 7. 步骤 ───────── */
  const steps = [
    { name: '右脚着地：判断相位', from: 0, to: 0.06, color: C.signal, active: ['encoderR', 'encoderL', 'board', 'imu'], flows: ['senseR', 'senseL'],
      view: { yaw: -30, pitch: 8, zoom: 1.35, focus: [0, 72, 0] },
      text: '两侧角度传感器一直在测髋关节角度，主控板据此判断“现在走到这一步的百分之几”。右脚跟着地就是右腿一个步态周期的 0%。' },
    { name: '右腿后蹬 · 左腿前摆', from: 0.06, to: 0.28, color: '#ffb703', active: ['driveR', 'driveL', 'frameR', 'frameL'], flows: ['cmdR', 'cmdL'],
      view: { yaw: -15, pitch: 6, zoom: 2.6, focus: [0, 84, 10] },
      text: '右腿进入支撑：右侧电机往后推大腿（伸髋），帮身体往前送，峰值在周期的约 10%。同一时刻左腿正要迈出：左侧电机往前带大腿（屈髋），峰值在左腿周期的约 60%。两侧一推一拉，方向相反。' },
    { name: '不出力：跟着腿走', from: 0.28, to: 0.44, color: C.steel, active: ['carrierR', 'carrierL', 'cuffR', 'cuffL'],
      view: { yaw: -30, pitch: 8, zoom: 1.35, focus: [0, 72, 0] },
      text: '这段时间两侧几乎不给扭矩，电机只是被腿带着转。减速比小、摩擦小，人自己走也不费劲——不会变成“拖着一副铁架子走路”。' },
    { name: '左脚着地：判断相位', from: 0.44, to: 0.54, color: C.signal, active: ['encoderR', 'encoderL', 'board', 'imu'], flows: ['senseR', 'senseL'],
      view: { yaw: -30, pitch: 8, zoom: 1.35, focus: [0, 72, 0] },
      text: '左脚跟着地，左腿进入自己的 0%（右腿此时在 50% 左右）。控制器对两条腿各算一套相位。' },
    { name: '左腿后蹬 · 右腿前摆', from: 0.54, to: 0.8, color: '#ffb703', active: ['driveR', 'driveL', 'frameR', 'frameL'], flows: ['cmdR', 'cmdL'],
      view: { yaw: -15, pitch: 6, zoom: 2.6, focus: [0, 84, 10] },
      text: '换过来：左侧伸髋、右侧屈髋，帮右腿把脚摆到前面。屈髋助力比伸髋小一半左右（这里按 60 kg 体重示意：伸髋约 8 Nm，屈髋约 4 Nm）。' },
    { name: '电池 · 安全上限', from: 0.8, to: 1, color: C.slate, active: ['battery', 'board', 'actR'],
      view: { yaw: -150, pitch: 12, zoom: 2.6, focus: [-12, 96, 0] },
      text: 'GEMS-H 备案的上限是 12 Nm ± 15%，由治疗师在平板上按人调节助力大小。出故障时切断电机扭矩，装置变成被动穿戴。连续步行约 2 小时（增益 7）。' }
  ];

  return {
    manifest: MANIFEST,
    fig: '图 08',
    title: '助力行走外骨骼：在髋关节上“推一把、带一下”',
    subtitle: '髋关节型 · 两侧电机辅助屈髋和伸髋 · 参考三星 GEMS-H：2.1 kg、最大 12 Nm、约 2 小时续航',
    view: { yaw: -30, pitch: 8, zoom: 1.35, focus: [0, 72, 0] },
    xray: true, cycle: 9, labels: 'step',
    hint: '拖动旋转 · 点部件看说明 · X 切换透视（看骨头和驱动器里面）',
    closeups: [
      { name: 'actuator', focus: [0, 92, ACT_Z], step: 2, zoom: 4, yaw: -10, pitch: 6 },
      { name: 'hub-cuff', focus: [4, 80, 12], step: 5, zoom: 3, yaw: 0, pitch: 4 },
      { name: 'pack', focus: [-15, 98, 0], step: 6, zoom: 3.5, yaw: -150, pitch: 12 },
      { name: 'left-side', focus: [0, 88, -ACT_Z], step: 2, zoom: 3, yaw: 180, pitch: 8 },
      { name: 'feet', focus: [0, 4, 0], step: 1, zoom: 2.5, yaw: -80, pitch: 4 }
    ],
    parts, flows, steps,
    animate(u, api) {
      api.set('torso', { pos: [0, pelvisY(u), 0] });
      api.set('dashes', { pos: [-M.frac(u * BELT_V / 20) * 20, 0, 0] });
      for (const [k, du, s] of [['R', 0, 1], ['L', 0.5, -1]]) {
        const x = M.frac(u + du), L = leg(x), T = torque(x), h = L.h;
        api.set('thigh' + k, { rot: [0, 0, h] });
        api.set('shank' + k, { rot: [0, 0, -L.k] });
        api.set('foot' + k, { rot: [0, 0, L.a] });
        api.set('arm' + k, { rot: [0, 0, -0.9 * (hip(M.frac(u + du)) - 10)] });
        api.set('carrier' + k, { rot: [0, 0, h] });
        api.set('sun' + k, { rot: [0, 0, h * RATIO] });
        api.set('rotor' + k, { rot: [0, 0, h * RATIO] });
        for (let i = 0; i < 3; i++) api.set(`planet${k}${i}`, { rot: [0, 0, -h * (RATIO - 1) * SUN / PLA] });
        const a = Math.min(1, Math.abs(T) / EXT_PK);
        api.set('arc' + k, { scale: [1, T >= 0 ? 1 : -1, 1], opacity: a, visible: a > 0.04 });
      }
    },
    readout(u) {
      const f = (k, du) => { const x = M.frac(u + du), T = torque(x); return `${k} ${Math.round(x * 100)}% · 髋 ${hip(x) >= 0 ? '+' : ''}${hip(x).toFixed(0)}° · ${Math.abs(T) < 0.3 ? '不出力' : (T > 0 ? '屈髋 ' : '伸髋 ') + Math.abs(T).toFixed(1) + ' Nm'}`; };
      return `${f('右腿', 0)}　｜　${f('左腿', 0.5)}`;
    },
    caption: '依据：产品备案（三星 GEMS-H，FDA 510(k) K213452：2.1 kg、两侧髋部电机、最大 12 Nm ± 15%、21.6 V / 2950 mAh 约 2 小时、用于治疗师监督下的中风后步行训练）；' +
      '研究论文（Frontiers in Bioengineering 2024：伸髋助力峰值约在步态 10%、屈髋约在 60%）。模拟假设：使用者 60 kg、关节角度曲线、驱动器内部的电机 + 8:1 行星减速都是示意；动画放慢约 8 倍。' +
      '是否适合使用、助力调多大，请听康复医生和治疗师的。'
  };
};
