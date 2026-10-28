import {prepareScene} from "../semantic.js?v=ce520a6dc274";
const EXTRA_CSS="\n      .sk{--cn:system-ui,-apple-system,\"PingFang SC\",\"Microsoft YaHei\",sans-serif;--hand:\"AgingHand\",\"AgingCaveat\",\"KaiTi\",cursive;color:#242936;background:#fff;padding:20px 16px;max-width:1200px}\n      .sk-title,.sk-sub,.sk-label,.sk-part-title{font-family:var(--hand)!important}\n      .sk-sub{font-size:15px;line-height:1.65;color:#59616b}\n      .sk-title{font-size:30px;line-height:1.3}.sk-fig{display:none}\n      .sk-stage{height:clamp(420px,52vw,620px);border:1px solid #9aa7af;border-radius:12px;background:#fff}\n      .sk-btn,.sk-step,.sk-pbtn{border:1px solid #65717b;border-radius:5px;box-shadow:2px 2px 0 #394552;font:14px/1.5 var(--cn);min-height:44px}\n      .sk button:disabled{opacity:.45;box-shadow:none;cursor:not-allowed}.sk button:focus-visible,.sk [role=button]:focus-visible,.sk input:focus-visible{outline:3px solid #284f73;outline-offset:3px}\n      .sk-all-status{font:14px/1.6 var(--cn);margin:8px 0;min-height:1.6em;color:#43515d}.sk-all{font-weight:700;background:#f5f1d8;flex-shrink:0}.sk-all.on{background:#e6edd8}\n      .sk-readout{font:14px/1.4 ui-monospace,monospace;font-variant-numeric:tabular-nums}\n      .sk-caption{font:15px/1.75 var(--cn)}.sk-step.on,.sk-pbtn.on{box-shadow:2px 2px 0 #394552,inset 0 0 0 1px #394552}\n      .sk-part-name{display:none}.sk-part-panel{display:none}.sk.pins .sk-part-panel{display:block;margin:14px 0 20px}\n      .sk-part-title{font-size:16px;margin:0 0 8px}.sk.pins .sk-part-panel .sk-legend{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;columns:auto;margin:0;font-size:14px}\n      .sk-part-panel .sk-legend li{min-height:44px;padding:7px 5px;border:1px solid #d2d8da;white-space:normal;line-height:1.5}\n      .sk.compact .sk-part-name{display:block;position:absolute;left:8px;right:8px;top:8px;z-index:2;pointer-events:none;background:#fff9e9;border:1px solid #bbb49d;border-radius:5px;padding:7px 9px;font-size:14px;line-height:1.4}\n      .sk.compact .sk-stage{height:460px}.sk.compact .sk-readout{font-size:12px}.sk-hint{font:12px var(--cn)}\n      .nursing-explosion,.aging-explosion{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:16px 0 8px}.nursing-explosion input,.aging-explosion input{flex:1;min-width:80px;accent-color:#42697b}.nursing-explosion button,.aging-explosion button{background:#edf3f7;font-weight:650}.nursing-exp-note,.aging-explosion-note{font:12px/1.6 var(--cn);color:#58636a}\n      @media(prefers-reduced-motion:reduce){.sk *{animation:none!important;transition:none!important}}\n    ";
const localRoot={};

/*! Sketch3D · 白底彩色手绘 3D 解剖图引擎 · 零依赖 · MIT
 *  三件事：拖动旋转（真 3D）、透视（外壳变成半透明铅笔线）、标注（部件工作时连同标签一起亮起）
 *  用法：Sketch3D.mount('#app', (S, M) => ({ ...scene }))   详见 references/scene-api.md
 */
(function (root) {
  'use strict';
  const D2R = Math.PI / 180, TAU = Math.PI * 2;

  /* ───────────── 向量与仿射矩阵 ───────────── */
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const scl = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const vlen = (a) => Math.hypot(a[0], a[1], a[2]);
  const norm = (a) => { const l = vlen(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

  // 仿射：[r00,r01,r02, r10,r11,r12, r20,r21,r22, tx,ty,tz]，p' = R·p + t
  const I = () => [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
  function mul(A, B) {
    const r = new Array(12);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
      r[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j];
    for (let i = 0; i < 3; i++) r[9 + i] = A[i * 3] * B[9] + A[i * 3 + 1] * B[10] + A[i * 3 + 2] * B[11] + A[9 + i];
    return r;
  }
  const Tm = (t) => [1, 0, 0, 0, 1, 0, 0, 0, 1, t[0] || 0, t[1] || 0, t[2] || 0];
  const Rx = (a) => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c, 0, 0, 0]; };
  const Ry = (a) => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c, 0, 0, 0]; };
  const Rz = (a) => { const c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, s, c, 0, 0, 0, 1, 0, 0, 0]; };
  const Re = (r) => (r ? mul(Rz((r[2] || 0) * D2R), mul(Ry((r[1] || 0) * D2R), Rx((r[0] || 0) * D2R))) : I());
  const Sm = (s) => { if (s == null) return I(); const v = typeof s === 'number' ? [s, s, s] : s; return [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2], 0, 0, 0]; };
  const ap = (M, p) => [M[0] * p[0] + M[1] * p[1] + M[2] * p[2] + M[9], M[3] * p[0] + M[4] * p[1] + M[5] * p[2] + M[10], M[6] * p[0] + M[7] * p[1] + M[8] * p[2] + M[11]];
  const apR = (M, p) => [M[0] * p[0] + M[1] * p[1] + M[2] * p[2], M[3] * p[0] + M[4] * p[1] + M[5] * p[2], M[6] * p[0] + M[7] * p[1] + M[8] * p[2]];
  const AXIS = { y: I(), x: Rz(-Math.PI / 2), z: Rx(Math.PI / 2) };     // 以 y 为轴建，再转到 x / z
  const PAXIS = { z: I(), y: Rx(-Math.PI / 2), x: Ry(Math.PI / 2) };    // 拉伸体以 z 为轴建

  /* ───────────── 稳定随机（手绘抖动不能每帧乱跳） ───────────── */
  function hash(a, b, c) {
    let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 1274126177)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  /* ───────────── 颜色 ───────────── */
  const PAL = {
    ink: '#23233a', red: '#ff6b6b', orange: '#ff9f43', yellow: '#ffd166', green: '#3ddc97', teal: '#2ec4b6',
    blue: '#4d96ff', sky: '#8ecae6', purple: '#9b5de5', pink: '#f15bb5', brown: '#c08552', gray: '#b8bfc9',
    slate: '#5c677d', steel: '#a9b4c2', cream: '#fff1c1', white: '#ffffff', fire: '#ff7b29', lime: '#b5e48c'
  };
  const ORDER = ['orange', 'blue', 'green', 'pink', 'yellow', 'purple', 'teal', 'red', 'sky', 'brown'];
  function rgb(c) {
    if (Array.isArray(c)) return c;
    let h = (PAL[c] || c || '#999').replace('#', '');
    if (h.length === 3) h = h.split('').map((x) => x + x).join('');
    const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const css = (c, a) => (a == null || a >= 1 ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.max(0, a).toFixed(3)})`);
  const WHITE = [255, 255, 255], DEEP = [52, 48, 96];

  /* ───────────── 网格构建 ───────────── */
  function newell(V, idx) {
    let x = 0, y = 0, z = 0;
    for (let k = 0; k < idx.length; k++) {
      const a = V[idx[k]], b = V[idx[(k + 1) % idx.length]];
      x += (a[1] - b[1]) * (a[2] + b[2]); y += (a[2] - b[2]) * (a[0] + b[0]); z += (a[0] - b[0]) * (a[1] + b[1]);
    }
    return [x, y, z];
  }
  function clean(idx) {
    const o = [];
    for (const i of idx) if (o[o.length - 1] !== i) o.push(i);
    while (o.length > 1 && o[0] === o[o.length - 1]) o.pop();
    return o;
  }
  class Builder {
    constructor() { this.v = []; this.f = []; this.map = new Map(); }
    vert(p) {
      const k = Math.round(p[0] * 1e4) + ',' + Math.round(p[1] * 1e4) + ',' + Math.round(p[2] * 1e4);
      let i = this.map.get(k);
      if (i === undefined) { i = this.v.length; this.v.push([p[0], p[1], p[2]]); this.map.set(k, i); }
      return i;
    }
    face(idx, hint, holes) {
      idx = clean(idx); if (idx.length < 3) return;
      holes = holes ? holes.map(clean).filter((h) => h.length >= 3) : null;
      if (hint) { const n = newell(this.v, idx); if (dot(n, hint) < 0) { idx.reverse(); if (holes) holes.forEach((h) => h.reverse()); } }
      this.f.push(holes && holes.length ? { i: idx, h: holes } : { i: idx });
    }
    done(M) { if (M) this.v = this.v.map((p) => ap(M, p)); return { v: this.v, f: this.f }; }
  }
  const segFor = (r, lo, hi) => Math.max(lo, Math.min(hi, Math.round(10 + r * 6)));

  /* ───────────── 形状库 S（全部以原点为中心/轴心） ───────────── */
  const S = {};
  S.box = function (w, h, d, o = {}) {
    const B = new Builder(), n = o.sub || 1, hw = w / 2, hh = h / 2, hd = d / 2;
    const grid = (O, U, V, hint) => {
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const p = (a, b) => B.vert(add(O, add(scl(U, a / n), scl(V, b / n))));
        B.face([p(i, j), p(i + 1, j), p(i + 1, j + 1), p(i, j + 1)], hint);
      }
    };
    grid([hw, -hh, hd], [0, 0, -d], [0, h, 0], [1, 0, 0]);
    grid([-hw, -hh, -hd], [0, 0, d], [0, h, 0], [-1, 0, 0]);
    grid([-hw, hh, hd], [w, 0, 0], [0, 0, -d], [0, 1, 0]);
    grid([-hw, -hh, -hd], [w, 0, 0], [0, 0, d], [0, -1, 0]);
    grid([-hw, -hh, hd], [w, 0, 0], [0, h, 0], [0, 0, 1]);
    grid([hw, -hh, -hd], [-w, 0, 0], [0, h, 0], [0, 0, -1]);
    return B.done();
  };
  S.cyl = function (r, h, o = {}) {
    const B = new Builder(), n = o.seg || segFor(r, 14, 40), r2 = o.r2 == null ? r : o.r2, y0 = -h / 2, y1 = h / 2;
    const ang = (k) => (k / n) * TAU;
    const ring = (rad, y) => Array.from({ length: n }, (_, k) => B.vert([rad * Math.cos(ang(k)), y, -rad * Math.sin(ang(k))]));
    const rad = (k) => { const a = ang(k + 0.5); return [Math.cos(a), 0, -Math.sin(a)]; };
    const b = ring(r, y0), t = ring(r2, y1);
    for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; B.face([b[k], b[k1], t[k1], t[k]], rad(k)); }
    if (o.inner != null) {
      const ri2 = o.inner2 == null ? o.inner : o.inner2, bi = ring(o.inner, y0), ti = ring(ri2, y1);
      for (let k = 0; k < n; k++) {
        const k1 = (k + 1) % n;
        B.face([bi[k], bi[k1], ti[k1], ti[k]], scl(rad(k), -1));
        B.face([t[k], t[k1], ti[k1], ti[k]], [0, 1, 0]);
        B.face([b[k], b[k1], bi[k1], bi[k]], [0, -1, 0]);
      }
    } else {
      B.face(t.slice(), [0, 1, 0]);
      B.face(b.slice(), [0, -1, 0]);
    }
    return B.done(AXIS[o.axis || 'y']);
  };
  S.cone = (r, h, o = {}) => S.cyl(r, h, Object.assign({}, o, { r2: o.r2 || 0 }));
  S.sphere = function (r, o = {}) {
    const B = new Builder(), n = o.seg || segFor(r, 14, 32), m = o.rings || Math.max(7, Math.round(n / 2));
    const P = (j, k) => { const ph = (j / m) * Math.PI, th = (k / n) * TAU, rho = r * Math.sin(ph); return [rho * Math.cos(th), r * Math.cos(ph), -rho * Math.sin(th)]; };
    for (let j = 0; j < m; j++) for (let k = 0; k < n; k++) {
      const a = P(j + 1, k), b = P(j + 1, k + 1), c = P(j, k + 1), d = P(j, k);
      B.face([B.vert(a), B.vert(b), B.vert(c), B.vert(d)], norm(add(add(a, b), add(c, d))));
    }
    return B.done();
  };
  S.torus = function (R, r, o = {}) {
    const B = new Builder(), n = o.seg || segFor(R, 18, 48), m = o.tseg || 10;
    const C = (k) => { const a = (k / n) * TAU; return [R * Math.cos(a), 0, -R * Math.sin(a)]; };
    const P = (k, j) => { const a = (k / n) * TAU, ps = (j / m) * TAU, rd = [Math.cos(a), 0, -Math.sin(a)]; return add(C(k), add(scl(rd, r * Math.cos(ps)), [0, r * Math.sin(ps), 0])); };
    for (let k = 0; k < n; k++) for (let j = 0; j < m; j++) {
      const q = [P(k, j), P(k + 1, j), P(k + 1, j + 1), P(k, j + 1)];
      const mid = scl(add(add(q[0], q[1]), add(q[2], q[3])), 0.25), cen = scl(add(C(k), C(k + 1)), 0.5);
      B.face(q.map((p) => B.vert(p)), sub(mid, cen));
    }
    return B.done(AXIS[o.axis || 'y']);
  };
  // profile: [[r, y], …] 从底部沿外侧走到顶部（逆时针绕过材料）
  S.lathe = function (profile, o = {}) {
    const B = new Builder(), n = o.seg || 28;
    const ring = (r, y) => Array.from({ length: n }, (_, k) => { const a = (k / n) * TAU; return B.vert([r * Math.cos(a), y, -r * Math.sin(a)]); });
    const rings = profile.map(([r, y]) => ring(r, y));
    for (let i = 0; i < profile.length - 1; i++) {
      const [r0, y0] = profile[i], [r1, y1] = profile[i + 1], dr = r1 - r0, dy = y1 - y0;
      if (Math.abs(dr) + Math.abs(dy) < 1e-9) continue;
      for (let k = 0; k < n; k++) {
        const k1 = (k + 1) % n, a = ((k + 0.5) / n) * TAU, rd = [Math.cos(a), 0, -Math.sin(a)];
        B.face([rings[i][k], rings[i][k1], rings[i + 1][k1], rings[i + 1][k]], add(scl(rd, dy), [0, -dr, 0]));
      }
    }
    if (profile[0][0] > 1e-6) B.face(rings[0].slice(), [0, -1, 0]);
    if (profile[profile.length - 1][0] > 1e-6) B.face(rings[rings.length - 1].slice(), [0, 1, 0]);
    return B.done(AXIS[o.axis || 'y']);
  };
  const area2 = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
  // outline: 2D 点 [[x, y], …]（XY 平面），沿 z 拉伸 depth；o.holes 挖孔；o.axis 改拉伸方向
  S.prism = function (outline, depth, o = {}) {
    const B = new Builder(), z0 = -depth / 2, z1 = depth / 2;
    const outer = area2(outline) < 0 ? outline.slice().reverse() : outline.slice();
    const holes = (o.holes || []).map((h) => (area2(h) > 0 ? h.slice().reverse() : h.slice()));
    const loops = [outer, ...holes];
    const F = loops.map((L) => L.map(([x, y]) => B.vert([x, y, z1])));
    const K = loops.map((L) => L.map(([x, y]) => B.vert([x, y, z0])));
    B.face(F[0], [0, 0, 1], F.slice(1));
    B.face(K[0].slice(), [0, 0, -1], K.slice(1).map((h) => h.slice()));
    loops.forEach((L, li) => {
      for (let k = 0; k < L.length; k++) {
        const k1 = (k + 1) % L.length, ex = L[k1][0] - L[k][0], ey = L[k1][1] - L[k][1];
        B.face([K[li][k], K[li][k1], F[li][k1], F[li][k]], [ey, -ex, 0]);
      }
    });
    return B.done(PAXIS[o.axis || 'z']);
  };
  S.gear = function (teeth, r, depth, o = {}) {
    const root = r - (o.tooth || r * 0.14), p = TAU / teeth, pts = [];
    for (let k = 0; k < teeth; k++) {
      const a = k * p;
      [[0, root], [0.2, r], [0.45, r], [0.65, root], [0.82, root]].forEach(([f, rr]) => pts.push([rr * Math.cos(a + f * p), rr * Math.sin(a + f * p)]));
    }
    const holes = o.hole ? [S.circle2(o.hole, 20)] : [];
    return S.prism(pts, depth, { holes, axis: o.axis || 'z' });
  };
  // 管子：沿 3D 折线扫出圆截面（平行移动标架，闭合时把扭转均摊）
  S.tube = function (path, r, o = {}) {
    const B = new Builder(), n = o.seg || 10, closed = !!o.closed, N = path.length;
    const at = (i) => path[closed ? (i + N) % N : Math.max(0, Math.min(N - 1, i))];
    const Tg = path.map((_, i) => norm(sub(at(i + 1), at(i - 1))));
    let ref = Math.abs(Tg[0][1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const Nn = [norm(cross(cross(Tg[0], ref), Tg[0]))];
    for (let i = 1; i < N; i++) { const p = Nn[i - 1], t = Tg[i]; Nn.push(norm(sub(p, scl(t, dot(p, t))))); }
    if (closed) {
      const a = Nn[N - 1], b = Nn[0], t = Tg[0];
      const tw = Math.atan2(dot(cross(a, b), t), dot(a, b));
      for (let i = 0; i < N; i++) {
        const ang = (tw * i) / N, t2 = Tg[i], nn = Nn[i], bb = cross(t2, nn);
        Nn[i] = norm(add(scl(nn, Math.cos(ang)), scl(bb, Math.sin(ang))));
      }
    }
    const rings = path.map((p, i) => {
      const nn = Nn[i], bb = cross(Tg[i], nn), rr = typeof r === 'function' ? r(i / (N - 1)) : r;
      return Array.from({ length: n }, (_, k) => { const a = (k / n) * TAU; return B.vert(add(p, add(scl(nn, rr * Math.cos(a)), scl(bb, rr * Math.sin(a))))); });
    });
    const segs = closed ? N : N - 1;
    for (let i = 0; i < segs; i++) {
      const i1 = (i + 1) % N, c = scl(add(path[i], path[i1]), 0.5);
      for (let k = 0; k < n; k++) {
        const k1 = (k + 1) % n, q = [rings[i][k], rings[i][k1], rings[i1][k1], rings[i1][k]];
        const mid = scl(q.reduce((s, idx) => add(s, B.v[idx]), [0, 0, 0]), 0.25);
        B.face(q, sub(mid, c));
      }
    }
    if (!closed && o.caps !== false) { B.face(rings[0].slice(), scl(Tg[0], -1)); B.face(rings[N - 1].slice(), Tg[N - 1]); }
    const out = B.done();
    if (!closed) out.ends = [path[0].slice(), path[N - 1].slice()];   // 两个接口（核对管线用）
    return out;
  };
  // 放样：rings 是若干条点数相同的 3D 折线（开口弧或闭合环），相邻两条之间连成面。做脚、手、壳体等有机形体。
  S.loft = function (rings, o = {}) {
    const B = new Builder(), R = rings.length, n = rings[0].length, closed = !!o.closed;
    const cen = rings.map((r) => scl(r.reduce((s, p) => add(s, p), [0, 0, 0]), 1 / r.length));
    const idx = rings.map((r) => r.map((p) => B.vert(p)));
    for (let i = 0; i < R - 1; i++) {
      const segs = closed ? n : n - 1, c = scl(add(cen[i], cen[i + 1]), 0.5);
      for (let k = 0; k < segs; k++) {
        const k1 = (k + 1) % n;
        const mid = scl(add(add(rings[i][k], rings[i][k1]), add(rings[i + 1][k1], rings[i + 1][k])), 0.25);
        B.face([idx[i][k], idx[i][k1], idx[i + 1][k1], idx[i + 1][k]], sub(mid, c));
      }
    }
    if (o.capStart) B.face(idx[0].slice(), sub(cen[0], cen[1]));
    if (o.capEnd) B.face(idx[R - 1].slice(), sub(cen[R - 1], cen[R - 2]));
    return B.done();
  };
  // 弹簧：从原点沿 +y（或 axis）长出 len，便于用 scale 压缩
  S.spring = function (R, wire, turns, len, o = {}) {
    const k = Math.max(8, Math.round(turns * 14)), pts = [];
    for (let i = 0; i <= k; i++) { const t = i / k, a = t * turns * TAU; pts.push([R * Math.cos(a), t * len, -R * Math.sin(a)]); }
    const m = S.tube(pts, wire, { seg: o.seg || 6 });
    return { v: m.v.map((p) => ap(AXIS[o.axis || 'y'], p)), f: m.f };
  };
  S.xf = function (mesh, o = {}) {
    const M = mul(Tm(o.at || [0, 0, 0]), mul(Re(o.rot), Sm(o.scale)));
    const out = { v: mesh.v.map((p) => ap(M, p)), f: mesh.f.map((f) => (f.h ? { i: f.i.slice(), h: f.h.map((h) => h.slice()) } : { i: f.i.slice() })) };
    if (mesh.ends) out.ends = mesh.ends.map((p) => ap(M, p));
    return out;
  };
  S.merge = function (...meshes) {
    const v = [], f = [];
    for (const m of meshes.flat()) {
      const off = v.length; v.push(...m.v.map((p) => p.slice()));
      for (const fc of m.f) f.push(fc.h ? { i: fc.i.map((i) => i + off), h: fc.h.map((h) => h.map((i) => i + off)) } : { i: fc.i.map((i) => i + off) });
    }
    return { v, f };
  };
  S.circle2 = (r, curSeg = 24, cx = 0, cy = 0) => Array.from({ length: curSeg }, (_, k) => [cx + r * Math.cos((k / curSeg) * TAU), cy + r * Math.sin((k / curSeg) * TAU)]);
  S.rrect = function (w, h, r, curSeg = 4) {
    r = Math.min(r, w / 2, h / 2); const pts = [], cs = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 90], [-w / 2 + r, -h / 2 + r, 180], [w / 2 - r, -h / 2 + r, 270]];
    for (const [cx, cy, a0] of cs) for (let i = 0; i <= curSeg; i++) { const a = (a0 + (90 * i) / curSeg) * D2R; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return pts;
  };
  // Catmull-Rom 平滑折线
  S.curve = function (pts, per = 8, closed = false) {
    const out = [], N = pts.length, g = (i) => pts[closed ? (i + N) % N : Math.max(0, Math.min(N - 1, i))];
    const segs = closed ? N : N - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
      for (let s = 0; s < per; s++) {
        const t = s / per, t2 = t * t, t3 = t2 * t;
        out.push([0, 1, 2].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
      }
    }
    if (!closed) out.push(pts[N - 1].slice());
    return out;
  };

  /* ───────────── 数学助手 M（给场景用） ───────────── */
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const M = {
    PAL, D2R, TAU, clamp, smooth, add, sub, scl, dot, cross, norm, len: vlen,
    deg: (r) => r / D2R, rad: (d) => d * D2R, lerp: (a, b, t) => a + (b - a) * t,
    frac: (x) => x - Math.floor(x),
    pulse: (x, a, b, edge = 0.04) => smooth(a - edge, a + edge, x) * (1 - smooth(b - edge, b + edge, x)),
    pathLength(p, closed) { let s = 0; for (let i = 1; i < p.length; i++) s += vlen(sub(p[i], p[i - 1])); if (closed) s += vlen(sub(p[0], p[p.length - 1])); return s; },
    hull2D(points) {
      const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
      const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
      const lo = [], up = [];
      for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
      for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
      return lo.slice(0, -1).concat(up.slice(0, -1));
    }
  };

  /* ───────────── 样式（注入一次） ───────────── */
  const CSS = `
.sk{--ink:#23233a;--muted:#6b6f85;--paper:#fff;--hand:"Caveat","ZCOOL KuaiLe","Kaiti SC","STKaiti","KaiTi",cursive;--cn:"ZCOOL KuaiLe","Kaiti SC","STKaiti","KaiTi","Caveat",cursive;
  color:var(--ink);background:var(--paper);font-family:var(--cn);max-width:1120px;margin:0 auto;padding:18px 16px 28px;box-sizing:border-box;color-scheme:light}
.sk *{box-sizing:border-box}
.sk [hidden]{display:none!important}
.sk-head{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin:0 4px 10px}
.sk-fig{font-family:var(--hand);font-size:17px;padding:1px 10px;border:1.5px solid var(--ink);border-radius:14px 10px 15px 9px/10px 15px 9px 14px;transform:rotate(-2deg);background:#fff3b0}
.sk-title{font-family:var(--hand);font-size:clamp(26px,4vw,38px);margin:0;line-height:1.1;font-weight:700}
.sk-sub{margin:0;color:var(--muted);font-size:15px;flex-basis:100%}
.sk-stage{position:relative;width:100%;height:clamp(380px,60vw,640px);border:2px solid var(--ink);border-radius:22px 16px 26px 14px/16px 26px 14px 22px;overflow:hidden;background:#fff;outline:none;touch-action:none}
.sk-stage:focus-visible{box-shadow:0 0 0 4px #ffd16699}
.sk-canvas{position:absolute;inset:0;width:100%;height:100%;cursor:grab;display:block}
.sk-stage.drag .sk-canvas{cursor:grabbing}
.sk-labels{position:absolute;inset:0;pointer-events:none}
.sk-label{position:absolute;left:0;top:0;pointer-events:auto;cursor:pointer;white-space:nowrap;font-size:15px;line-height:1;padding:5px 10px 5px 8px;
  border:1.5px solid transparent;border-radius:12px 15px 11px 16px/15px 11px 16px 12px;background:rgba(255,255,255,.88);display:flex;align-items:center;gap:6px;
  transition:background .25s,box-shadow .25s,opacity .3s,border-color .25s,font-weight .25s;will-change:transform}
.sk-label .sk-sw{width:10px;height:10px;border-radius:50% 45% 55% 50%;background:var(--c);border:1.5px solid var(--ink);flex:none}
.sk-label .sk-no{display:none}
.sk-label.dim{opacity:.5}
.sk-label.on,.sk-label.hov{background:var(--tint);border-color:var(--ink);box-shadow:0 0 0 4px var(--glow),2px 2px 0 var(--ink);font-weight:700;opacity:1}
.sk-label.off{opacity:0;pointer-events:none}
.sk.pins .sk-label{padding:0;width:22px;height:22px;justify-content:center;border-radius:50%;border-color:var(--ink);background:#fff;font-family:var(--hand);font-size:14px}
.sk.pins .sk-label span,.sk.pins .sk-label .sk-sw{display:none}
.sk.pins .sk-label .sk-no{display:block}
.sk-hint{position:absolute;left:12px;bottom:10px;font-size:13px;color:var(--muted);background:rgba(255,255,255,.85);padding:2px 6px;border-radius:8px;pointer-events:none}
.sk-readout{position:absolute;right:12px;bottom:9px;max-width:calc(100% - 24px);text-align:right;font-family:var(--hand);font-size:18px;line-height:1.25;background:rgba(255,255,255,.9);padding:1px 8px;border-radius:9px;pointer-events:none}
.sk.compact .sk-readout{font-size:14px;left:10px;right:10px;text-align:center;margin:0 auto;width:fit-content}
.sk-tip{position:absolute;pointer-events:none;max-width:250px;background:#fffbe6;border:1.5px solid var(--ink);border-radius:12px 9px 14px 10px;padding:7px 11px;font-size:14px;line-height:1.5;box-shadow:3px 3px 0 rgba(35,35,58,.18);z-index:3}
.sk-tip b{display:block;font-size:15px;margin-bottom:2px}
.sk-timeline{margin:14px 2px 0}
.sk-steps{display:flex;gap:8px;flex-wrap:wrap}
.sk-step{font:inherit;font-size:15px;color:var(--ink);background:#fff;border:1.5px solid var(--ink);border-radius:14px 10px 15px 9px/10px 15px 9px 14px;padding:4px 12px;cursor:pointer;transition:transform .2s,background .2s,box-shadow .2s}
.sk-step b{font-family:var(--hand);margin-right:4px}
.sk-step.on{background:var(--tint);box-shadow:2px 2px 0 var(--ink),0 0 0 4px var(--glow);transform:rotate(-1.5deg) scale(1.05)}
.sk-bar{position:relative;height:14px;margin:10px 0 0;border:1.5px solid var(--ink);border-radius:9px 7px 10px 6px;overflow:hidden;cursor:pointer;display:flex;touch-action:none}
.sk-seg{height:100%;opacity:.55;border-right:1.5px dashed rgba(35,35,58,.45)}
.sk-seg:last-child{border-right:0}
.sk-knob{position:absolute;top:-1px;bottom:-1px;width:3px;background:var(--ink);border-radius:2px;pointer-events:none}
.sk-caption{margin:12px 4px 0;font-size:17px;line-height:1.65;min-height:3.3em}
.sk-caption b{margin-right:8px;padding:0 6px;border-radius:6px;background:var(--tint,#fff3b0)}
.sk-controls{display:flex;gap:8px;flex-wrap:wrap;margin:12px 2px 0}
.sk-btn{font:inherit;font-size:15px;color:var(--ink);padding:4px 12px;border:1.5px solid var(--ink);border-radius:255px 15px 225px 15px/15px 225px 15px 255px;background:#fff;box-shadow:2px 2px 0 var(--ink);cursor:pointer}
.sk-btn:active{transform:translate(1px,1px);box-shadow:1px 1px 0 var(--ink)}
.sk-btn[aria-pressed="true"]{background:#fff3b0}
.sk-btn kbd{font-family:var(--hand);font-size:13px;opacity:.6;margin-left:4px}
.sk-legend{display:none;margin:12px 4px 0;padding:0;list-style:none;columns:2;column-gap:14px;font-size:15px}
.sk.pins .sk-legend{display:block}
.sk-legend li{display:flex;gap:6px;align-items:center;padding:3px 6px;border-radius:9px;break-inside:avoid;cursor:pointer;transition:background .25s}
.sk-legend li i{font-style:normal;font-family:var(--hand);width:20px;height:20px;border:1.5px solid var(--ink);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:13px;flex:none;background:var(--c)}
.sk-legend li.on{background:var(--tint);font-weight:700}
.sk-pbtns{display:flex;gap:10px;flex-wrap:wrap;margin:14px 2px 0}
.sk-pbtn{font:inherit;font-size:17px;color:var(--ink);background:#fff;border:2px solid var(--ink);border-radius:18px 12px 20px 11px/12px 20px 11px 18px;padding:8px 16px 8px 12px;cursor:pointer;
  box-shadow:3px 3px 0 var(--ink);display:inline-flex;align-items:center;gap:8px;transition:transform .15s,background .2s}
.sk-pbtn b{font-family:var(--hand);font-size:15px;width:24px;height:24px;border-radius:50%;border:1.5px solid var(--ink);display:inline-flex;align-items:center;justify-content:center;background:var(--tint)}
.sk-pbtn:active{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--ink)}
.sk-pbtn.next{background:var(--tint);animation:sk-pulse 1.4s ease-in-out infinite}
.sk-pbtn.on{background:var(--tint);box-shadow:3px 3px 0 var(--ink),0 0 0 5px var(--glow)}
.sk-pbtn.done::after{content:"✓";font-family:var(--hand);font-size:18px;color:#2a9d6f;margin-left:2px}
.sk-pbtn.shake{animation:sk-shake .45s}
@keyframes sk-pulse{0%,100%{box-shadow:3px 3px 0 var(--ink),0 0 0 0 var(--glow)}50%{box-shadow:3px 3px 0 var(--ink),0 0 0 7px var(--glow)}}
@keyframes sk-shake{0%,100%{transform:none}20%{transform:translateX(-6px) rotate(-2deg)}40%{transform:translateX(6px) rotate(2deg)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
.sk-toast{position:absolute;left:50%;top:14px;transform:translateX(-50%);max-width:calc(100% - 32px);background:#fff3b0;border:2px solid var(--ink);border-radius:14px 10px 16px 9px;padding:8px 14px;font-size:16px;box-shadow:3px 3px 0 var(--ink);z-index:4;pointer-events:none}
.sk-audit{margin:0 4px 10px;padding:8px 12px;border:1.5px dashed var(--ink);border-radius:12px;font-size:14px;line-height:1.6;background:#f3fff7}
.sk-audit.bad{background:#fff0f0}
.sk-audit b{margin-right:6px}
@media (prefers-reduced-motion:reduce){.sk-pbtn.next,.sk-pbtn.shake{animation:none}}
@media (max-width:640px){.sk-hint{display:none}.sk-caption{font-size:16px}}
`;
  function injectCSS() {
    if (document.getElementById('sk-css')) return;
    const s = document.createElement('style'); s.id = 'sk-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  /* ───────────── 主程序 ───────────── */
  function mount(target, sceneIn) {
    let destroyed=false,viewHold=false;const lifecycle=new AbortController();
    const host = typeof target === 'string' ? document.querySelector(target) : target;
    const scene = typeof sceneIn === 'function' ? sceneIn(S, M) : sceneIn;
    const explodeVectors={"liftH":[0,0,-2],"liftF":[0,0,2],"backAct":[0,-1.2,-1.5],"kneeAct":[0,-1.2,1.5],"cboxIn":[0,-1.5,0]};
    scene.parts.forEach(p=>{if(explodeVectors[p.id])p.explode=explodeVectors[p.id];if(p.note)p.note="模型示意："+p.note+"（内部结构与参数未经实物核验。）";});
    const style = Object.assign({ line: 1.9, rough: 1.25, hatch: true, crease: 38, dim: 0.42, ink: PAL.ink }, scene.style || {});
    const INK = rgb(style.ink);
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* —— 零件清单（Truth first）：scene.manifest 里每个零件的 on / drive / connects 合并进部件 —— */
    const MAN = scene.manifest || {}, manMiss = [];
    for (const id in MAN) { const p = scene.parts.find((q) => q.id === id); if (p) Object.assign(p, MAN[id]); else manMiss.push(id); }

    /* —— 部件预处理 —— */
    const parts = [], byId = {};
    scene.parts.forEach((p, idx) => {
      const mesh = p.mesh;
      const fn = mesh.f.map((f) => norm(newell(mesh.v, f.i)));
      const E = [], emap = new Map(), cosT = Math.cos((p.crease || style.crease) * D2R);
      mesh.f.forEach((f, fi) => {
        f.e = [];
        for (const L of [f.i, ...(f.h || [])]) for (let k = 0; k < L.length; k++) {
          const a = L[k], b = L[(k + 1) % L.length], lo = Math.min(a, b), hi = Math.max(a, b), key = lo * 1048576 + hi;
          let ei = emap.get(key);
          if (ei === undefined) { ei = E.length; E.push({ a: lo, b: hi, f: [] }); emap.set(key, ei); }
          if (E[ei].f[E[ei].f.length - 1] !== fi) E[ei].f.push(fi);
          f.e.push(ei);
        }
      });
      const vf = Array.from({ length: mesh.v.length }, () => []);
      mesh.f.forEach((f, fi) => { for (const L of [f.i, ...(f.h || [])]) for (const v of L) if (vf[v][vf[v].length - 1] !== fi) vf[v].push(fi); });
      const cd = new Uint8Array(mesh.v.length);
      for (const e of E) { e.crease = e.f.length !== 2 || dot(fn[e.f[0]], fn[e.f[1]]) < cosT; if (e.crease) { cd[e.a]++; cd[e.b]++; } }
      let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
      for (const v of mesh.v) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], v[c]); mx[c] = Math.max(mx[c], v[c]); }
      const base = rgb(p.color || ORDER[idx % ORDER.length]);
      const P = {
        def: p, id: p.id || 'p' + idx, idx, mesh, fn, E, cd, vf, seed: hash(idx + 1, 7, 3) * 1e6 | 0,
        role: p.role || 'part', group: p.group, label: p.label, note: p.note,
        anchor: p.anchor || scl(add(mn, mx), 0.5), center: scl(add(mn, mx), 0.5), rad: vlen(sub(mx, mn)) / 2,
        base, line: mixc(INK, mixc(base, DEEP, 0.55), 0.28),
        tones: (p.role === 'shell' ? [0.62, 0.38, 0.14] : [0.5, 0.12, -0.24]).map((k) => (k >= 0 ? mixc(base, WHITE, k) : mixc(base, DEEP, -k))),
        hot: [mixc(base, WHITE, 0.32), base, mixc(base, DEEP, 0.12)],
        off: [mixc(base, WHITE, 0.5 + 0.5 * style.dim), mixc(base, WHITE, 0.12 + 0.88 * style.dim * 0.92), mixc(mixc(base, DEEP, 0.24), WHITE, style.dim)],
        fill: [(hash(idx, 11, 1) - 0.5) * 2.6, (hash(idx, 12, 1) - 0.5) * 2.2],
        pose: null, W: null, vis: null, cam: null, sx: null, sy: null, glowA: 0
      };
      parts.push(P); byId[P.id] = P;
    });
    parts.forEach((P) => { P.parent = P.def.parent ? byId[P.def.parent] : null; });
    const order = []; const seen = new Set();
    const visit = (P) => { if (seen.has(P)) return; if (P.parent) visit(P.parent); seen.add(P); order.push(P); };
    parts.forEach(visit);
    const resolve = (ids) => { const out = new Set(); (ids || []).forEach((id) => parts.forEach((P) => { if (P.id === id || P.group === id) out.add(P); })); return out; };

    /* —— 步骤 / 流 —— */
    const steps = (scene.steps || []).map((s, i, a) => Object.assign({}, s, {
      from: s.from != null ? s.from : i / a.length, to: s.to != null ? s.to : (i + 1) / a.length,
      c: rgb(s.color || ORDER[i % ORDER.length]), set: resolve(s.active)
    }));
    const flows = (scene.flows || []).map((f, i) => Object.assign({ count: 14, speed: 0.5, size: 0.12, spread: 0, role: 'inside', closed: false }, f, { c: rgb(f.color || 'sky'), cur: 0, idx: i }));
    const cycle = scene.cycle || 6;

    /* —— DOM —— */
    host.innerHTML = '';
    const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
    const wrap = el('div', 'sk'); host.appendChild(wrap);const sheet=document.createElement('style');sheet.textContent=CSS+EXTRA_CSS;host.appendChild(sheet);
    const head = el('div', 'sk-head');
    head.appendChild(el('span', 'sk-fig', scene.fig || '图 1'));
    head.appendChild(el('h1', 'sk-title', scene.title || ''));
    if (scene.subtitle) head.appendChild(el('p', 'sk-sub', scene.subtitle));
    wrap.appendChild(head);
    const stage = el('div', 'sk-stage'); stage.tabIndex = 0; stage.setAttribute('role', 'application');
    stage.setAttribute('aria-label', (scene.title || '3D 图') + '：拖动旋转，X 透视，L 标注，空格暂停，左右键切换步骤');
    const cv = el('canvas', 'sk-canvas'); stage.appendChild(cv);
    const labelLayer = el('div', 'sk-labels'); stage.appendChild(labelLayer);
    const hint = el('div', 'sk-hint', scene.hint || '拖动旋转 · 滚轮缩放 · 点部件看说明 · 双击复位'); stage.appendChild(hint);
    const readout = el('div', 'sk-readout'); stage.appendChild(readout);
    const tip = el('div', 'sk-tip'); tip.hidden = true; stage.appendChild(tip);
    wrap.appendChild(stage);
    const ctx = cv.getContext('2d');

    // 标签
    const labeled = parts.filter((P) => P.label);
    labeled.forEach((P, i) => {
      const L = el('div', 'sk-label'); P.no = i + 1;
      L.style.setProperty('--c', css(P.base)); L.style.setProperty('--tint', css(mixc(P.base, WHITE, 0.62)));
      L.style.setProperty('--glow', css(P.base, 0.28));
      L.appendChild(el('b', 'sk-no', String(i + 1))); L.appendChild(el('i', 'sk-sw')); L.appendChild(el('span', '', P.label));
      L.addEventListener('pointerenter', () => { hoverPart = P; });
      L.addEventListener('pointerleave', () => { if (hoverPart === P) hoverPart = null; });
      L.addEventListener('click', (e) => { e.stopPropagation(); pinned = pinned === P ? null : P; showNote(P); });
      L.tabIndex=0;L.setAttribute('role','button');L.setAttribute('aria-label',P.label);L.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pinned=pinned===P?null:P;showNote(P);}});labelLayer.appendChild(L);
      P.L = { el: L, side: 0, y: null, x: null, w: 80, h: 26, ty: 0 };
    });

    // 时间轴
    let allPlayback=false,allFinished=false;const allButtons=[];const allStatus=el('p','sk-all-status');allStatus.setAttribute('role','status');allStatus.id='all-play-status';const addAll=row=>{const b=el('button','sk-step sk-all','全选');b.type='button';b.title='从第一步顺序播放全部步骤，完成后停止';b.setAttribute('aria-describedby','all-play-status');b.addEventListener('click',startAll);row.appendChild(b);allButtons.push(b);};
    let chips = [], knob = null;
    if (steps.length) {
      const tl = el('div', 'sk-timeline'), row = el('div', 'sk-steps'), bar = el('div', 'sk-bar');
      addAll(row);
      steps.forEach((s, i) => {
        const b = el('button', 'sk-step'); b.type = 'button';
        b.style.setProperty('--tint', css(mixc(s.c, WHITE, 0.55))); b.style.setProperty('--glow', css(s.c, 0.3));
        b.appendChild(el('b', '', String(i + 1))); b.appendChild(document.createTextNode(s.name || '步骤 ' + (i + 1)));
        b.addEventListener('click', () => { setU(s.from + 1e-4); });
        row.appendChild(b); chips.push(b);
        const curSeg = el('div', 'sk-seg'); curSeg.style.flex = String(s.to - s.from); curSeg.style.background = css(mixc(s.c, WHITE, 0.45)); bar.appendChild(curSeg);
      });
      knob = el('div', 'sk-knob'); bar.appendChild(knob);
      let scrub = false;
      const scrubTo = (e) => { const r = bar.getBoundingClientRect(); setU(clamp((e.clientX - r.left) / r.width, 0, 0.9999)); };
      bar.addEventListener('pointerdown', (e) => { scrub = true; bar.setPointerCapture(e.pointerId); wasPlaying = playing; playing = false; scrubTo(e); });
      bar.addEventListener('pointermove', (e) => { if (scrub) scrubTo(e); });
      bar.addEventListener('pointerup', () => { scrub = false; playing = wasPlaying; syncButtons(); });
      tl.appendChild(row); tl.appendChild(bar); wrap.appendChild(tl);
    }
    // 按钮模式：每个按钮播放一步（或连续几步），有先后顺序
    const stepIx = (k) => (typeof k === 'number' ? k - 1 : steps.findIndex((s) => s.name === k));
    const pbs = (scene.buttons || []).map((b, i) => {
      const ix = [].concat(b.steps || b.step || i + 1).map(stepIx).filter((j) => j >= 0 && steps[j]);
      const id = b.id || 'b' + (i + 1);
      return { id, i, label: b.label || (steps[ix[0]] && steps[ix[0]].name) || id, hint: b.hint,
        from: Math.min(...ix.map((j) => steps[j].from)), to: Math.max(...ix.map((j) => steps[j].to)), c: steps[ix[0]] ? steps[ix[0]].c : rgb('yellow'),
        needs: b.needs != null ? [].concat(b.needs) : scene.order === 'free' || i === 0 ? [] : [(scene.buttons[i - 1] && scene.buttons[i - 1].id) || 'b' + i] };
    });
    const pRow = el('div', 'sk-pbtns');
    addAll(pRow);
    pbs.forEach((b) => {
      const e = el('button', 'sk-pbtn'); e.type = 'button';
      e.style.setProperty('--tint', css(mixc(b.c, WHITE, 0.55))); e.style.setProperty('--glow', css(b.c, 0.35));
      e.appendChild(el('b', '', String(b.i + 1))); e.appendChild(document.createTextNode(b.label));
      e.addEventListener('click', () => press(b.id,reduce)); pRow.appendChild(e); b.el = e;
    });
    if (pbs.length) wrap.insertBefore(pRow, wrap.querySelector('.sk-timeline'));
    const toastEl = el('div', 'sk-toast'); toastEl.hidden = true; stage.appendChild(toastEl);
    let toastT = 0;
    function toast(msg) { toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { toastEl.hidden = true; }, 2600); }
    wrap.appendChild(allStatus);
    const caption = el('div', 'sk-caption'); caption.setAttribute('aria-live', 'polite'); wrap.appendChild(caption);

    // 按钮
    const controls = el('div', 'sk-controls'); wrap.appendChild(controls);
    const btn = (txt, key, fn) => { const b = el('button', 'sk-btn'); b.type = 'button'; b.appendChild(document.createTextNode(txt)); if (key) b.appendChild(el('kbd', '', key)); b.addEventListener('click', fn); controls.appendChild(b); return b; };
    const hasShell = parts.some((P) => P.role === 'shell'), hasExplode = parts.some((P) => P.def.explode);
    const bPlay = btn('暂停', '空格', () => { togglePlay(); });
    const bSpeed = btn('速度 1×', '', () => { speedIx = (speedIx + 1) % SPEEDS.length; syncButtons(); });
    const bX = hasShell ? btn('透视', 'X', () => { xrayT = xrayT ? 0 : 1; syncButtons(); }) : null;
    const bL = labeled.length ? btn('标注', 'L', () => { labelMode = (labelMode + 1) % 3; syncButtons(); }) : null;
    const bE = hasExplode ? btn('一键爆炸', 'E', () => { setExplosion(expT>0?0:1); }) : null;
    btn('复位视角', 'R', () => resetView());
    const bMode = pbs.length ? btn('模式', 'M', () => setMode(mode === 'buttons' ? 'auto' : 'buttons')) : null;
    const bReset = pbs.length ? btn('重来', '', () => setMode('buttons')) : null;
    const explosionBar=el('div','nursing-explosion');const expLabel=el('label','','展开程度');expLabel.htmlFor='explode-range';
    const expRange=el('input');expRange.type='range';expRange.id='explode-range';expRange.min='0';expRange.max='100';expRange.step='1';expRange.value='0';const expOutput=el('output','','0%');expOutput.setAttribute('for','explode-range');
    if(bE){bE.id='explode';explosionBar.appendChild(bE);}explosionBar.appendChild(expLabel);explosionBar.appendChild(expRange);explosionBar.appendChild(expOutput);wrap.insertBefore(explosionBar,stage);
    const expNote=el('p','nursing-exp-note','概念拆解；展开暂停动作，播放或选步骤先合拢。');wrap.insertBefore(expNote,stage);expRange.addEventListener('input',()=>setExplosion(Number(expRange.value)/100,true));
    btn('缩小','',()=>{zoom=clamp(zoom/1.15,.45,3.2);camGoal=null;});btn('放大','',()=>{zoom=clamp(zoom*1.15,.45,3.2);camGoal=null;});
    btn('复位模型','',()=>{cancelAll();expl=expT=0;labelMode=0;xray=xrayT=0;focusGoal=null;camLock=false;lastViewKey='';setMode('buttons');resetView();syncButtons();});
    const partPanel=el('section','sk-part-panel');partPanel.setAttribute('aria-label','部件名称');
    partPanel.appendChild(el('p','sk-part-title','部件名称 · 点编号或名称查看'));
    const legend = el('ol', 'sk-legend');partPanel.appendChild(legend);wrap.insertBefore(partPanel,stage.nextSibling);
    const partName=el('div','sk-part-name','点图中编号，查看中文部件名');partName.setAttribute('role','status');stage.appendChild(partName);
    labeled.forEach((P) => {
      const li = el('li'); const i = el('i', '', String(P.no)); i.style.setProperty('--c', css(mixc(P.base, WHITE, 0.3)));
      li.style.setProperty('--tint', css(mixc(P.base, WHITE, 0.62)));
      li.appendChild(i); li.appendChild(document.createTextNode(P.label));
      li.addEventListener('click', () => { pinned = pinned === P ? null : P; showNote(P); });
      li.tabIndex=0;li.setAttribute('role','button');li.setAttribute('aria-label',P.label);li.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pinned=pinned===P?null:P;showNote(P);}});legend.appendChild(li); P.li = li;
    });
    if (scene.caption) { const c = el('p', 'sk-sub', scene.caption); c.style.margin = '14px 4px 0'; wrap.appendChild(c); }

    /* —— 状态 —— */
    const SPEEDS = [1, 0.5, 0.25, 2];
    let speedIx = 0, playing = !reduce && scene.autoplay !== false, wasPlaying = playing;
    let uAbs = 0, u = 0, xray = scene.xray ? 1 : 0, xrayT = xray, expl = 0, expT = 0;
    let labelMode = scene.labels === 'step' ? 1 : scene.labels === false ? 2 : 0; // 0 全部 1 仅当前 2 关
    const view0 = Object.assign({ yaw: -32, pitch: 20, zoom: 1 }, scene.view || {});
    let yaw = view0.yaw, pitch = view0.pitch, zoom = view0.zoom, vyaw = 0, vpitch = 0, swayAmp = 0, swayT = 0, idle = 99, sway = 0;
    let hoverPart = null, pinned = null, W = 0, H = 0, dpr = 1, compact = false, pinMode = false, lastStep = -2, lastRead = '';
    let camGoal = null, lastViewKey = '', reqView = null, focusGoal = null, focusCur = null, camLock = false;
    let mode = pbs.length && scene.mode === 'buttons' ? 'buttons' : 'auto', curSeg = null;
    const done = new Set();
    if (mode === 'buttons') playing = false;            // 按钮模式：等用户按
    const resetView = () => { yaw = view0.yaw; pitch = view0.pitch; zoom = view0.zoom; vyaw = vpitch = 0; camGoal = null; bake(); };
    const anyViews = (scene.steps || []).some((s) => s.view);
    // 步骤或 animate 里 api.view() 要求的镜头：变化时缓缓转过去；用户一拖就让给用户
    function wantView(si) {if(viewHold)return;
      if (camLock||expl>0||expT>0) return;
      const v = reqView || (steps[si] && steps[si].view) || (anyViews || reqView ? {} : null);
      if (!v) return;
      const goal = Object.assign({}, view0, v), key = goal.yaw + ',' + goal.pitch + ',' + goal.zoom + ',' + goal.focus;
      if (key !== lastViewKey) { lastViewKey = key; bake(); camGoal = goal; focusGoal = goal.focus || null; }
    }
    const bake = () => { yaw += sway; sway = 0; swayAmp = 0; idle = 0; };
// Inlined by build-sketch.py into each instance; driven only by its existing RAF.
function cancelAll(){
  if(allPlayback)playing=false;
  allPlayback=false;allFinished=false;syncAll();
}
function syncAll(){
  wrap.dataset.allPlayback=String(allPlayback);wrap.dataset.allFinished=String(allFinished);
  for(const b of allButtons){b.setAttribute('aria-pressed',String(allPlayback));b.classList.toggle('on',allPlayback);}
  allStatus.textContent=allFinished?'全部步骤已播放。':allPlayback?(playing?'正在按顺序播放全部步骤。':'全部步骤已暂停；点继续可接着播放。'):'';
}
function startAll(){
  if(!steps.length)return;
  allPlayback=true;allFinished=false;playing=true;u=uAbs=steps[0].from;
  expl=expT=0;viewHold=false;camGoal=null;focusGoal=null;lastViewKey='';lastStep=-2;pinned=null;
  if(pbs.length){mode='buttons';done.clear();curSeg=pbs[0];}
  syncButtons();
}
function advanceAll(dt){
  if(!allPlayback||!playing)return;
  const previous=pbs.length?curSeg:null;
  uAbs=Math.min(.9999,uAbs+(dt*SPEEDS[speedIx])/cycle);u=uAbs;
  if(pbs.length){
    for(const b of pbs)if(u>=b.to)done.add(b.id);
    curSeg=pbs.find(b=>u>=b.from&&u<b.to)||null;
  }
  if(uAbs>=.9999){
    u=uAbs=.9999;playing=false;allPlayback=false;allFinished=true;
    if(pbs.length){pbs.forEach(b=>done.add(b.id));curSeg=null;}
  }
  if(!playing||(pbs.length&&previous!==curSeg))syncButtons();
}

    function togglePlay(){if(!playing){expl=expT=0;lastViewKey='';}playing=!playing;syncButtons();}
    function setExplosion(value,immediate=false){cancelAll();playing=false;expT=clamp(Number(value)||0,0,1);if(immediate||reduce)expl=expT;labelMode=0;camGoal=null;focusGoal=null;zoom=view0.zoom;lastViewKey='';syncButtons();}
    function setU(x) {cancelAll();viewHold=false; expl=expT=0; const base = Math.floor(uAbs); uAbs = base + x; u = x; }
    function syncButtons() {syncAll();
      wrap.dataset.playing=String(playing);wrap.dataset.mode=mode;wrap.dataset.segment=curSeg?curSeg.id:'';wrap.dataset.done=[...done].join(',');
      bPlay.firstChild.textContent = playing ? '暂停' : mode === 'buttons' ? '继续' : '播放'; bPlay.setAttribute('aria-pressed', String(!playing));bPlay.disabled=mode==='buttons'&&!curSeg;if(bPlay.disabled)bPlay.firstChild.textContent='先选步骤';
      if (bMode) bMode.firstChild.textContent = mode === 'buttons' ? '模式：按钮' : '模式：自动循环';
      if (bReset) bReset.hidden = mode !== 'buttons';
      pRow.hidden = mode !== 'buttons';
      const tl = wrap.querySelector('.sk-steps'); if (tl) tl.hidden = mode === 'buttons';
      let nextSet = false;
      pbs.forEach((b) => {
        const ready = b.needs.every((n) => done.has(n)) && !done.has(b.id) && !curSeg;
        b.el.classList.toggle('done', done.has(b.id)); b.el.classList.toggle('on', curSeg === b);
        b.el.classList.toggle('next', ready && !nextSet); if (ready) nextSet = true;
      });
      bSpeed.firstChild.textContent = '速度 ' + SPEEDS[speedIx] + '×';
      if (bX) bX.setAttribute('aria-pressed', String(!!xrayT));
      if (bL) { bL.firstChild.textContent = ['标注：全部', '标注：当前', '标注：关'][labelMode]; }
      if(bE){bE.setAttribute('aria-pressed',String(expT>0));bE.firstChild.textContent=expT>0?'合拢':'一键爆炸';}expRange.value=String(Math.round(expl*100));expOutput.textContent=Math.round(expl*100)+'%';
    }
    function setMode(m) {cancelAll(); expl=expT=0;
      mode = m; curSeg = null; done.clear(); pinned = null; lastStep = -2;
      if (m === 'buttons') { uAbs = u = 0; playing = false; } else playing = !reduce;
      syncButtons();
    }
    function canPress(b) {
      const miss = b.needs.filter((n) => !done.has(n));
      if (!miss.length) return true;
      const m = pbs.find((x) => x.id === miss[0]);
      toast(b.hint || `还不行：先按「${m ? m.label : miss[0]}」`);
      b.el.classList.remove('shake'); void b.el.offsetWidth; b.el.classList.add('shake');
      return false;
    }
    function press(k, instant) {cancelAll();
      const b = typeof k === 'number' ? pbs[k - 1] : pbs.find((x) => x.id === k || x.label === k);
      if (!b) return false;
      if (mode !== 'buttons') setMode('buttons');
      if (curSeg && !instant) { done.add(curSeg.id); curSeg = null; }
      if (!canPress(b)) { syncButtons(); return false; }
      expl=expT=0;camLock=false;lastViewKey='';pinned = null; lastStep = -2;
      if (instant) { done.add(b.id); uAbs = u = b.to - 1e-4; playing = false; }
      else { curSeg = b; uAbs = u = b.from + 1e-4; playing = true; }
      syncButtons(); return true;
    }
    syncButtons();
    function showNote(P) {
      if (!P) return; let named=P;while(!named.label&&named.parent)named=named.parent;partName.textContent=(named.no?named.no+' · ':'')+(named.label||named.def.name||'未命名示意部件');partName.dataset.partId=named.id; caption.innerHTML = '';
      const b = el('b', '', P.label || P.def.name || P.id); b.style.setProperty('--tint', css(mixc(P.base, WHITE, 0.55)));
      caption.appendChild(b); caption.appendChild(document.createTextNode(P.note || '')); lastStep = -3;
    }

    /* —— 动画 API —— */
    const poses = {}, flowSet = {};
    const api = {
      u: 0, t: 0, step: -1, stepU: 0, M,
      set(id, pose) { poses[id] = Object.assign(poses[id] || {}, pose); },
      view(o) { reqView = o; },
      flow(id, v) { flowSet[id] = v; }
    };
    const stepAt = (x) => steps.findIndex((s) => x >= s.from && x < s.to);
    function runAnim(x) {
      for (const k in poses) delete poses[k];
      for (const k in flowSet) delete flowSet[k];
      reqView = null;
      api.u = x; api.t = x * cycle; api.step = stepAt(x); api.xray = xray;
      const s = steps[api.step]; api.stepU = s ? (x - s.from) / (s.to - s.from) : 0;
      if (scene.animate) scene.animate(x, api);
    }

    /* —— 世界矩阵 —— */
    function worlds(e) {
      for (const P of order) {
        const ps = poses[P.id] || {}, d = P.def;
        let L = mul(Tm(d.at || [0, 0, 0]), Re(d.rot));
        if (ps.pos || ps.rot || ps.scale != null) L = mul(L, mul(Tm(ps.pos || [0, 0, 0]), mul(Re(ps.rot), Sm(ps.scale))));
        let Wm = P.parent ? mul(P.parent.W, L) : L;
        P.ex = add(P.parent ? P.parent.ex : [0, 0, 0], scl(d.explode || [0, 0, 0], e));
        if (e) Wm = mul(Tm(scl(d.explode || [0, 0, 0], e)), Wm);
        P.W = Wm; P.pose = ps;
        P.alpha = ps.opacity == null ? (d.opacity == null ? 1 : d.opacity) : ps.opacity;
        P.shown = ps.visible !== false && d.visible !== false && (P.parent ? P.parent.shown : true);
      }
    }

    /* —— 取景：采样整个循环求包围盒 —— */
    function bounds(e) {
      let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; const pts = [];
      for (let i = 0; i < 8; i++) {
        runAnim(i / 8); worlds(e);
        for (const P of parts) {
          if (P.def.fit === false) continue;
          for (let k = 0; k < P.mesh.v.length; k += Math.max(1, (P.mesh.v.length / 60) | 0)) {
            const w = ap(P.W, P.mesh.v[k]); pts.push(w); for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], w[c]); mx[c] = Math.max(mx[c], w[c]); }
          }
        }
      }
      const c = scl(add(mn, mx), 0.5); let r = 0;
      for (const w of pts) r = Math.max(r, vlen(sub(w, c)));
      return { c, r: r || 1, mn, mx };
    }
    const B0 = bounds(0), B1 = hasExplode ? bounds(1) : B0;

    /* —— 尺寸 —— */
    let hatch = null;
    function resize() {
      const r = stage.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      compact = W < 640; wrap.classList.toggle('compact', compact);
      const s = Math.round(7 * dpr), hc = document.createElement('canvas'); hc.width = hc.height = s;
      const h = hc.getContext('2d'); h.strokeStyle = css(INK); h.lineWidth = 0.9 * dpr; h.lineCap = 'square';
      h.beginPath(); h.moveTo(-1, s + 1); h.lineTo(s + 1, -1); h.moveTo(-1, 1); h.lineTo(1, -1); h.moveTo(s - 1, s + 1); h.lineTo(s + 1, s - 1); h.stroke();
      hatch = ctx.createPattern(hc, 'repeat');
      labeled.forEach((P) => { P.L.w = P.L.el.offsetWidth || 80; P.L.h = P.L.el.offsetHeight || 26; });
    }
    const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(stage); resize();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(()=>{if(!destroyed)resize();});

    /* —— 交互 —— */
    const ptrs = new Map(); let dragMoved = 0, pinch0 = 0, zoom0 = 1, mouse = null;
    cv.addEventListener('pointerdown', (e) => {
      const r=stage.getBoundingClientRect();mouse=[e.clientX-r.left,e.clientY-r.top];cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]); dragMoved = 0; bake(); vyaw = vpitch = 0; camGoal = null;
      stage.classList.add('drag'); stage.focus({ preventScroll: true });
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); zoom0 = zoom; }
    });
    cv.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect(); mouse = [e.clientX - r.left, e.clientY - r.top];
      if (!ptrs.has(e.pointerId)) return;
      const p = ptrs.get(e.pointerId), dx = e.clientX - p[0], dy = e.clientY - p[1]; ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; zoom = clamp(zoom0 * Math.hypot(a[0] - b[0], a[1] - b[1]) / (pinch0 || 1), 0.45, 3.2); dragMoved += 10; return; }
      dragMoved += Math.abs(dx) + Math.abs(dy); idle = 0;
      yaw += dx * 0.45; pitch = clamp(pitch + dy * 0.35, -85, 85); vyaw = dx * 0.45 * 60; vpitch = dy * 0.35 * 60;
    });
    const up = (e) => {
      ptrs.delete(e.pointerId); stage.classList.remove('drag');
      if (dragMoved < 5 && e.type === 'pointerup') { const P = pick(mouse); pinned = P && pinned !== P ? P : null; if (P) showNote(P); }
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', () => { mouse = null; });
    cv.addEventListener('dblclick', resetView);
    cv.addEventListener('wheel', (e) => { e.preventDefault(); zoom = clamp(zoom * Math.exp(-e.deltaY * 0.0012), 0.45, 3.2); idle = 0; }, { passive: false });
    stage.addEventListener('keydown', (e) => {
      if(e.altKey||e.ctrlKey||e.metaKey)return;const k = e.key.toLowerCase(); let hit = true;
      if (k === ' ') { if (mode === 'buttons' && !curSeg && !playing) toast('按下面的按钮开始'); else togglePlay(); }
      else if (mode === 'buttons' && /^[1-9]$/.test(k)) press(+k,reduce);
      else if (k === 'm' && bMode) setMode(mode === 'buttons' ? 'auto' : 'buttons');
      else if (k === 'x' && bX) xrayT = xrayT ? 0 : 1;
      else if (k === 'l' && bL) labelMode = (labelMode + 1) % 3;
      else if (k === 'e' && bE) setExplosion(expT>0?0:1);
      else if (k === 'r') resetView();
      else if (k === 'arrowright' && steps.length) { const i = (Math.max(0, stepAt(u)) + 1) % steps.length; setU(steps[i].from + 1e-4); }
      else if (k === 'arrowleft' && steps.length) { const i = (Math.max(0, stepAt(u)) - 1 + steps.length) % steps.length; setU(steps[i].from + 1e-4); }
      else if (k === 'a') { bake(); yaw -= 10; } else if (k === 'd') { bake(); yaw += 10; }
      else if (k === 'w') { bake(); pitch = clamp(pitch + 8, -85, 85); } else if (k === 's') { bake(); pitch = clamp(pitch - 8, -85, 85); }
      else if (k === '+' || k === '=') zoom = clamp(zoom * 1.15, 0.45, 3.2); else if (k === '-') zoom = clamp(zoom / 1.15, 0.45, 3.2);
      else hit = false;
      if (hit) { e.preventDefault(); syncButtons(); }
    });
    let onScreen = true;
    // A sandboxed srcdoc can report a visible stage as non-intersecting.
    // The gallery removes inactive frames; only document visibility gates this one.
    const visibilityHandler=()=>{onScreen=!document.hidden;if(document.hidden)playing=false;if(onScreen&&!raf&&!destroyed)raf=requestAnimationFrame(frame);};document.addEventListener('visibilitychange',visibilityHandler);

    /* —— 投影 —— */
    let cam = null;
    function setupCamera() {
      const Bc = { c: B0.c.map((v, i) => v + (B1.c[i] - v) * expl), r: B0.r + (B1.r - B0.r) * expl };
      // 镜头对准点：默认是整体中心，步骤可以用 view.focus 指到某处（缓动过去）
      const fT = focusGoal || Bc.c; focusCur = focusCur || fT.slice();
      for (let i = 0; i < 3; i++) focusCur[i] += (fT[i] - focusCur[i]) * camK;
      const V = mul(Rx(pitch * D2R), mul(Ry((yaw + sway) * D2R), Tm(scl(focusCur, -1))));
      const cap = Math.max(4, Math.floor((H - 50) / 31)) * 2;
      const pm = compact || (labelMode === 0 && labeled.length > cap);
      if (pm !== pinMode) { pinMode = pm; wrap.classList.toggle('pins', pm); }
      const D = Bc.r * 4.2, labelW = pinMode || labelMode === 2 ? 0 : Math.min(170, W * 0.2);
      const avail = Math.min(W - labelW * 2, H - 40);
      const K = (avail * 0.5 * 0.9 / Bc.r) * zoom * dpr;
      cam = { V, D, K, cx: (W / 2) * dpr, cy: (H / 2 - 6) * dpr, labelW, Bc };
    }
    const proj = (p) => { const s = cam.D / (cam.D - p[2]); return [cam.cx + p[0] * s * cam.K, cam.cy - p[1] * s * cam.K, s]; };
    const LIGHT = norm([-0.45, 0.75, 0.55]);

    /* —— 手绘线 —— */
    function jit(seed, vi, pass) { return [(hash(seed, vi, pass) - 0.5) * 2, (hash(seed, vi, pass + 17) - 0.5) * 2]; }
    function seg(P, a, b, ei, pass, crease) {
      const r = style.rough * dpr, ja = jit(P.seed, a, pass), jb = jit(P.seed, b, pass);
      let x1 = P.sx[a] + ja[0] * r * 0.9, y1 = P.sy[a] + ja[1] * r * 0.9, x2 = P.sx[b] + jb[0] * r * 0.9, y2 = P.sy[b] + jb[1] * r * 0.9;
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy); if (L < 0.2) return;
      // 只有长直边才出头、才弓：圆形零件的轮廓由很多短段组成，每段都出头会在放大时像一串虚线
      if (crease && L > 40 * dpr) {
        if (P.cd[a] >= 3) { const o = (0.3 + hash(P.seed, ei, pass + 3) * 1.6) * r * 1.4; x1 -= (dx / L) * o; y1 -= (dy / L) * o; }
        if (P.cd[b] >= 3) { const o = (0.3 + hash(P.seed, ei, pass + 5) * 1.6) * r * 1.4; x2 += (dx / L) * o; y2 += (dy / L) * o; }
      }
      const bow = L < 24 * dpr ? 0 : (hash(P.seed, ei, pass + 9) - 0.5) * Math.min(L * 0.04, 2.4 * r);
      ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1 + x2) / 2 - (dy / L) * bow, (y1 + y2) / 2 + (dx / L) * bow, x2, y2);
    }

    /* —— 拾取 —— */
    let drawn = [];
    function inPoly(x, y, xs, ys) { let c = false; for (let i = 0, j = xs.length - 1; i < xs.length; j = i++) if ((ys[i] > y) !== (ys[j] > y) && x < ((xs[j] - xs[i]) * (y - ys[i])) / (ys[j] - ys[i]) + xs[i]) c = !c; return c; }
    function pick(m) {
      if (!m) return null; const x = m[0] * dpr, y = m[1] * dpr;
      for (let i = drawn.length - 1; i >= 0; i--) {
        const it = drawn[i]; if (it.a < 0.45 || it.P.def.pick === false) continue;
        if (inPoly(x, y, it.xs, it.ys)) return it.P;
      }
      return null;
    }

    /* —— 每帧 —— */
    let last = performance.now(), raf = 0, camK = 1;
    function frame(now) {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!onScreen||destroyed) return;
      if(allPlayback) advanceAll(dt);
      else if (playing && mode === 'buttons') {
        const end = curSeg ? curSeg.to - 1e-4 : 0.9999;
        uAbs = Math.min(end, uAbs + (dt * SPEEDS[speedIx]) / cycle); u = uAbs;
        if (uAbs >= end) { playing = false; if (curSeg) { done.add(curSeg.id); curSeg = null; if (done.size === pbs.length) toast('全部完成 · 点“重来”再来一遍'); } syncButtons(); }
      } else if (playing) { uAbs += (dt * SPEEDS[speedIx]) / cycle; u = uAbs - Math.floor(uAbs); }
      xray += (xrayT - xray) * Math.min(1, dt * 6); if (Math.abs(xray - xrayT) < 0.002) xray = xrayT;
      expl += (expT - expl) * (reduce?1:Math.min(1, dt * 8));expRange.value=String(Math.round(expl*100));expOutput.textContent=Math.round(expl*100)+'%';wrap.dataset.explode=expl.toFixed(4); if (Math.abs(expl - expT) < 0.002) expl = expT;
      if (!ptrs.size && camGoal) {
        const k = reduce?1:Math.min(1, dt * 2.6), dy = ((camGoal.yaw - yaw) % 360 + 540) % 360 - 180;
        yaw += dy * k; pitch += (camGoal.pitch - pitch) * k; zoom += (camGoal.zoom - zoom) * k; idle = 0;
        if (Math.abs(dy) < 0.2 && Math.abs(camGoal.pitch - pitch) < 0.2 && Math.abs(camGoal.zoom - zoom) < 0.003) camGoal = null;
      }
      if(reduce)vyaw=vpitch=0;
      if (!ptrs.size) {
        yaw += vyaw * dt; pitch = clamp(pitch + vpitch * dt, -85, 85); vyaw *= Math.pow(0.04, dt); vpitch *= Math.pow(0.04, dt);
        if (Math.abs(vyaw) < 0.5) vyaw = 0; if (Math.abs(vpitch) < 0.5) vpitch = 0;
        idle += dt;
        if (!reduce && scene.sway !== false && idle > 4) { swayT += dt; swayAmp = Math.min(16, swayAmp + dt * 6); sway = swayAmp * Math.sin(swayT * 0.35); }
      }
      camK = reduce?1:Math.min(1, dt * 2.6);
      render(dt);
      wrap.dataset.progress=u.toFixed(5);wrap.dataset.camera=[yaw,pitch,zoom].map(n=>n.toFixed(3)).join(',');
      raf = requestAnimationFrame(frame);
    }

    function render(dt) {
      runAnim(u); worlds(expl); setupCamera();
      wrap.dataset.transforms=JSON.stringify(Object.fromEntries(parts.map(P=>[P.id,P.W])));wrap.dataset.selected=pinned?pinned.id:'';
      const si = mode === 'buttons' && !curSeg && !done.size ? -1 : api.step, step = steps[si], active = new Set(expl>0?[]:step ? step.set : []);
      wantView(si);
      const focus = hoverPart || pinned;
      if (focus) active.add(focus);
      const anyActive = active.size > 0;
      const pulse = 0.65 + 0.35 * Math.sin(performance.now() / 260);

      // 变换顶点
      const items = [], shells = [], inside = [], ground = [], cont = {};
      const eye = [0, 0, cam.D];
      for (const P of parts) {
        if (!P.shown || P.alpha <= 0.01) { P.vis = null; continue; }
        const C = mul(cam.V, P.W), V = P.mesh.v, n = V.length;
        if (P.def.decal) {   // 贴花：只在它朝向镜头的那一面看得见（足底图层、贴在表面上的标记）
          const dn = apR(C, P.def.decal), c0 = ap(C, P.center);
          if (dot(dn, sub([0, 0, cam.D], c0)) <= 0) { P.vis = null; P.glowA = 0; continue; }
        }
        if (!P.sx || P.sx.length !== n) { P.sx = new Float32Array(n); P.sy = new Float32Array(n); P.cz = new Float32Array(n); }
        for (let i = 0; i < n; i++) { const c = ap(C, V[i]), q = proj(c); P.sx[i] = q[0]; P.sy[i] = q[1]; P.cz[i] = c[2]; P.cpos = P.cpos || []; P.cpos[i] = c; }
        P.vis = new Int32Array(P.mesh.f.length).fill(-1);
        const glass = P.role === 'shell' || P.def.glass ? xray : 0;
        P.a = P.alpha * (1 - 0.86 * glass); P.glass = glass;
        P.isOn = active.has(P); P.isDim = anyActive && !P.isOn && P.def.dim !== false;
        P.glowA += ((P.isOn ? 1 : 0) - P.glowA) * Math.min(1, dt * 8);
        const bucket = P.role === 'ground' ? ground : P.role === 'shell' ? shells : P.role !== 'inside' ? items
          : P.def.in ? (cont[P.def.in] = cont[P.def.in] || []) : inside;
        P.mesh.f.forEach((f, fi) => {
          let nn = norm(apR(C, P.fn[fi])); let cx = 0, cy = 0, cz = 0;
          for (const i of f.i) { const c = P.cpos[i]; cx += c[0]; cy += c[1]; cz += c[2]; }
          const k = f.i.length; cx /= k; cy /= k; cz /= k;
          let front = dot(nn, sub(eye, [cx, cy, cz])) > 0;
          if (!front) { if (!P.def.double) return; nn = scl(nn, -1); }
          bucket.push({ k: 0, P, fi, z: cz + (P.def.bias || 0), n: nn });
        });
        if (P.def.glow && (P.def.glow !== 'active' || P.glowA > 0.02)) {
          const c = ap(C, P.center), q = proj(c);
          (P.role === 'inside' ? inside : items).push({ k: 2, P, z: c[2] + P.rad, q, r: P.rad * q[2] * cam.K * (P.pose.scale && typeof P.pose.scale === 'number' ? P.pose.scale : 1) });
        }
      }
      // 粒子流
      for (const F of flows) {
        if(expl>0)continue;
        let target = F.always ? 1 : 0;
        if (step && step.flows && step.flows.includes(F.id)) target = 1;
        if (typeof F.on === 'function') target = F.on(u, api);
        if (flowSet[F.id] != null) target = flowSet[F.id];
        if (!F.keepOnExplode) target *= 1 - expl;
        F.cur += (target - F.cur) * Math.min(1, dt * 6); if (F.cur < 0.01) continue;
        const path = typeof F.path === 'function' ? F.path(u, api) : F.path;
        if (!path || path.length < 2) continue;
        const Wm = F.parent && byId[F.parent] ? byId[F.parent].W : I(), C = mul(cam.V, Wm);
        const cum = [0]; for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + vlen(sub(path[i], path[i - 1])));
        let tot = cum[cum.length - 1]; if (F.closed) tot += vlen(sub(path[0], path[path.length - 1]));
        const bucket = F.role === 'shell' ? shells : F.role === 'part' ? items : F.in ? (cont[F.in] = cont[F.in] || []) : inside;
        for (let k = 0; k < F.count; k++) {
          const s = M.frac(k / F.count + F.speed * uAbs + hash(F.idx, k, 5) * 0.02), d = s * tot;
          let i = 1; while (i < cum.length && cum[i] < d) i++;
          let p;
          if (i >= cum.length) { const a = path[path.length - 1], b = path[0], t = (d - cum[cum.length - 1]) / Math.max(1e-6, tot - cum[cum.length - 1]); p = add(a, scl(sub(b, a), t)); }
          else { const a = path[i - 1], b = path[i], t = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]); p = add(a, scl(sub(b, a), t)); }
          if (F.spread) p = add(p, [(hash(F.idx, k, 1) - 0.5) * 2 * F.spread, (hash(F.idx, k, 2) - 0.5) * 2 * F.spread, (hash(F.idx, k, 3) - 0.5) * 2 * F.spread]);
          const c = ap(C, p), q = proj(c);
          const fade = F.closed ? 1 : smooth(0, 0.07, s) * (1 - smooth(0.93, 1, s));
          bucket.push({ k: 1, F, z: c[2], q, r: Math.max(1.6 * dpr, F.size * q[2] * cam.K), a: F.cur * fade });
        }
      }
      const byZ = (a, b) => a.z - b.z;
      ground.sort(byZ); items.sort(byZ); shells.sort(byZ); inside.sort(byZ);
      let list;
      if (shells.length) {
        // 外壳的可见面在“里面的部件”之后画；外部件照常按深度与外壳交错。
        // 没写 in 的内部件插在第一个外壳面之前；写了 in: 外壳id/组名 的，插在它自己那个外壳最远的可见面之前。
        // 插入点：在“比这批内部件最远处还近”的第一块外壳面之前。更远的外壳面（背面）和更远的外部件（如外壳后面的底座）先画。
        const mixed = items.concat(shells).sort(byZ), done = new Set();
        // 只按“面”算最远深度：粒子会飘到外壳边上，拿它们算会让整块内部件插得太早
        const zMin = (arr) => { let m = Infinity, any = false; for (const x of arr) if (x.k === 0) { any = true; if (x.z < m) m = x.z; } if (!any) for (const x of arr) m = Math.min(m, x.z); return m; };
        const zIn = zMin(inside), zC = {}; for (const key in cont) { cont[key].sort(byZ); zC[key] = zMin(cont[key]); }
        let first = !inside.length; list = ground.slice();
        for (const it of mixed) {
          if (it.k === 0 && it.P.role === 'shell') {
            if (!first && it.z >= zIn) { first = true; for (const x of inside) list.push(x); }
            for (const key of [it.P.id, it.P.group]) if (key && cont[key] && !done.has(key) && it.z >= zC[key]) { done.add(key); for (const x of cont[key]) list.push(x); }
          }
          list.push(it);
        }
        if (!first) for (const x of inside) list.push(x);
        for (const key in cont) if (!done.has(key)) for (const x of cont[key]) list.push(x);
      } else list = ground.concat(items.concat(inside, ...Object.values(cont)).sort(byZ));
      list.forEach((it, i) => { if (it.k === 0) it.P.vis[it.fi] = i; });

      // 画
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
      if (scene.ground !== false) groundShadow();
      drawn = [];
      const LW = style.line * dpr * clamp(Math.min(W, H) / 620, 0.85, 1.25);
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      // 描边时机：一条边要等到“碰到它两个端点的所有本部件可见面”都填完色再画。
      // 填色带马克笔错位，邻面的填色会盖住刚画好的线头，放大后像虚线。
      const due = new Map();
      const strokeP = (P, own) => {
        const lineA = 1 - 0.5 * P.glass;
        if (P.glass > 0.5) ctx.setLineDash([5 * dpr, 4 * dpr]);
        if (P.glowA > 0.02) {
          ctx.beginPath(); for (const ei of own) { const e = P.E[ei]; seg(P, e.a, e.b, ei, 1, e.crease); }
          // 浅色宽描边当光晕，用 darken 混合：只在比它更亮的地方（白纸）显出来，
          // 不会盖住已经画好的深色线和零件（否则分批描的线会被下一批光晕盖成虚线）
          ctx.globalCompositeOperation = 'darken';
          ctx.globalAlpha = Math.min(1, P.alpha) * P.glowA; ctx.strokeStyle = css(mixc(P.base, WHITE, 0.62 - 0.22 * pulse)); ctx.lineWidth = LW * 4.2; ctx.stroke();
          ctx.globalCompositeOperation = 'source-over';
        }
        const lc = P.isDim ? mixc(P.line, WHITE, 0.45) : P.line;
        ctx.beginPath(); for (const ei of own) { const e = P.E[ei]; seg(P, e.a, e.b, ei, 1, e.crease); }
        ctx.globalAlpha = Math.min(1, P.alpha) * lineA; ctx.strokeStyle = css(lc); ctx.lineWidth = LW * (P.def.lineScale || 1) * (P.isOn ? 1.15 : 1); ctx.stroke();
        if (P.glass < 0.5) {
          ctx.beginPath(); for (const ei of own) { const e = P.E[ei]; seg(P, e.a, e.b, ei, 2, e.crease); }
          ctx.globalAlpha = Math.min(1, P.alpha) * lineA * 0.32; ctx.lineWidth = LW * 0.6; ctx.stroke();
        }
        ctx.setLineDash([]);
      };
      const drawDue = (i) => { const g = due.get(i); if (!g) return; due.delete(i); for (const [Q, own] of g) strokeP(Q, own); };
      for (let i = 0; i < list.length; i++) {
        const it = list[i];
        if (it.k === 1) { dotItem(it); drawDue(i); continue; }
        if (it.k === 2) { haloItem(it); drawDue(i); continue; }
        const P = it.P, f = P.mesh.f[it.fi];
        const d = dot(it.n, LIGHT), tone = d > 0.55 ? 0 : d > 0.1 ? 1 : 2;
        const pal = P.isOn ? P.hot : P.isDim ? P.off : P.tones;
        let col = pal[tone];
        if (P.isOn) col = mixc(col, WHITE, (1 - pulse) * 0.18);
        const a = P.a;
        // 填色（马克笔错位）
        ctx.beginPath(); const ox = P.fill[0] * dpr, oy = P.fill[1] * dpr;
        const xs = [], ys = [];
        for (const L of [f.i, ...(f.h || [])]) { L.forEach((vi, k) => { const x = P.sx[vi] + ox * (1 - P.glass), y = P.sy[vi] + oy * (1 - P.glass); if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); if (L === f.i) { xs.push(P.sx[vi]); ys.push(P.sy[vi]); } }); ctx.closePath(); }
        ctx.globalAlpha = a; ctx.fillStyle = css(col); ctx.fill('evenodd');
        if (P.glass < 0.5 && a > 0.9) { ctx.strokeStyle = css(col); ctx.lineWidth = 0.6 * dpr; ctx.stroke(); }
        if (style.hatch && P.def.hatch !== false && tone === 2 && P.glass < 0.4) { ctx.globalAlpha = a * 0.28 * (1 - P.glass * 2) * (P.isDim ? 0.5 : 1); ctx.fillStyle = hatch; ctx.fill('evenodd'); }
        drawn.push({ P, xs, ys, a });
        // 描边：拥有这条边的面（两侧里后画的那个）负责；等端点周围的面都填完再画
        for (const ei of f.e) {
          const e = P.E[ei]; let owner = -1, visN = 0;
          for (const fj of e.f) { const o = P.vis[fj]; if (o >= 0) { visN++; if (o > owner) owner = o; } }
          if (owner !== i) continue;
          if (!e.crease && !(visN === 1 && e.f.length === 2)) continue;
          let at = i;
          for (const v of [e.a, e.b]) for (const fj of P.vf[v]) { const o = P.vis[fj]; if (o > at) at = o; }
          let g = due.get(at); if (!g) due.set(at, (g = new Map()));
          let arr = g.get(P); if (!arr) g.set(P, (arr = [])); arr.push(ei);
        }
        drawDue(i);
      }
      ctx.globalAlpha = 1;
      if (hoverPart == null && mouse && !ptrs.size) { /* 悬停拾取在下面做 */ }
      const hp = mouse && !ptrs.size ? pick(mouse) : null;
      stageHover(hp);
      layoutLabels(active, anyActive, dt);
      updateCaption(si);
      if (knob) knob.style.left = `calc(${(u * 100).toFixed(3)}% - 1.5px)`;
      chips.forEach((c, i) => c.classList.toggle('on', i === si));
      const rd = scene.readout ? scene.readout(u, api) : '';
      if (rd !== lastRead) { readout.textContent = rd; readout.hidden = !rd; lastRead = rd; }
    }

    let hovCanvas = null;
    function stageHover(P) {
      if (P !== hovCanvas) {
        hovCanvas = P;
        const nm = P && (P.label || P.def.name);
        if (nm) { tip.hidden = false; tip.innerHTML = ''; tip.appendChild(el('b', '', nm)); if (P.note) tip.appendChild(document.createTextNode(P.note)); }
        else tip.hidden = true;
      }
      if (P && mouse && !tip.hidden) {
        const tw = tip.offsetWidth, th = tip.offsetHeight;
        let x = mouse[0] + 16, y = mouse[1] + 14; if (x + tw > W - 8) x = mouse[0] - tw - 12; if (y + th > H - 8) y = mouse[1] - th - 10;
        tip.style.transform = `translate(${x}px,${y}px)`; tip.style.left = '0'; tip.style.top = '0';
      }
      if (!labelHover) hoverPart = P;
    }
    let labelHover = false;
    labelLayer.addEventListener('pointerover', () => { labelHover = true; });
    labelLayer.addEventListener('pointerout', () => { labelHover = false; });

    function groundShadow() {
      const Bc = cam.Bc, mn = B0.mn, mx = B0.mx;
      const c = ap(cam.V, [Bc.c[0], mn[1] - (expl ? (B0.mn[1] - B1.mn[1]) * expl : 0), Bc.c[2]]), q = proj(c);
      const rx = Math.max(mx[0] - mn[0], mx[2] - mn[2]) * 0.62 * q[2] * cam.K, ry = rx * Math.max(0.12, Math.abs(Math.sin(pitch * D2R))) * 0.9;
      ctx.save(); ctx.translate(q[0], q[1] + 4 * dpr); ctx.scale(1, ry / rx);
      const g = ctx.createRadialGradient(0, 0, rx * 0.1, 0, 0, rx);
      g.addColorStop(0, 'rgba(60,60,110,0.16)'); g.addColorStop(1, 'rgba(60,60,110,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, TAU); ctx.fill(); ctx.restore();
      // 几道铅笔排线当地面
      ctx.save(); ctx.globalAlpha = 0.18; ctx.strokeStyle = css(INK); ctx.lineWidth = 1 * dpr; ctx.beginPath();
      for (let i = 0; i < 5; i++) { const y = q[1] + (i - 2) * ry * 0.32, w = rx * (0.95 - Math.abs(i - 2) * 0.22), j = (hash(i, 3, 9) - 0.5) * rx * 0.2; ctx.moveTo(q[0] - w + j, y); ctx.quadraticCurveTo(q[0] + j, y + (hash(i, 5, 2) - 0.5) * 3 * dpr, q[0] + w * 0.9 + j, y); }
      ctx.stroke(); ctx.restore();
    }
    function dotItem(it) {
      ctx.globalAlpha = it.a; ctx.beginPath(); ctx.arc(it.q[0], it.q[1], it.r, 0, TAU);
      ctx.fillStyle = css(it.F.c); ctx.fill(); ctx.globalAlpha = it.a * 0.7; ctx.lineWidth = 0.9 * dpr; ctx.strokeStyle = css(mixc(it.F.c, DEEP, 0.5)); ctx.stroke(); ctx.globalAlpha = 1;
    }
    function haloItem(it) {
      const P = it.P; if (it.r <= 0) return;
      const ga = P.def.glow === 'active' ? P.glowA * (0.75 + 0.25 * Math.sin(performance.now() / 260)) : 1;
      const g = ctx.createRadialGradient(it.q[0], it.q[1], 0, it.q[0], it.q[1], it.r * 2.2);
      g.addColorStop(0, css(mixc(P.base, WHITE, 0.3), 0.55 * P.alpha * ga)); g.addColorStop(0.5, css(P.base, 0.22 * P.alpha * ga)); g.addColorStop(1, css(P.base, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(it.q[0], it.q[1], it.r * 2.2, 0, TAU); ctx.fill();
    }

    /* —— 标签布局：左右两列，按锚点高度排开，铅笔引线 —— */
    function layoutLabels(active, anyActive, dt) {
      const k = Math.min(1, dt * 12), cols = [[], []], center = cam.cx / dpr, pins = [];
      for (const P of labeled) {
        const L = P.L, show = P.shown && P.alpha > 0.05 && (labelMode === 0 || (labelMode === 1 && active.has(P)));
        const on = active.has(P);
        L.el.classList.toggle('on', on && !!(api.step >= 0 || pinned === P || hoverPart === P));
        L.el.classList.toggle('dim', anyActive && !on && labelMode === 0);
        L.el.classList.toggle('off', !show);
        if(P.li){P.li.classList.toggle('on',on);P.li.setAttribute('aria-pressed',String(pinned===P));}
        if (!show) { L.y = null; continue; }
        const c = ap(cam.V, ap(P.W, P.anchor)), q = proj(c);
        L.ax = q[0] / dpr; L.ay = q[1] / dpr;
        if (pinMode) {
          const x = L.ax - 11, y = L.ay - 11;
          L.x = L.x == null ? x : L.x + (x - L.x) * k; L.y = L.y == null ? y : L.y + (y - L.y) * k;
          pins.push(L); continue;
        }
        if (!L.side || Math.abs(L.ax - center) > 14) L.side = L.ax < center ? -1 : 1;
        cols[L.side < 0 ? 0 : 1].push(P);
      }
      if (pinMode) {
        for (let it = 0; it < 6; it++) for (let i = 0; i < pins.length; i++) for (let j = i + 1; j < pins.length; j++) {
          const A = pins[i], Bp = pins[j], dx = Bp.x - A.x, dy = Bp.y - A.y, d = Math.hypot(dx, dy) || 0.01;
          if (d < 24) { const m = (24 - d) / 2, ux = d > 0.02 ? dx / d : 1, uy = d > 0.02 ? dy / d : 0; A.x -= ux * m; A.y -= uy * m; Bp.x += ux * m; Bp.y += uy * m; }
        }
        for (const L of pins) {
          L.x = clamp(L.x, 4, W - 26); L.y = clamp(L.y, 4, H - 30);
          L.el.style.transform = `translate(${L.x.toFixed(1)}px,${L.y.toFixed(1)}px)`;
        }
        return;
      }
      const gap = 6, top = 10, bot = H - 40;
      cols.forEach((col, ci) => {
        col.sort((a, b) => a.L.ay - b.L.ay);
        let y = -1e9;
        for (const P of col) { P.L.ty = Math.max(P.L.ay - P.L.h / 2, y + gap, top); y = P.L.ty + P.L.h; }
        let lim = bot;
        for (let i = col.length - 1; i >= 0; i--) { const L = col[i].L; L.ty = Math.min(L.ty, lim - L.h); lim = L.ty - gap; }
        for (const P of col) {
          const L = P.L, x = ci === 0 ? Math.max(8, cam.labelW - 6 - L.w) : W - cam.labelW + 6;
          L.y = L.y == null ? L.ty : L.y + (L.ty - L.y) * k; L.x = L.x == null ? x : L.x + (x - L.x) * k;
          L.el.style.transform = `translate(${L.x.toFixed(1)}px,${L.y.toFixed(1)}px)`;
        }
      });
      // 引线
      ctx.save(); ctx.lineCap = 'round';
      for (const P of labeled) {
        const L = P.L; if (L.y == null || L.el.classList.contains('off')) continue;
        const on = L.el.classList.contains('on') || hoverPart === P;
        const sx = (L.side < 0 ? L.x + L.w + 2 : L.x - 2) * dpr, sy = (L.y + L.h / 2) * dpr, ex = L.ax * dpr, ey = L.ay * dpr;
        const dx = ex - sx, dy = ey - sy, len = Math.hypot(dx, dy) || 1, bow = (hash(P.seed, 1, 1) - 0.5) * Math.min(26 * dpr, len * 0.12);
        ctx.beginPath(); ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo((sx + ex) / 2 - (dy / len) * bow, (sy + ey) / 2 + (dx / len) * bow, ex, ey);
        ctx.globalAlpha = on ? 0.95 : L.el.classList.contains('dim') ? 0.22 : 0.45;
        ctx.strokeStyle = on ? css(mixc(P.base, DEEP, 0.25)) : css(INK); ctx.lineWidth = (on ? 2.2 : 1.1) * dpr;
        if (!on) ctx.setLineDash([1.5 * dpr, 3.5 * dpr]); ctx.stroke(); ctx.setLineDash([]);
        ctx.globalAlpha = on ? 1 : 0.7; ctx.beginPath(); ctx.arc(ex, ey, (on ? 4 : 2.6) * dpr, 0, TAU);
        ctx.fillStyle = on ? css(P.base) : '#fff'; ctx.fill(); ctx.lineWidth = 1.3 * dpr; ctx.strokeStyle = css(INK); ctx.stroke();
      }
      ctx.restore();
    }

    function updateCaption(si) {
      if (pinned) return;
      if (si === lastStep) return; lastStep = si;
      caption.innerHTML = '';
      const s = steps[si];
      if (!s) { caption.textContent = mode === 'buttons' ? scene.intro || '按下面的按钮，一步一步来。' : scene.intro || ''; return; }
      const b = el('b', '', `${si + 1} · ${s.name || ''}`); b.style.setProperty('--tint', css(mixc(s.c, WHITE, 0.55)));
      caption.appendChild(b); caption.appendChild(document.createTextNode(s.text || ''));
    }


    /* —— 空间约束核对（Truth first）：支撑、驱动接触、管线接口，全周期采样量距离 —— */
    const nameOf = (P) => P.label || P.def.name || P.id;
    const targets = (k) => (k === 'ground' ? parts.filter((Q) => Q.role === 'ground') : parts.filter((Q) => Q.id === k || Q.group === k));
    function polyN(pts) { let x = 0, y = 0, z = 0; for (let k = 0; k < pts.length; k++) { const a = pts[k], b = pts[(k + 1) % pts.length]; x += (a[1] - b[1]) * (a[2] + b[2]); y += (a[2] - b[2]) * (a[0] + b[0]); z += (a[0] - b[0]) * (a[1] + b[1]); } return norm([x, y, z]); }
    function inPoly3(q, pts, n) {
      const ax = Math.abs(n[0]) > Math.abs(n[1]) ? (Math.abs(n[0]) > Math.abs(n[2]) ? 0 : 2) : Math.abs(n[1]) > Math.abs(n[2]) ? 1 : 2, i0 = ax === 0 ? 1 : 0, i1 = ax === 2 ? 1 : 2;
      let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[i], b = pts[j];
        if ((a[i1] > q[i1]) !== (b[i1] > q[i1]) && q[i0] < ((b[i0] - a[i0]) * (q[i1] - a[i1])) / (b[i1] - a[i1]) + a[i0]) c = !c; } return c;
    }
    function distSeg(p, a, b) { const ab = sub(b, a), t = clamp(dot(sub(p, a), ab) / (dot(ab, ab) || 1)); return vlen(sub(p, add(a, scl(ab, t)))); }
    function distPoly(p, pts) {
      const n = polyN(pts), d = dot(sub(p, pts[0]), n), q = sub(p, scl(n, d));
      if (inPoly3(q, pts, n)) return Math.abs(d);
      let m = Infinity; for (let i = 0; i < pts.length; i++) m = Math.min(m, distSeg(p, pts[i], pts[(i + 1) % pts.length])); return m;
    }
    function insideMesh(p, P, V) {   // 沿 +x 射线数穿过几次面
      let c = 0; for (const f of P.mesh.f) { const pts = f.i.map((i) => V[i]), n = polyN(pts); if (Math.abs(n[0]) < 1e-9) continue;
        const t = dot(n, sub(pts[0], p)) / n[0]; if (t <= 0) continue; if (inPoly3([p[0] + t, p[1], p[2]], pts, n)) c++; } return c % 2 === 1;
    }
    function distMesh(p, P, V) { let m = Infinity; for (const f of P.mesh.f) { m = Math.min(m, distPoly(p, f.i.map((i) => V[i]))); if (m < 1e-6) return 0; } return m > 0 && insideMesh(p, P, V) ? 0 : m; }
    function box(V) { const a = [1e9, 1e9, 1e9], b = [-1e9, -1e9, -1e9]; for (const v of V) for (let c = 0; c < 3; c++) { a[c] = Math.min(a[c], v[c]); b[c] = Math.max(b[c], v[c]); } return [a, b]; }
    const boxGap = (A, B) => { let g = 0; for (let c = 0; c < 3; c++) g = Math.max(g, A[0][c] - B[1][c], B[0][c] - A[1][c]); return g; };
    function audit(o = {}) {
      const N = o.samples || 16, base = (o.tol || 0.015) * B0.r, problems = [], warnings = [], keep = u, worst = {};
      let checks = 0;
      const note = (key, msg, d, tol, x) => { const w = worst[key]; if (d > tol && (!w || d > w.d)) worst[key] = { msg, d, tol, u: x }; };
      for (const P of parts) {
        const d = P.def; if (P.role === 'ground' || d.on === 'free' || d.audit === false) continue;
        if (d.on == null && !P.parent) warnings.push(`「${nameOf(P)}」没写 on（固定在哪）`);
      }
      manMiss.forEach((id) => warnings.push(`零件清单里有「${id}」，场景里却没有这个零件`));
      for (let k = 0; k < N; k++) {
        const x = (k + 0.5) / N; runAnim(x); worlds(0);
        const cache = new Map(), W = (P) => { if (!cache.has(P)) cache.set(P, P.mesh.v.map((v) => ap(P.W, v))); return cache.get(P); };
        const live = (P) => P.shown && P.alpha > 0.02;
        for (const P of parts) {
          const d = P.def; if (P.role === 'ground' || d.audit === false || !live(P)) continue;
          const tol = d.tol != null ? d.tol : base;
          const on = d.on != null ? d.on : P.parent ? P.parent.id : null;
          if (on && on !== 'free') {
            const T = [].concat(on).flatMap(targets).filter(live), A = box(W(P));
            if (T.length) { const g = Math.min(...T.map((Q) => boxGap(A, box(W(Q))))); checks++;
              note('on:' + P.id, `支撑：「${nameOf(P)}」和「${[].concat(on).join('/')}」之间有缝`, g, tol, x); }
            else warnings.push(`「${nameOf(P)}」的 on 指向不存在或隐藏的「${[].concat(on).join('/')}」`);
          }
          for (const dv of [].concat(d.drive || [])) {
            const T = targets(dv.by).filter(live); if (!T.length) continue;
            const pt = ap(P.W, dv.at || P.anchor), dd = Math.min(...T.map((Q) => distMesh(pt, Q, W(Q)))); checks++;
            note('drive:' + P.id + dv.by, `驱动：「${nameOf(P)}」的接触点离「${dv.by}」`, dd, dv.tol != null ? dv.tol : tol, x);
          }
          if (d.connects) {
            const ports = d.ports || P.mesh.ends || [];
            [].concat(d.connects).forEach((tk, i) => { if (!tk || !ports[i]) return; const T = targets(tk).filter(live); if (!T.length) return;
              const pt = ap(P.W, ports[i]), dd = Math.min(...T.map((Q) => distMesh(pt, Q, W(Q)))); checks++;
              note('port:' + P.id + i, `管线：「${nameOf(P)}」第 ${i + 1} 个接口没接上「${tk}」`, dd, tol, x); });
          }
        }
        for (const F of flows) {
          if (!F.from && !F.to) continue;
          const path = typeof F.path === 'function' ? F.path(x, api) : F.path; if (!path || path.length < 2) continue;
          const Wm = F.parent && byId[F.parent] ? byId[F.parent].W : I();
          [[F.from, path[0]], [F.to, path[path.length - 1]]].forEach(([tk, q], i) => { if (!tk) return; const T = targets(tk).filter(live); if (!T.length) return;
            const pt = ap(Wm, q), dd = Math.min(...T.map((Q) => distMesh(pt, Q, W(Q)))); checks++;
            note('flow:' + F.id + i, `流线：「${F.id}」的${i ? '终点' : '起点'}不在「${tk}」上`, dd, F.tol != null ? F.tol : base, x); });
        }
      }
      runAnim(keep); worlds(expl);
      for (const k in worst) { const w = worst[k]; problems.push(`${w.msg}：最大 ${w.d.toFixed(2)}（容差 ${w.tol.toFixed(2)}），u=${w.u.toFixed(2)}`); }
      return { ok: !problems.length, checks, problems, warnings: [...new Set(warnings)] };
    }
    function showAudit(r) {
      let box = wrap.querySelector('.sk-audit'); if (!box) { box = el('div', 'sk-audit'); wrap.insertBefore(box, stage); }
      box.classList.toggle('bad', !r.ok); box.innerHTML = '';
      box.appendChild(el('b', '', r.ok ? `模型几何核对通过（${r.checks} 项，非实物验证）` : `模型几何核对：${r.problems.length} 个问题（非实物验证）`));
      [...r.problems, ...r.warnings.map((w) => '提醒：' + w)].forEach((t) => box.appendChild(el('div', '', '· ' + t)));
    }

    /* —— URL 参数定位状态：?xr=1&step=3&u=0.4&yaw=200&pitch=40&zoom=2&focus=piston&explode=1&labels=2&press=1,2&mode=buttons&play=0&audit=1 —— */
    raf = requestAnimationFrame(frame);
    const ctl = {
      snapshot(){ return JSON.parse(JSON.stringify({u,uAbs,expl,expT,yaw,pitch,zoom,xray,xrayT,labelMode,selected:pinned?.id||null,playing,allPlayback,allFinished,speedIx,focusGoal,focusCur,viewHold,mode,done:[...done],segment:curSeg?.id||null})); },
      restore(s){ playing=false;allPlayback=!!s.allPlayback;allFinished=!!s.allFinished;u=s.u;uAbs=s.uAbs;expl=s.expl;expT=s.expT;yaw=s.yaw;pitch=s.pitch;zoom=s.zoom;xray=s.xray;xrayT=s.xrayT;labelMode=s.labelMode;speedIx=s.speedIx;pinned=byId[s.selected]||null;focusGoal=s.focusGoal;focusCur=s.focusCur;camGoal=null;vyaw=vpitch=0;sway=0;viewHold=true;mode=s.mode;done.clear();s.done.forEach(x=>done.add(x));curSeg=pbs.find(x=>x.id===s.segment)||null;lastStep=-2;if(pinned)showNote(pinned);syncButtons(); },
      step(n){ const s=steps[Number(n)-1];if(!s)return false;playing=false;setU(s.from+(s.to-s.from)*.45);curSeg=pbs.find(b=>u>=b.from&&u<b.to)||null;lastStep=-2;syncButtons();return true; },
      inspect({part,step,xray:inside=true}){this.step(step||1);playing=false;expl=expT=0;xray=xrayT=inside?1:0;labelMode=0;runAnim(u);worlds(0);pinned=byId[part]||null;viewHold=true;camGoal=null;bake();if(pinned){focusGoal=ap(pinned.W,pinned.anchor);focusCur=focusGoal.slice();zoom=Math.min(view0.zoom*1.35,1.8);showNote(pinned);}syncButtons();},
      query(params){const get=k=>params.get(k);if(get('step'))this.step(Number(get('step')));if(params.has('xr'))this.xray(Number(get('xr')));if(params.has('explode'))this.explode(clamp(Number(get('explode'))||0,0,1));if(params.has('labels'))this.labels(get('labels')==='off'?2:get('labels')==='all'?0:1);const v={};for(const k of ['yaw','pitch','zoom'])if(params.has(k)&&Number.isFinite(Number(get(k))))v[k]=Number(get(k));if(Object.keys(v).length)this.view(v);if(params.has('play'))this.play(get('play')==='1'&&!reduce);if(get('audit')==='1')return this.audit();},
      audit(o){const wasPlaying=playing;playing=false;const result=audit(o);playing=wasPlaying;wrap.dataset.audit=JSON.stringify(result);return result;},
      destroy(){if(destroyed)return;destroyed=true;cancelAll();playing=false;cancelAnimationFrame(raf);sizeObserver.disconnect();document.removeEventListener('visibilitychange',visibilityHandler);lifecycle.abort();clearTimeout(toastT);host.replaceChildren();},

      get u() { return u; }, setU, play(v = true) {if(v&&mode==='buttons'&&!curSeg){const next=pbs.find(b=>!done.has(b.id)&&b.needs.every(n=>done.has(n)));if(next)press(next.id,reduce);else playing=false;}else playing=v;syncButtons();},
      xray(v = 1) { xrayT = v ? 1 : 0; xray = xrayT; syncButtons(); }, explode(v = 1) { setExplosion(v,true); },
      view(o) { viewHold=true;bake(); if (o.yaw != null) yaw = o.yaw; if (o.pitch != null) pitch = o.pitch; if (o.zoom != null) zoom = o.zoom; idle = -1e9; },
      labels(m) { labelMode = m; syncButtons(); }, hover(id) { hoverPart = id ? byId[id] : null; },
      pin(id) { pinned = id ? byId[id] : null; if (pinned) showNote(pinned); },
      settle() { runAnim(u); wantView(stepAt(u)); if (camGoal) { yaw = camGoal.yaw; pitch = camGoal.pitch; zoom = camGoal.zoom; camGoal = null; } focusCur = (focusGoal || B0.c).slice(); },
      steps() { return steps.map((s) => [s.from, s.to]); },
      press(k) { return press(k); }, mode(m) { setMode(m); }, 
      info() {
        return { steps: steps.map((s) => ({ name: s.name, from: s.from, to: s.to, view: s.view || null, active: [...s.set].map((P) => P.id) })),
          buttons: pbs.map((b) => ({ id: b.id, label: b.label, needs: b.needs })), mode, view: view0, hasShell, hasExplode,
          closeups: scene.closeups || [], labeled: labeled.map((P) => P.id) };
      },
      stats() { return { parts: parts.length, faces: parts.reduce((s, P) => s + P.mesh.f.length, 0) }; }
    };

    return ctl;
  }

  root.Sketch3D = { mount, S, M, PAL, version: '1.0.0' };
})(localRoot);


export const makeScene=(S, M) => {
  const H_MIN = 4.4, H_MAX = 7.4, BACK_MAX = 75, KNEE_MAX = 35;
  const PIN = 6.5, LS = 5.5, ROLL_Y = 2.2, DECK_TO_PIN = 0.62;           // 剪叉：销到床中心 650、臂长 550、底滚轮轴高 220
  const L_BACK = 7.5, L_SEAT = 2.0, L_THIGH = 3.2, L_LEG = 6.8;          // 四段床板 750 + 200 + 320 + 680 = 1950
  const X0 = -9.75, X_BACK = X0 + L_BACK, X_THIGH = X_BACK + L_SEAT, HY = -0.06;
  const D2R = M.D2R, rotz = (deg, p) => { const c = Math.cos(deg * D2R), s = Math.sin(deg * D2R); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };

  // —— 运动学（读数、动画、零件清单都从这里取数） ——
  const BACK_LEVER = [-0.4, -1.6], KNEE_LEVER = [0.4, -1.8];            // 床板下焊的摆臂端点（床板局部坐标）
  const BACK_MOUNT = [1.4, -1.0], KNEE_MOUNT = [-4.4, -1.2];            // 推杆尾座（床架局部坐标）
  const RAIL_TOP = -0.36, ROLLER_R = 0.16, ROLLER_Z = 3.6;              // 小腿板尾端滚轮压在床架内纵梁顶面上
  const legAngle = (phi) => M.deg(Math.asin((L_THIGH * Math.sin(phi * D2R)) / L_LEG));
  const kneePt = (phi) => [X_THIGH + L_THIGH * Math.cos(phi * D2R), HY + L_THIGH * Math.sin(phi * D2R)];
  const backEnd = (a) => { const r = rotz(-a, BACK_LEVER); return [X_BACK + r[0], HY + r[1]]; };
  const kneeEnd = (phi) => { const r = rotz(phi, KNEE_LEVER); return [X_THIGH + r[0], HY + r[1]]; };
  // 时间轴：刹车 → 升床 → 屈膝 → 抬背 → 放平 → 头低脚高 → 降床
  const T = { brake: [0, 0.08], up: [0.08, 0.22], knee: [0.22, 0.38], back: [0.38, 0.56], flat: [0.56, 0.7], tilt: [0.7, 0.84], down: [0.84, 1] };
  function state(u) {
    const e = (a, b) => M.smooth(a, b, u);
    const hh = H_MIN + 3 * e(0.09, 0.2) - 3 * e(0.71, 0.82);             // 床头处床面高度（dm）
    const hf = H_MIN + 3 * e(0.09, 0.2) - 3 * e(0.86, 0.97);             // 床尾处床面高度
    const phi = KNEE_MAX * (e(0.23, 0.36) - e(0.6, 0.69));
    const a = BACK_MAX * (e(0.4, 0.54) - e(0.57, 0.68));
    const brake = e(0.015, 0.06) * (1 - e(0.975, 0.998));
    const t = M.deg(Math.atan2(hf - hh, 2 * PIN));
    return { hh, hf, Hc: (hh + hf) / 2, t, a, phi, psi: legAngle(phi), brake };
  }
  const toWorld = (st, p) => { const r = rotz(st.t, p); return [r[0], r[1] + st.Hc, p[2] || 0]; };
  function scissor(st, side) {        // side −1 = 床头，+1 = 床尾
    const top = toWorld(st, [side * PIN, -DECK_TO_PIN]);
    const b = Math.asin(M.clamp((top[1] - ROLL_Y) / LS, -1, 1));
    return { xp: top[0], beta: M.deg(b), xr: top[0] - side * LS * Math.cos(b) };
  }
  const LIFT_MOUNT = 8.6;
  const liftLen = (st, side) => Math.abs(side * LIFT_MOUNT - scissor(st, side).xr);
  const span = (f) => { let lo = 1e9, hi = -1e9; for (let i = 0; i <= 400; i++) { const v = f(state(i / 400)); lo = Math.min(lo, v); hi = Math.max(hi, v); } return [lo, hi]; };
  const dist2 = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const R = {
    liftH: span((st) => liftLen(st, -1)), liftF: span((st) => liftLen(st, 1)),
    back: span((st) => dist2(BACK_MOUNT, backEnd(st.a))), knee: span((st) => dist2(KNEE_MOUNT, kneeEnd(st.phi)))
  };
  const mm = (r) => Math.round((r[1] - r[0]) * 100);

  // —— 形状 ——
  const shift = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
  function panel(len) {
    const holes = [], cols = Math.max(1, Math.floor(len / 1.25));
    for (let i = 0; i < cols; i++) for (const y of [-2.9, -1, 1, 2.9]) holes.push(shift(S.rrect(0.8, 0.28, 0.13, 3), -len / 2 + (len / cols) * (i + 0.5), y));
    return S.prism(S.rrect(len - 0.06, 9.0, 0.25, 3), 0.12, { holes, axis: 'y' });
  }
  const mattress = (len) => S.box(len - 0.1, 1.0, 9.0, { sub: 2 });
  const railMesh = (len) => S.merge(
    S.prism(S.rrect(len, 2.2, 0.5, 4), 0.2, { holes: [-1, 0, 1].map((k) => shift(S.rrect(len / 3 - 0.45, 1.3, 0.3, 3), (k * len) / 3, -0.1)) }),
    ...[-0.32, 0.32].map((f) => S.xf(S.cyl(0.1, 1.0, { seg: 10 }), { at: [f * len, -1.55, 0] }))
  );
  const board = () => S.prism(S.rrect(9.6, 3.6, 0.9, 5), 0.3, { holes: [shift(S.rrect(4.0, 0.5, 0.25, 3), 0, 1.15)], axis: 'x' });
  const casterOne = () => S.merge(
    S.xf(S.cyl(0.625, 0.42, { axis: 'z', seg: 20 }), { at: [0, 0.625, 0] }),
    S.xf(S.cyl(0.22, 0.5, { axis: 'z', seg: 12 }), { at: [0, 0.625, 0] }),
    S.xf(S.box(0.9, 0.95, 0.08), { at: [-0.12, 1.0, 0.27] }), S.xf(S.box(0.9, 0.95, 0.08), { at: [-0.12, 1.0, -0.27] }),
    S.xf(S.cyl(0.3, 0.22, { seg: 14 }), { at: [0, 1.4, 0] }), S.xf(S.box(0.85, 0.1, 0.85), { at: [0, 1.56, 0] })
  );
  const CASTERS = [[-8.6, -3.6], [-8.6, 3.6], [8.6, -3.6], [8.6, 3.6]];
  const armMesh = (z) => S.merge(
    ...[-1, 1].map((sz) => S.xf(S.box(LS, 0.32, 0.16), { at: [LS / 2, 0, sz * z] })),
    ...[-1, 1].flatMap((sz) => [S.xf(S.cyl(0.2, 0.18, { axis: 'z', seg: 14 }), { at: [LS, 0, sz * 3.6] }), S.xf(S.cyl(0.2, 0.18, { axis: 'z', seg: 14 }), { at: [0, 0, sz * 3.6] })])
  );
  const armA = S.merge(armMesh(3.45), S.xf(S.cyl(0.11, 7.8, { axis: 'z', seg: 10 }), { at: [LS / 2, 0, 0] }));
  const armB = S.merge(armMesh(3.75), S.xf(S.cyl(0.14, 7.5, { axis: 'z', seg: 12 }), { at: [0, 0, 0] }));
  const ell = (rx, ry, rz) => S.xf(S.sphere(1, { seg: 18, rings: 10 }), { scale: [rx, ry, rz] });
  // 小腿板：尾端两只滚轮，滚轮中心放在“最低点正好落在床架内纵梁顶面”的高度（小腿板局部 y = RAIL_TOP − HY + R）
  const ROLL_CY = RAIL_TOP - HY + ROLLER_R;
  const legMesh = S.merge(S.xf(panel(L_LEG), { at: [L_LEG / 2, 0, 0] }),
    ...[-ROLLER_Z, ROLLER_Z].flatMap((z) => [S.xf(S.cyl(ROLLER_R, 0.16, { axis: 'z', seg: 14 }), { at: [L_LEG - 0.1, ROLL_CY, z] }),
      S.xf(S.box(0.12, -ROLL_CY - 0.06, 0.06), { at: [L_LEG - 0.1, (ROLL_CY - 0.06) / 2, z + (z > 0 ? -0.11 : 0.11)] })]));

  // 直线推杆：电机 → 齿轮减速 → 丝杠转 → 螺母连着内管伸缩
  const parts = [];
  function actuator(id, o) {
    const [R0] = o.range, Lh = R0 - 0.75, Lr = R0 - 0.65, mz = o.mz, g = o.group;
    parts.push(
      { id, group: g, role: 'shell', parent: o.parent, at: o.A, color: o.color, label: o.label, note: o.note, anchor: [R0 * 0.55, 0.28, 0],
        mesh: S.merge(S.xf(S.cyl(0.28, Lh, { axis: 'x', seg: 16 }), { at: [0.25 + Lh / 2, 0, 0] }),
          S.xf(S.cyl(0.33, 0.14, { axis: 'x', seg: 16 }), { at: [R0 - 0.57, 0, 0] }),
          S.xf(S.box(0.56, 0.9, 1.45), { at: [0.4, 0, mz * 0.3] }),
          S.xf(S.box(1.3, 0.6, 0.55), { at: [1.35, 0, mz * 0.55] }),
          S.xf(S.cyl(0.24, 0.32, { axis: 'z', seg: 12 }), { at: [0, 0, 0] })) },
      { id: id + 'M', group: g, role: 'inside', in: id, parent: id, color: 'orange', label: o.motorLabel, name: '直流电机', note: o.motorNote || '24 V 直流电机，经齿轮减速后带动丝杠。', anchor: [1.35, 0.2, mz * 0.55],
        mesh: S.merge(S.xf(S.cyl(0.2, 1.05, { axis: 'x', seg: 14 }), { at: [1.35, 0, mz * 0.55] }), S.xf(S.cyl(0.05, 0.5, { axis: 'x', seg: 6 }), { at: [0.65, 0, mz * 0.55] }),
          S.xf(S.gear(10, 0.15, 0.14, { axis: 'x' }), { at: [0.42, 0, mz * 0.55] })) },
      { id: id + 'S', group: g, role: 'inside', in: id, parent: id, color: 'yellow', label: o.screwLabel, name: '丝杠', note: o.screwNote || '丝杠转，螺母只能走，内管就伸出或缩回。', anchor: [R0 * 0.45, 0.1, 0],
        mesh: S.merge(S.xf(S.cyl(0.07, R0 - 1.0, { axis: 'x', seg: 8 }), { at: [0.4 + (R0 - 1.0) / 2, 0, 0] }),
          S.spring(0.11, 0.03, (R0 - 1.15) / 0.25, R0 - 1.15, { axis: 'x' }),
          S.xf(S.gear(22, 0.38, 0.14, { axis: 'x' }), { at: [0.42, 0, 0] })) },
      { id: id + 'R', group: g, parent: id, glass: true, color: 'steel', name: '推杆内管',
        mesh: S.merge(S.xf(S.cyl(0.17, Lr, { axis: 'x', seg: 14 }), { at: [Lr / 2, 0, 0] }), S.xf(S.cyl(0.24, 0.3, { axis: 'x', seg: 14 }), { at: [0.15, 0, 0] }),
          S.xf(S.cyl(0.22, 0.34, { axis: 'z', seg: 12 }), { at: [Lr, 0, 0] })) }
    );
    return { id, R0, Lr, A: o.A };
  }
  const setAct = (api, act, B, spinSign = 1) => {
    const dx = B[0] - act.A[0], dy = B[1] - act.A[1], L = Math.hypot(dx, dy), s = L - act.R0;
    api.set(act.id, { rot: [0, 0, M.deg(Math.atan2(dy, dx))] });
    api.set(act.id + 'R', { pos: [act.R0 - act.Lr + s, 0, 0] });
    api.set(act.id + 'S', { rot: [spinSign * (s / 0.25) * 360, 0, 0] });
    return s;
  };

  // —— 部件 ——
  const GOWN = '#e3c6f2', SKIN = '#ffd3b6';
  parts.push(
    { id: 'casters', group: 'brakeSys', mesh: S.merge(...CASTERS.map(([x, z]) => S.xf(casterOne(), { at: [x, 0, z] }))), color: 'gray', name: '万向脚轮', note: '脚轮外形与制动联动的动画示意，尺寸与制动性能未核验。' },
    { id: 'brake', group: 'brakeSys', color: 'red', name: '刹车六角轴', note: '每头一根六角轴横穿两只脚轮的轮座，转动它就推下轮座里的刹车凸轮。',
      mesh: S.merge(...[-8.6, 8.6].map((x) => S.xf(S.cyl(0.1, 7.6, { axis: 'z', seg: 6 }), { at: [x, 1.42, 0] }))) },
    { id: 'pedalH', group: 'brakeSys', color: 'red', at: [-8.6, 1.42, 0], name: '刹车脚踏（床头）',
      mesh: S.merge(...[-3.6, 3.6].map((z) => S.xf(S.box(0.75, 0.16, 0.7), { at: [-0.6, 0, z] })), ...[-3.6, 3.6].map((z) => S.xf(S.box(0.3, 0.3, 0.12), { at: [-0.12, 0, z + (z > 0 ? 0.4 : -0.4)] }))) },
    { id: 'pedalF', group: 'brakeSys', color: 'red', at: [8.6, 1.42, 0], label: '中控刹车', anchor: [0.75, 0.1, 3.6],
      note: '脚踏、六角轴与联动拉杆的简化结构，不代表具体产品的锁止效果。',
      mesh: S.merge(...[-3.6, 3.6].map((z) => S.xf(S.box(0.75, 0.16, 0.7), { at: [0.6, 0, z] })), ...[-3.6, 3.6].map((z) => S.xf(S.box(0.3, 0.3, 0.12), { at: [0.12, 0, z + (z > 0 ? 0.4 : -0.4)] }))) },
    { id: 'brakeLink', group: 'brakeSys', color: 'red', name: '刹车联动拉杆', note: '把床头、床尾两根六角轴连在一起，所以踩一个脚踏四个轮子都锁。',
      mesh: S.tube([[-8.6, 1.25, -3.0], [8.6, 1.25, -3.0]], 0.06, { seg: 6 }) },
    { id: 'base', color: 'slate', name: '底架', note: '落地的钢管底架，剪叉臂的下端都铰接或滚动在它的两根纵梁上。',
      mesh: S.merge(...[-3.6, 3.6].map((z) => S.xf(S.box(18.0, 0.4, 0.35), { at: [0, 1.8, z] })),
        ...[-8.6, 8.6].map((x) => S.xf(S.cyl(0.2, 7.55, { axis: 'z', seg: 12 }), { at: [x, 1.8, 0] })),
        S.xf(S.box(0.4, 0.42, 0.3), { at: [-8.6, 2.05, -2.0] }), S.xf(S.box(0.4, 0.42, 0.3), { at: [8.6, 2.05, 2.0] })) },
    { id: 'armHA', group: 'scissor', mesh: armA, color: 'yellow', label: '剪叉升降臂', anchor: [LS * 0.5, 0.2, 3.45],
      note: '两根臂在中间交叉铰接：一端固定，另一端带滚轮滑动。滑动端被拉近，臂就立起来，床面垂直上升。' },
    { id: 'armHB', group: 'scissor', mesh: armB, color: 'yellow', name: '剪叉升降臂' },
    { id: 'armFA', group: 'scissor', mesh: armA, color: 'yellow', name: '剪叉升降臂' },
    { id: 'armFB', group: 'scissor', mesh: armB, color: 'yellow', name: '剪叉升降臂' },

    { id: 'frame', color: 'blue', name: '上床架', note: '承托四段床板的钢架，被两组剪叉托着升降、倾斜。内侧两根纵梁一直伸到床尾，给小腿板的滚轮当轨道。',
      mesh: S.merge(...[-4.35, 4.35].map((z) => S.xf(S.box(19.6, 0.5, 0.3), { at: [0, -0.37, z] })),
        ...[-ROLLER_Z, ROLLER_Z].map((z) => S.xf(S.box(16.5, 0.26, 0.3), { at: [1.35, RAIL_TOP - 0.13, z] })),
        ...[-9.6, -8.0, -6.5, -4.4, 1.4, 6.5, 9.6].map((x) => S.xf(S.cyl(0.12, 8.7, { axis: 'z', seg: 10 }), { at: [x, -0.4, 0] })),
        S.xf(S.box(0.3, 0.65, 0.3), { at: [1.4, -0.72, -0.9] }), S.xf(S.box(0.3, 0.85, 0.3), { at: [-4.4, -0.82, 0.9] })) },
    { id: 'seat', parent: 'frame', mesh: panel(L_SEAT), at: [X_BACK + L_SEAT / 2, HY, 0], color: 'steel', name: '座板（固定）' },
    { id: 'back', group: 'back', parent: 'frame', at: [X_BACK, HY, 0], color: 'green', label: '靠背板', anchor: [-5.0, 0.06, -4.5], note: '最多抬到 75°，下面焊着一根摆臂给推杆顶。',
      mesh: S.merge(S.xf(panel(L_BACK), { at: [-L_BACK / 2, 0, 0] }), S.xf(S.box(0.25, 1.55, 0.25), { at: [BACK_LEVER[0], BACK_LEVER[1] / 2 - 0.03, -0.9] }),
        S.xf(S.box(0.9, 0.25, 0.25), { at: [-0.45, -0.12, -0.9] })) },
    { id: 'thigh', group: 'knee', parent: 'frame', at: [X_THIGH, HY, 0], color: 'pink', label: '大腿板', anchor: [1.6, 0.06, -4.5], note: '屈膝推杆把它顶起最多 35°。',
      mesh: S.merge(S.xf(panel(L_THIGH), { at: [L_THIGH / 2, 0, 0] }), S.xf(S.box(0.25, 1.75, 0.25), { at: [KNEE_LEVER[0], KNEE_LEVER[1] / 2 - 0.03, 0.9] })) },
    { id: 'leg', group: 'knee', parent: 'frame', at: [X_THIGH + L_THIGH, HY, 0], color: 'pink', label: '小腿板', anchor: [4.4, 0.06, -4.5],
      note: '没有自己的推杆：一头铰在大腿板上，尾端两只滚轮压在床架内纵梁上滑，自动跟出 0–16° 的斜面。',
      mesh: legMesh },
    { id: 'mBack', parent: 'back', group: 'back', mesh: mattress(L_BACK), at: [-L_BACK / 2, 0.56, 0], color: 'sky', glass: true, label: '床垫', anchor: [-2.0, 0.5, 4.5],
      note: '分四段，跟着床板一起折；点“透视”可以看到下面的床板和机构。', explode: [0, 3, 0], hatch: false },
    { id: 'mSeat', parent: 'seat', mesh: mattress(L_SEAT), at: [0, 0.56, 0], color: 'sky', glass: true, explode: [0, 3, 0], hatch: false, name: '床垫' },
    { id: 'mThigh', parent: 'thigh', group: 'knee', mesh: mattress(L_THIGH), at: [L_THIGH / 2, 0.56, 0], color: 'sky', glass: true, explode: [0, 3, 0], hatch: false, name: '床垫' },
    { id: 'mLeg', parent: 'leg', group: 'knee', mesh: mattress(L_LEG), at: [L_LEG / 2, 0.56, 0], color: 'sky', glass: true, explode: [0, 3, 0], hatch: false, name: '床垫' },

    // 示意病人：每一段身体跟着它下面那段床垫走（透视时变成虚线）
    { id: 'torso', group: 'patient', parent: 'mBack', mesh: S.merge(ell(2.6, 0.95, 2.1), ...[-1, 1].map((s) => S.xf(ell(2.2, 0.45, 0.45), { at: [0.3, -0.2, s * 2.45] }))), at: [0.35, 0.5 + 0.95, 0],
      color: GOWN, glass: true, hatch: false, label: '病人（示意）', anchor: [0, 0.9, 0], note: '身高约 1.65 m。每一段身体都跟着下面那段床板转。', explode: [0, 6, 0] },
    { id: 'head', group: 'patient', parent: 'mBack', mesh: ell(0.95, 0.85, 0.85), at: [-3.15, 0.5 + 0.85, 0], color: SKIN, glass: true, hatch: false, name: '病人（示意）', explode: [0, 6, 0] },
    { id: 'pelvis', group: 'patient', parent: 'mSeat', mesh: ell(1.5, 0.9, 1.9), at: [0, 0.5 + 0.9, 0], color: GOWN, glass: true, hatch: false, name: '病人（示意）', explode: [0, 6, 0] },
    { id: 'thighs', group: 'patient', parent: 'mThigh', mesh: S.merge(...[-1, 1].map((s) => S.xf(ell(1.75, 0.62, 0.72), { at: [0, 0, s * 0.9] }))), at: [0, 0.5 + 0.62, 0],
      color: GOWN, glass: true, hatch: false, name: '病人（示意）', explode: [0, 6, 0] },
    { id: 'shins', group: 'patient', parent: 'mLeg', mesh: S.merge(...[-1, 1].flatMap((s) => [S.xf(ell(2.3, 0.48, 0.55), { at: [-0.8, 0, s * 0.9] }), S.xf(S.box(0.45, 1.3, 0.85), { at: [1.75, 0.55, s * 0.9] })])),
      at: [0, 0.5 + 0.48, 0], color: SKIN, glass: true, hatch: false, name: '病人（示意）', explode: [0, 6, 0] },

    { id: 'railHL', parent: 'back', mesh: railMesh(5.0), at: [-4.1, 1.95, 4.75], color: 'purple', label: '护栏', anchor: [-1.6, 1.1, 0.1],
      note: '床头两片护栏装在靠背上，靠背抬起它们一起转，病人坐起来也有扶手。', explode: [0, 0, 2] },
    { id: 'railHR', parent: 'back', mesh: railMesh(5.0), at: [-4.1, 1.95, -4.75], color: 'purple', explode: [0, 0, -2], name: '护栏' },
    { id: 'railFL', parent: 'frame', mesh: railMesh(6.0), at: [4.6, 1.95, 4.75], color: 'purple', explode: [0, 0, 2], name: '护栏' },
    { id: 'railFR', parent: 'frame', mesh: railMesh(6.0), at: [4.6, 1.95, -4.75], color: 'purple', explode: [0, 0, -2], name: '护栏' },
    { id: 'headboard', parent: 'frame', mesh: board(), at: [-10.05, 1.0, 0], color: 'teal', explode: [-2.5, 0, 0], name: '床头板' },
    { id: 'footboard', parent: 'frame', mesh: board(), at: [10.05, 1.0, 0], color: 'teal', explode: [2.5, 0, 0], name: '床尾板' },
    { id: 'pendant', parent: 'frame', group: 'pendant', color: 'purple', label: '手控器', anchor: [0, 0.4, 0.13],
      note: '手控器外形与信号路线的动画示意，未对应真实产品的按键及控制逻辑。',
      mesh: S.merge(S.box(0.5, 1.3, 0.22), S.xf(S.cyl(0.05, 0.6, { seg: 6 }), { at: [0, 0.95, -0.05] }),
        ...[0.35, 0.05, -0.25].flatMap((y) => [-0.11, 0.11].map((x) => S.xf(S.box(0.16, 0.16, 0.06), { at: [x, y, 0.13] })))), at: [2.8, 0.5, 4.98] },
    // 线缆分开画，两端各是一个接口（零件清单会核对两端都接上）
    { id: 'cablePend', parent: 'frame', group: 'cables', color: 'slate', pick: false, dim: false, name: '手控器线',
      mesh: S.tube(S.curve([[2.8, -0.15, 4.98], [2.6, -0.9, 4.85], [-4.0, -1.0, 4.0], [-7.0, -0.95, 1.4], [-7.35, -0.9, 0.9]], 6), 0.045, { seg: 5 }) },
    { id: 'cableBack', parent: 'frame', group: 'cables', color: 'slate', pick: false, dim: false, name: '靠背推杆电源线',
      mesh: S.tube(S.curve([[-7.35, -0.95, -0.7], [-6.8, -1.05, -1.4], [0.6, -1.05, -1.4], [BACK_MOUNT[0], BACK_MOUNT[1], -1.07]], 6), 0.045, { seg: 5 }) },
    { id: 'cableKnee', parent: 'frame', group: 'cables', color: 'slate', pick: false, dim: false, name: '屈膝推杆电源线',
      mesh: S.tube(S.curve([[-7.35, -0.95, 0.7], [-6.8, -1.25, 1.4], [-5.0, -1.25, 1.4], [KNEE_MOUNT[0], KNEE_MOUNT[1], 1.07]], 6), 0.045, { seg: 5 }) },
    { id: 'cbox', parent: 'frame', role: 'shell', color: 'purple', label: '控制盒', anchor: [0.65, 0, 0.6],
      note: '把 220 V 交流电变成 24 V 直流，按手控器的指令给对应推杆通电、换向。', mesh: S.box(1.3, 0.7, 2.4), at: [-8.0, -0.85, 0], explode: [0, -1.8, 0] },
    { id: 'cboxIn', parent: 'cbox', role: 'inside', in: 'cbox', color: 'green', name: '控制板',
      note: '继电器决定电机正转还是反转——推杆是伸还是缩。',
      mesh: S.merge(S.xf(S.box(1.1, 0.06, 2.1), { at: [0, -0.2, 0] }), S.xf(S.box(0.45, 0.38, 0.5), { at: [-0.25, 0.03, -0.6] }),
        ...[-0.8, -0.3, 0.3, 0.8].map((z) => S.xf(S.box(0.22, 0.22, 0.26), { at: [0.3, -0.06, z] }))) }
  );
  const A_LH = actuator('liftH', { A: [-LIFT_MOUNT, ROLL_Y, -2.0], range: R.liftH, mz: 1, color: 'orange', group: 'liftH',
    label: '床头升降推杆', note: `行程 ${mm(R.liftH)} mm。收回 → 剪叉立起 → 床头升高。` });
  const A_LF = actuator('liftF', { A: [LIFT_MOUNT, ROLL_Y, 2.0], range: R.liftF, mz: -1, color: 'orange', group: 'liftF',
    label: '床尾升降推杆', note: '和床头那根一起动就是升降；只动一根就是倾斜。' });
  const A_B = actuator('backAct', { parent: 'frame', A: [BACK_MOUNT[0], BACK_MOUNT[1], -0.9], range: R.back, mz: -1, color: 'green', group: 'backAct',
    label: '靠背推杆', note: `伸出 ${mm(R.back)} mm，靠背从 0° 转到 75°。`,
    motorLabel: '直流电机', motorNote: '24 V 直流电机，经齿轮减速后带动丝杠。',
    screwLabel: '丝杠', screwNote: '丝杠转，螺母不能转只能走，于是内管伸出或缩回——把转动变成直线推力。' });
  const A_K = actuator('kneeAct', { parent: 'frame', A: [KNEE_MOUNT[0], KNEE_MOUNT[1], 0.9], range: R.knee, mz: 1, color: 'pink', group: 'kneeAct',
    label: '屈膝推杆', note: `伸出 ${mm(R.knee)} mm，大腿板从 0° 转到 35°。` });

  // —— 零件清单（Truth first） ——
  // 支撑：脚轮落地（地面没画，记 free）；剪叉一头在底架一头在床架；推杆尾座铰在底架/床架上。
  // 驱动：每根推杆内管末端的销，套在被推零件的摆臂端点上（推杆的目标点就是摆臂端点，所以理论距离 0）。
  // 线缆：手控器 → 控制盒 → 两根床架上的推杆；升降推杆装在底架上，线是随床升降的软线，这里只用电流粒子表示。
  const MANIFEST = {
    casters: { on: 'free' }, base: { on: 'casters' }, brake: { on: 'casters' },
    pedalH: { on: 'brake' }, pedalF: { on: 'brake' }, brakeLink: { on: 'brake' },
    armHA: { on: ['base', 'frame'] }, armHB: { on: ['base', 'frame'], drive: { by: 'liftHR', at: [0, 0, -2.0] } },
    armFA: { on: ['base', 'frame'] }, armFB: { on: ['base', 'frame'], drive: { by: 'liftFR', at: [0, 0, 2.0] } },
    frame: { on: ['armHA', 'armHB', 'armFA', 'armFB'] },
    liftH: { on: 'base' }, liftF: { on: 'base' }, backAct: { on: 'frame' }, kneeAct: { on: 'frame' },
    back: { on: 'frame', drive: { by: 'backActR', at: [BACK_LEVER[0], BACK_LEVER[1], -0.9] } },               // 靠背摆臂端 ← 靠背推杆
    thigh: { on: 'frame', drive: { by: 'kneeActR', at: [KNEE_LEVER[0], KNEE_LEVER[1], 0.9] } },              // 大腿板摆臂端 ← 屈膝推杆
    leg: { on: 'frame', drive: { by: 'frame', at: [L_LEG - 0.1, ROLL_CY - ROLLER_R, ROLLER_Z], tol: 0.06 } }, // 滚轮最低点（从建网格用的同一个常数算）压在内纵梁顶面
    pendant: { on: 'railFL' },
    cablePend: { connects: ['pendant', 'cbox'] }, cableBack: { connects: ['cbox', 'backAct'] }, cableKnee: { connects: ['cbox', 'kneeAct'] }
  };

  const lime = { color: 'lime', count: 12, size: 0.1, speed: 9, role: 'part' };
  const W = (st, p) => toWorld(st, p).map((v, i) => (i === 2 ? p[2] : v));
  const rollerWorld = (u) => { const st = state(u), K = kneePt(st.phi), r = rotz(-st.psi, [L_LEG - 0.1, RAIL_TOP - HY + ROLLER_R]); return W(st, [K[0] + r[0], K[1] + r[1], ROLLER_Z]); };
  const steps = [
    { id: 'brake', name: '踩刹车', color: '#ff6b6b', active: ['brakeSys'], view: { yaw: -40, pitch: 14, zoom: 2.1, focus: [8.6, 1.4, 2.2] },
      text: '观察脚踏、六角轴与拉杆的联动示意；真实制动结构和效果未验证。' },
    { id: 'up', name: '升床', color: 'orange', active: ['liftH', 'liftF', 'scissor', 'pendant'], flows: ['cmd', 'pLiftH', 'pLiftF'],
      text: '观察两组推杆与剪叉共同改变床面高度；高度和运动路径是模型设定。' },
    { id: 'knee', name: '屈膝', color: 'pink', active: ['thigh', 'leg', 'kneeAct', 'pendant'], flows: ['cmd', 'pKnee'], view: { yaw: -16, pitch: 10, zoom: 1.25 },
      text: '观察推杆、大腿板与小腿板的关联。角度为动画算例，非实际使用范围。' },
    { id: 'back', name: '抬背', color: 'green', active: ['back', 'backAct', 'pendant'], flows: ['cmd', 'pBack'],
      text: '观察靠背、推杆与护栏随动。不表示能防止人体滑移，也不验证护栏安全效果。' },
    { id: 'flat', name: '放平', color: 'teal', active: ['backAct', 'kneeAct', 'back', 'thigh', 'leg'], flows: ['cmd', 'pBack', 'pKnee'],
      text: '观察模型中的靠背与膝板回到水平。' },
    { id: 'tilt', name: '头低脚高', color: '#4d96ff', active: ['liftH', 'scissor'], flows: ['cmd', 'pLiftH'], view: { yaw: -2, pitch: 6, zoom: 1.1 },
      text: '观察两端高度不同时的床面倾斜。仅作结构示意，不说明任何医疗适应症或治疗用途。' },
    { id: 'down', name: '降床', color: 'blue', active: ['liftF', 'scissor'], flows: ['cmd', 'pLiftF'],
      text: '观察模型降低并回到水平；能否上下床需结合真实产品与使用者评估。' }
  ];
  steps.forEach((s) => { s.from = T[s.id][0]; s.to = T[s.id][1]; });

  return {
    manifest: MANIFEST,
    fig: '图 2',
    title: '电动护理床：按一下，动一下',
    subtitle: '用户底稿 · 彩绘结构与动作示意 · 所有尺寸、角度与读数均为模型算例',
    view: { yaw: -24, pitch: 17, zoom: 1.05 },
    autoplay: false, sway: false,
    cycle: 36, labels: 'step',
    mode: 'buttons',
    intro: '按按钮分步观察模型动画；顺序是演示设定，不作为护理操作指导。点“模式”可切回自动循环。',
    buttons: [
      { id: 'brake', label: '踩刹车', steps: [1] },
      { id: 'up', label: '升床', steps: [2], hint: '演示顺序：先观察“踩刹车”环节。实际护理顺序应另行核实。' },
      { id: 'knee', label: '屈膝', steps: [3] },
      { id: 'back', label: '抬背', steps: [4], hint: '演示顺序：先观察“屈膝”环节；本模型不验证人体滑移或安全效果。' },
      { id: 'flat', label: '放平', steps: [5] },
      { id: 'tilt', label: '头低脚高', steps: [6], hint: '演示顺序：先观察“放平”环节；不作为真实体位调整指导。' },
      { id: 'down', label: '降床', steps: [7] }
    ],
    closeups: [
      { name: 'brake-pedal', focus: [8.9, 1.42, 3.6], step: 1, zoom: 4, yaw: -30, pitch: 18 },
      { name: 'scissor-roller', focus: 'liftHR', step: 2, zoom: 3.5 },
      { name: 'knee-lever', focus: 'kneeActR', step: 3, zoom: 4 },
      { name: 'leg-roller', focus: rollerWorld(0.37), step: 3, zoom: 4.5, yaw: -10, pitch: 6 },
      { name: 'back-lever', focus: 'backActR', step: 4, zoom: 3.5 },
      { name: 'cbox', focus: 'cbox', step: 2, zoom: 3.5, xr: 1 }
    ],
    parts,
    flows: [
      Object.assign({ id: 'cmd', parent: 'frame', from: 'pendant', to: 'cbox', path: S.curve([[2.8, -0.15, 4.98], [2.6, -0.9, 4.85], [-4.0, -1.0, 4.0], [-7.0, -0.95, 1.4], [-7.35, -0.9, 0.9]], 6) }, lime),
      Object.assign({ id: 'pBack', parent: 'frame', from: 'cbox', to: 'backAct', path: S.curve([[-7.35, -0.95, -0.7], [-6.8, -1.05, -1.4], [0.6, -1.05, -1.4], [BACK_MOUNT[0], BACK_MOUNT[1], -1.07]], 6) }, lime),
      Object.assign({ id: 'pKnee', parent: 'frame', from: 'cbox', to: 'kneeAct', path: S.curve([[-7.35, -0.95, 0.7], [-6.8, -1.25, 1.4], [-5.0, -1.25, 1.4], [KNEE_MOUNT[0], KNEE_MOUNT[1], 1.07]], 6) }, lime),
      Object.assign({}, lime, { id: 'pLiftH', role: 'inside', from: 'cbox', to: 'liftH', tol: 0.3, path: (u) => { const st = state(u); return [W(st, [-7.35, -1.2, -0.8]), W(st, [-7.4, -1.6, -1.45]), [-7.3, 2.5, -1.45]]; } }),
      Object.assign({}, lime, { id: 'pLiftF', role: 'inside', from: 'cbox', to: 'liftF', tol: 0.3, path: (u) => { const st = state(u); return [W(st, [-7.35, -1.2, 0.8]), W(st, [-6.0, -1.3, 1.45]), W(st, [6.8, -1.3, 1.45]), [7.3, 2.5, 1.45]]; } })
    ],
    steps,
    animate(u, api) {
      const st = state(u);
      api.set('frame', { pos: [0, st.Hc, 0], rot: [0, 0, st.t] });
      api.set('back', { rot: [0, 0, -st.a] });
      api.set('thigh', { rot: [0, 0, st.phi] });
      const K = kneePt(st.phi);
      api.set('leg', { pos: [K[0] - (X_THIGH + L_THIGH), K[1] - HY, 0], rot: [0, 0, -st.psi] });
      const h = scissor(st, -1), f = scissor(st, 1);
      api.set('armHA', { pos: [h.xp, ROLL_Y, 0], rot: [0, 0, h.beta] });
      api.set('armHB', { pos: [h.xr, ROLL_Y, 0], rot: [0, 0, 180 - h.beta] });
      api.set('armFA', { pos: [f.xp, ROLL_Y, 0], rot: [0, 0, 180 - f.beta] });
      api.set('armFB', { pos: [f.xr, ROLL_Y, 0], rot: [0, 0, f.beta] });
      setAct(api, A_LH, [h.xr, ROLL_Y]);
      setAct(api, A_LF, [f.xr, ROLL_Y], -1);
      setAct(api, A_B, backEnd(st.a));
      setAct(api, A_K, kneeEnd(st.phi));
      // 刹车：两头脚踏随六角轴转 20°（床尾外伸端向下），拉杆跟着平移
      api.set('pedalF', { rot: [0, 0, -20 * st.brake] });
      api.set('pedalH', { rot: [0, 0, 20 * st.brake] });
      api.set('brakeLink', { pos: [0.12 * st.brake, 0, 0] });
    },
    readout(u) {
      const st = state(u);
      return `模型算例 · 刹车 ${st.brake > 0.5 ? '锁' : '松'} · 床面 ${Math.round(st.Hc * 100)} mm · 靠背 ${Math.round(st.a)}° · 膝 ${Math.round(st.phi)}° · 小腿 ${Math.round(st.psi)}° · 倾斜 ${st.t.toFixed(1)}°`;
    },
    caption: '动作速度、尺寸、电压、行程与角度均为模型设定；内部结构与安全效果未核验。可透视或展开观察，不作为厂家装配图、护理操作或医疗指导。'
  };
};
export function createScene(){return prepareScene(makeScene(localRoot.Sketch3D.S,localRoot.Sketch3D.M),"care-bed");}
export function mount(host){const scene=createScene();const ctl=localRoot.Sketch3D.mount(host,scene);ctl.view(scene.view);ctl.play(false);return ctl;}
