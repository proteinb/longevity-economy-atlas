"""Apply production rendering changes to the reviewed Sketch3D inputs."""
import re


def optimize(engine, bed):
    def replace(old, new):
        nonlocal engine
        if old not in engine:
            raise ValueError(f'Sketch3D template mismatch: {old[:160]}')
        engine = engine.replace(old, new)

    replace("    let destroyed=false,viewHold=false;const lifecycle=new AbortController();", """    let destroyed = false, viewHold = false;
    const lifecycle = new AbortController();
    let raf = 0, last = null, camK = 1, easing = false, inFrame = false;
    let qualityTimer = 0, motionUntil = 0, fast = false;
    let pulsePart = null, pulseUntil = 0, pulse = 0.65;
    let liveDiagnostics = false, diagnosticsPending = false;
    function invalidate() {
      if (!raf && !inFrame && !destroyed && !document.hidden) raf = requestAnimationFrame(frame);
    }
    function interaction() {
      motionUntil = performance.now() + 150;
      invalidate();
    }
    function publishDiagnostics() {
      wrap.dataset.transforms = JSON.stringify(Object.fromEntries(parts.map(P => [P.id, P.W])));
      wrap.dataset.progress = u.toFixed(5);
      wrap.dataset.camera = [yaw, pitch, zoom].map(n => n.toFixed(3)).join(',');
      wrap.dataset.selected = pinned?.id || '';
    }
    function ease(current, target, amount, epsilon) {
      const next = easeTo(current, target, amount, epsilon);
      if (next !== target) easing = true;
      return next;
    }
""")
    replace("    const ctx = cv.getContext('2d');", """    const display = cv.getContext('2d');
    const preview = document.createElement('canvas');
    preview.className = 'sk-canvas-preview';
    preview.hidden = true;
    preview.setAttribute('aria-hidden', 'true');
    cv.after(preview);
    const previewContext = preview.getContext('2d');
    const fullPaint = canvasPaint(display), previewPaint = canvasPaint(previewContext);
    const fullStrokes = edgeBatch(display, fullPaint, seg);
    const previewStrokes = edgeBatch(previewContext, previewPaint, seg);
    let ctx = display, paint = fullPaint, strokes = fullStrokes;
    let firstRender = true, pickingDpr = 1, motionRenderer, motion;
    function setRenderSurface() {
      const width = Math.round(W * dpr), height = Math.round(H * dpr);
      if (fast && motionRenderer === undefined) {
        motionRenderer = createMotionRenderer();
        if (motionRenderer) {
          const layer = motionRenderer.canvas;
          layer.className = 'sk-motion';
          layer.hidden = true;
          layer.setAttribute('aria-hidden', 'true');
          preview.before(layer);
        }
      }
      motion = fast && motionRenderer?.begin(width, height) ? motionRenderer : null;
      if (motionRenderer && motionRenderer.canvas.hidden === !!motion) {
        motionRenderer.canvas.hidden = !motion;
      }
      if (preview.hidden === fast) preview.hidden = !fast;
      stage.classList.toggle('sk-previewing', fast);
      ctx = fast ? previewContext : display;
      paint = fast ? previewPaint : fullPaint;
      strokes = fast ? previewStrokes : fullStrokes;
      if (fast && (preview.width !== width || preview.height !== height)) {
        preview.width = width;
        preview.height = height;
        previewPaint.reset();
      }
    }
    const colors = new Map();
    function cachedColor(c) {
      const key = ((c[0] | 0) << 16) | ((c[1] | 0) << 8) | (c[2] | 0);
      let value = colors.get(key);
      if (value === undefined) { value = css(c); colors.set(key, value); }
      return value;
    }""")
    replace(".sk-stage.drag .sk-canvas{", """.sk-motion,.sk-canvas-preview{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.sk-previewing .sk-canvas{opacity:0}
.sk-stage.drag .sk-canvas{""")
    replace("    const resetView = () => { yaw", "    const resetView = () => { viewHold=false; invalidate(); yaw")
    replace("    function setU(x) {cancelAll();", "    function setU(x) {invalidate();cancelAll();")
    replace("    function syncButtons() {syncAll();", "    function syncButtons() {invalidate();syncAll();")
    replace("    function showNote(P) {", "    function showNote(P) {\n      invalidate();")
    replace("hoverPart = P; });", "hoverPart = P; invalidate(); });")
    replace("if (hoverPart === P) hoverPart = null; });", "if (hoverPart === P) hoverPart = null; invalidate(); });")
    replace("b.addEventListener('click', fn);", "b.addEventListener('click', (event) => { fn(event); invalidate(); });")
    replace("      let scrub = false;\n", "")
    replace("scrub = true; bar.setPointerCapture", "scrubbing = true; interaction(); bar.setPointerCapture")
    replace("if (scrub) scrubTo(e);", "if (scrubbing) { interaction(); scrubTo(e); }")
    replace("bar.addEventListener('pointerup', () => { scrub = false; playing = wasPlaying; syncButtons(); });",
            """const endScrub = () => { scrubbing = false; playing = wasPlaying; interaction(); syncButtons(); };
      bar.addEventListener('pointerup', endScrub);
      bar.addEventListener('pointercancel', endScrub);""")
    replace("    let hatch = null;", """    let hatch = null, scrubbing = false;
    const coarsePointer = matchMedia('(pointer: coarse)');""")
    replace("const r = stage.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);",
            """const r = stage.getBoundingClientRect();
      const nextDpr = Math.min(window.devicePixelRatio || 1, coarsePointer.matches || window.innerWidth < 640 ? 1.5 : 2);
      if (W === r.width && H === r.height && dpr === nextDpr) {
        measureLabels();
        return;
      }
      W = r.width; H = r.height; dpr = nextDpr;""")
    replace("      labeled.forEach((P) => { P.L.w = P.L.el.offsetWidth || 80; P.L.h = P.L.el.offsetHeight || 26; });",
            """      measureLabels();
    }
    function measureLabels() {
      for (const { L } of labeled) {
        const width = L.el.offsetWidth || 80, height = L.el.offsetHeight || 26;
        if (width === L.w && height === L.h) continue;
        L.w = width; L.h = height;
        invalidate();
      }""")
    replace("      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);",
            "      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);\n      fullPaint.reset();\n      invalidate();")
    replace("hatch = ctx.createPattern(hc, 'repeat');", "hatch = display.createPattern(hc, 'repeat');")
    replace("    const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(stage); resize();",
            """    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(stage);
    window.addEventListener('resize', resize, { signal: lifecycle.signal });
    coarsePointer.addEventListener('change', resize, { signal: lifecycle.signal });
    resize();""")
    replace("      stage.classList.add('drag');", "      interaction();\n      stage.classList.add('drag');")
    replace("      if (!ptrs.has(e.pointerId)) return;", """      if (!ptrs.has(e.pointerId)) {
        const previous = hoverPart;
        stageHover(pick(mouse));
        if (hoverPart !== previous) invalidate();
        return;
      }
      interaction();""")
    replace("      ptrs.delete(e.pointerId); stage.classList.remove('drag');",
            "      ptrs.delete(e.pointerId); interaction(); if (!ptrs.size) stage.classList.remove('drag');")
    replace("() => { mouse = null; });", "() => { mouse = null; invalidate(); });")
    replace("e.preventDefault(); zoom = clamp(zoom * Math.exp", "e.preventDefault(); interaction(); zoom = clamp(zoom * Math.exp")
    replace("() => { labelHover = false; });", "() => { labelHover = false; invalidate(); });")
    begin = engine.index('    let onScreen = true;')
    end = engine.index('    /* —— 投影', begin)
    engine = engine[:begin] + """    const visibilityHandler = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        clearTimeout(qualityTimer);
        raf = 0;
        last = null;
        playing = false;
        syncButtons();
      } else {
        invalidate();
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);

""" + engine[end:]
    replace("focusCur[i] += (fT[i] - focusCur[i]) * camK;", "focusCur[i] = ease(focusCur[i], fT[i], camK);")
    replace("    let last = performance.now(), raf = 0, camK = 1;\n", "")
    replace("      const dt = Math.min(0.05, (now - last) / 1000); last = now;\n      if (!onScreen||destroyed) return;",
            """      if (document.hidden || destroyed) return;
      inFrame = true;
      const dt = last === null ? 1 / 60 : Math.min(0.1, Math.max(0, (now - last) / 1000));
      last = now;
      easing = false;""")
    begin = engine.index('      xray += (xrayT - xray)')
    end = engine.index('      if (!ptrs.size && camGoal)', begin)
    engine = engine[:begin] + """      xray = ease(xray, xrayT, reduce ? 1 : Math.min(1, dt * 6));
      if (expl !== expT) {
        expl = ease(expl, expT, reduce ? 1 : Math.min(1, dt * 8));
        expRange.value = String(Math.round(expl * 100));
        expOutput.textContent = expRange.value + '%';
      }
      const explodeText = expl.toFixed(4);
      if (wrap.dataset.explode !== explodeText) wrap.dataset.explode = explodeText;
""" + engine[end:]
    replace("if (Math.abs(dy) < 0.2 && Math.abs(camGoal.pitch - pitch) < 0.2 && Math.abs(camGoal.zoom - zoom) < 0.003) camGoal = null;", """if (Math.abs(dy) < 0.2 && Math.abs(camGoal.pitch - pitch) < 0.2 && Math.abs(camGoal.zoom - zoom) < 0.003) {
          yaw += dy * (1 - k);
          pitch = camGoal.pitch;
          zoom = camGoal.zoom;
          camGoal = null;
        }""")
    replace("        idle += dt;\n        if (!reduce && scene.sway !== false && idle > 4) { swayT += dt; swayAmp = Math.min(16, swayAmp + dt * 6); sway = swayAmp * Math.sin(swayT * 0.35); }\n", "")
    begin = engine.index('      render(dt);')
    end = engine.index('    function render(dt)', begin)
    engine = engine[:begin] + """      if (pinned !== pulsePart) {
        pulsePart = pinned;
        pulseUntil = pinned && !reduce ? now + 3000 : 0;
      }
      pulse = playing || now < pulseUntil ? 0.65 + 0.35 * Math.sin(now / 260) : 0.65;
      const moving = playing || vyaw || vpitch || camGoal || xray !== xrayT || expl !== expT;
      if (moving) motionUntil = performance.now() + 150;
      fast = !!(moving || ptrs.size || scrubbing || now < motionUntil);
      render(dt);
      if (liveDiagnostics || diagnosticsPending) {
        publishDiagnostics();
        diagnosticsPending = false;
      }
      inFrame = false;
      clearTimeout(qualityTimer);
      if (playing || (!ptrs.size && (vyaw || vpitch || camGoal)) || easing || now < pulseUntil) {
        invalidate();
      } else {
        last = null;
        if (fast && !ptrs.size && !scrubbing) {
          qualityTimer = setTimeout(invalidate, Math.max(0, motionUntil - performance.now()));
        }
      }
    }

""" + engine[end:]
    engine = re.sub(r"      wrap\.dataset\.transforms=.*\n", "", engine)
    replace("      const pulse = 0.65 + 0.35 * Math.sin(performance.now() / 260);\n", "")
    replace("        P.glowA += ((P.isOn ? 1 : 0) - P.glowA) * Math.min(1, dt * 8);",
            "        P.glowA = ease(P.glowA, P.isOn ? 1 : 0, Math.min(1, dt * 8));")
    replace("F.cur += (target - F.cur) * Math.min(1, dt * 6);", "F.cur = ease(F.cur, target, Math.min(1, dt * 6));")
    replace("0.75 + 0.25 * Math.sin(performance.now() / 260)", "0.75 + 0.25 * (pulse - 0.65) / 0.35")
    replace("    let drawn = [];", """    const drawn = [];
    const items = [], shells = [], inside = [], ground = [], list = [], mixed = [];
    const cont = Object.create(null), zC = Object.create(null), inserted = new Set();
    const active = new Set();
    const byZ = (a, b) => a.z - b.z;""")
    replace("    function inPoly(x, y, xs, ys) { let c = false; for (let i = 0, j = xs.length - 1; i < xs.length; j = i++) if ((ys[i] > y) !== (ys[j] > y) && x < ((xs[j] - xs[i]) * (y - ys[i])) / (ys[j] - ys[i]) + xs[i]) c = !c; return c; }",
            """    function inPoly(x, y, { P, fi }) {
      const indices = P.mesh.f[fi].i, xs = P.sx, ys = P.sy;
      let inside = false;
      for (let i = 0, j = indices.length - 1; i < indices.length; j = i++) {
        const a = indices[i], b = indices[j];
        if ((ys[a] > y) !== (ys[b] > y) && x < (xs[b] - xs[a]) * (y - ys[a]) / (ys[b] - ys[a]) + xs[a]) inside = !inside;
      }
      return inside;
    }""")
    replace("it.a < 0.45", "it.P.a < 0.45")
    replace("inPoly(x, y, it.xs, it.ys)", "inPoly(x, y, it)")
    replace(", active = new Set(expl>0?[]:step ? step.set : []);", ";\n      active.clear();\n      if (expl === 0 && step) for (const P of step.set) active.add(P);")
    replace("      const items = [], shells = [], inside = [], ground = [], cont = {};\n      const eye = [0, 0, cam.D];",
            """      items.length = shells.length = inside.length = ground.length = list.length = mixed.length = 0;
      for (const key in cont) cont[key].length = 0;""")
    replace("P.vis = null; ", "")
    start = engine.index('        if (!P.sx ||')
    end = engine.index('        const glass',start)
    engine = engine[:start] + """        if (!P.sx) {
          P.sx = new Float32Array(n);
          P.sy = new Float32Array(n);
          P.vis = new Int32Array(P.mesh.f.length);
          P.faceItems = P.mesh.f.map((face, fi) => {
            const center = [0, 0, 0];
            for (const index of face.i) for (let axis = 0; axis < 3; axis++) center[axis] += V[index][axis];
            for (let axis = 0; axis < 3; axis++) center[axis] /= face.i.length;
            return { k: 0, P, fi, center, z: 0, tone: 0 };
          });
          P.loops = P.mesh.f.map(f => [f.i, ...(f.h || [])]);
        }
        const cpos = fast ? null : (P.cpos ||= new Float64Array(n * 3));
        for (let i = 0; i < n; i++) {
          const vertex = V[i], x = vertex[0], y = vertex[1], z = vertex[2];
          const cx = C[0] * x + C[1] * y + C[2] * z + C[9];
          const cy = C[3] * x + C[4] * y + C[5] * z + C[10];
          const cz = C[6] * x + C[7] * y + C[8] * z + C[11];
          if (cpos) {
            const offset = i * 3;
            cpos[offset] = cx; cpos[offset + 1] = cy; cpos[offset + 2] = cz;
          }
          const scale = cam.D / (cam.D - cz);
          P.sx[i] = cam.cx + cx * scale * cam.K;
          P.sy[i] = cam.cy - cy * scale * cam.K;
        }
        P.vis.fill(-1);
""" + engine[end:]
    start = engine.index('        P.mesh.f.forEach((f, fi) => {', engine.index('    function render(dt)'))
    end = engine.index('        if (P.def.glow',start)
    engine = engine[:start] + """        const line = cachedColor(P.isDim ? mixc(P.line, WHITE, 0.45) : P.line);
        P.lineColor = line;
        P.glowColor = P.glowA > 0.02 && !fast ? cachedColor(mixc(P.base, WHITE, 0.62 - 0.22 * pulse)) : null;
        const palette = P.isOn ? P.hot : P.isDim ? P.off : P.tones;
        P.fillColors ||= [];
        for (let i = 0; i < 3; i++) {
          P.fillColors[i] = cachedColor(P.isOn ? mixc(palette[i], WHITE, (1 - pulse) * 0.18) : palette[i]);
        }
        const local = fast ? localLighting(C, cam.D, LIGHT) : null;
        for (let fi = 0; fi < P.mesh.f.length; fi++) {
          const item = P.faceItems[fi], normal = P.fn[fi], center = item.center;
          let cz = C[6] * center[0] + C[7] * center[1] + C[8] * center[2] + C[11];
          let front, shade;
          if (local) {
            const eye = local.eye;
            front = normal[0] * (eye[0] - center[0]) + normal[1] * (eye[1] - center[1])
              + normal[2] * (eye[2] - center[2]) > 0;
            shade = dot(normal, local.light);
          } else {
            let cx = C[0] * center[0] + C[1] * center[1] + C[2] * center[2] + C[9];
            let cy = C[3] * center[0] + C[4] * center[1] + C[5] * center[2] + C[10];
            if (cpos) {
              cx = cy = cz = 0;
              const vertices = P.mesh.f[fi].i;
              for (const index of vertices) {
                const offset = index * 3;
                cx += cpos[offset]; cy += cpos[offset + 1]; cz += cpos[offset + 2];
              }
              cx /= vertices.length; cy /= vertices.length; cz /= vertices.length;
            }
            const n = apR(C, normal);
            front = -n[0] * cx - n[1] * cy + n[2] * (cam.D - cz) > 0;
            shade = dot(n, LIGHT) / (vlen(n) || 1);
          }
          if (!front && !P.def.double) continue;
          const d = front ? shade : -shade;
          item.z = cz + (P.def.bias || 0);
          item.tone = d > 0.55 ? 0 : d > 0.1 ? 1 : 2;
          bucket.push(item);
        }
""" + engine[end:]
    replace("      const byZ = (a, b) => a.z - b.z;\n", "")
    replace("      let list;\n", "      for (const item of ground) list.push(item);\n")
    replace("const mixed = items.concat(shells).sort(byZ), done = new Set();",
            "mixed.push(...items, ...shells); mixed.sort(byZ); inserted.clear();")
    replace("const zIn = zMin(inside), zC = {};", "const zIn = zMin(inside);")
    replace("let first = !inside.length; list = ground.slice();", "let first = !inside.length;")
    replace("!done.has(key)", "!inserted.has(key)")
    replace("done.add(key); for (const x of cont[key])", "inserted.add(key); for (const x of cont[key])")
    replace("} else list = ground.concat(items.concat(inside, ...Object.values(cont)).sort(byZ));",
            """} else {
        mixed.push(...items, ...inside);
        for (const key in cont) for (const item of cont[key]) mixed.push(item);
        mixed.sort(byZ);
        for (const item of mixed) list.push(item);
      }""")
    replace("ground.sort(byZ); items.sort(byZ); shells.sort(byZ); inside.sort(byZ);", "ground.sort(byZ); inside.sort(byZ);")
    replace("      drawn = [];", "      drawn.length = 0;")
    start = engine.index('      // 描边时机：', engine.index('    function render(dt)')) if bed else engine.index('      for (let i = 0; i < list.length; i++) {', engine.index('    function render(dt)'))
    end = engine.index('      for (let i = 0; i < list.length; i++) {', start) if bed else start
    engine = engine[:start] + """      // Flush at each paint boundary to preserve the painter's order.
      const strokeP = (P, edges) => {
        const alpha = Math.min(1, P.alpha), lineAlpha = alpha * (1 - 0.5 * P.glass);
        const dash = P.glass > 0.5;
        const width = LW * (P.def.lineScale || 1) * (P.isOn ? 1.15 : 1);
        if (motion) {
          motion.edges(P, edges, P.lineColor, lineAlpha, width);
          return;
        }
        if (P.glowColor) strokes.add(P, edges, 1, P.glowColor, alpha * P.glowA, LW * 4.2, dash, BED_BLEND, dpr);
        strokes.add(P, edges, 1, P.lineColor, lineAlpha, width, dash, 'source-over', dpr);
        if (!fast && P.glass < 0.5) strokes.add(P, edges, 2, P.lineColor, lineAlpha * 0.32, LW * 0.6, false, 'source-over', dpr);
      };
""" .replace('BED_BLEND', "'darken'" if bed else "'source-over'") + ("""      // Edges with shared endpoints are drawn after their last adjacent visible face.

""" if bed else """      const own = [];
""") + engine[end:]
    start = engine.index('        const d = dot(it.n, LIGHT), tone')
    end = engine.index('        // 描边：',start)
    engine = engine[:start] + """        const tone = it.tone, col = P.fillColors[tone], a = P.a;
        // Marker fill is offset from the ink, including the inner contours.
        const ox = P.fill[0] * dpr * (1 - P.glass), oy = P.fill[1] * dpr * (1 - P.glass);
        if (motion) {
          it.triangles ||= triangulate(P.mesh.v, P.loops[it.fi], P.fn[it.fi]);
          motion.face(P, it.triangles, ox, oy, col, a);
        } else {
          ctx.beginPath();
          for (const loop of P.loops[it.fi]) {
            const first = loop[0];
            ctx.moveTo(P.sx[first] + ox, P.sy[first] + oy);
            for (let j = 1; j < loop.length; j++) {
              const vertex = loop[j];
              ctx.lineTo(P.sx[vertex] + ox, P.sy[vertex] + oy);
            }
            ctx.closePath();
          }
          paint.set('globalAlpha', a);
          paint.set('fillStyle', col);
          ctx.fill('evenodd');
          if (!fast && P.glass < 0.5 && a > 0.9) {
            paint.set('strokeStyle', col);
            paint.set('lineWidth', 0.6 * dpr);
            ctx.stroke();
          }
          if (!fast && style.hatch && P.def.hatch !== false && tone === 2 && P.glass < 0.4) {
            paint.set('globalAlpha', a * 0.28 * (1 - P.glass * 2) * (P.isDim ? 0.5 : 1));
            paint.set('fillStyle', hatch);
            ctx.fill('evenodd');
          }
        }
        drawn.push(it);
""" + engine[end:]
    if bed:
        replace("        if (it.k === 1) { dotItem(it); drawDue(i); continue; }", "        if (it.k === 1) { dotItem(it); continue; }")
        replace("        if (it.k === 2) { haloItem(it); drawDue(i); continue; }", "        if (it.k === 2) { haloItem(it); continue; }")
        replace("          let g = due.get(at); if (!g) due.set(at, (g = new Map()));\n          let arr = g.get(P); if (!arr) g.set(P, (arr = [])); arr.push(ei);",
                "          const item = list[at];\n          (item.edges ||= []).push(ei);")
        replace("        drawDue(i);", """        if (it.edges?.length) {
          strokeP(P, it.edges);
          strokes.flush();
          paint.dash(false, dpr);
          it.edges.length = 0;
        }""")
        replace("          for (const v of [e.a, e.b]) for (const fj of P.vf[v]) { const o = P.vis[fj]; if (o > at) at = o; }",
                "          for (const fj of P.vf[e.a]) if (P.vis[fj] > at) at = P.vis[fj];\n          for (const fj of P.vf[e.b]) if (P.vis[fj] > at) at = P.vis[fj];")
    else:
        replace("        const own = [];", "        own.length = 0;")
        start = engine.index('        const lineA = 1 - 0.5 * P.glass;', engine.index('        own.length = 0;'))
        end = engine.index('      }\n      ctx.globalAlpha = 1;', start)
        engine = engine[:start] + """        strokeP(P, own);
        strokes.flush();
        paint.dash(false, dpr);
""" + engine[end:]
    replace("      if (hoverPart == null && mouse && !ptrs.size) { /* 悬停拾取在下面做 */ }\n", "")
    replace("      stageHover(hp);", "      stageHover(hp);\n      if ((hoverPart || pinned) !== focus) easing = true;")
    replace("      if (knob) knob.style.left = `calc(${(u * 100).toFixed(3)}% - 1.5px)`;",
            "      if (knob) { const left = `calc(${(u * 100).toFixed(3)}% - 1.5px)`; if (knob.style.left !== left) knob.style.left = left; }")
    replace("L.x = L.x == null ? x : L.x + (x - L.x) * k; L.y = L.y == null ? y : L.y + (y - L.y) * k;",
            """const priorX = L.x, priorY = L.y;
          L.x = priorX == null ? x : priorX + (x - priorX) * k;
          L.y = priorY == null ? y : priorY + (y - priorY) * k;
          L.priorX = priorX; L.priorY = priorY;""")
    replace("          L.el.style.transform = `translate(${L.x.toFixed(1)}px,${L.y.toFixed(1)}px)`;\n        }\n        return;",
            """          if (Math.abs(L.x - L.priorX) > 0.05 || Math.abs(L.y - L.priorY) > 0.05) easing = true;
          L.el.style.transform = `translate(${L.x.toFixed(1)}px,${L.y.toFixed(1)}px)`;
        }
        return;""")
    replace("L.y + (L.ty - L.y) * k", "ease(L.y, L.ty, k, 0.05)")
    replace("L.x + (x - L.x) * k", "ease(L.x, x, k, 0.05)")
    # Paint operations within save/restore blocks keep using the context directly.
    replace("      runAnim(u); worlds(expl); setupCamera();", """      const displayDpr = dpr;
      if (fast) dpr = Math.min(dpr, 0.75);
      setRenderSurface();
      runAnim(u); worlds(expl); setupCamera();""")
    replace("ctx.clearRect(0, 0, cv.width, cv.height)", "ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)")

    replace("      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);",
            """      if (!motion) {
        paint.set('fillStyle', '#fff');
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        if (scene.ground !== false) groundShadow();
      }""")
    replace("      if (scene.ground !== false) groundShadow();\n      drawn.length", "      drawn.length")
    replace("      const hp = mouse && !ptrs.size ? pick(mouse) : null;", """      pickingDpr = dpr;
      const hp = mouse && !ptrs.size ? pick(mouse) : null;""")
    replace("const x = m[0] * dpr, y = m[1] * dpr;", "const x = m[0] * pickingDpr, y = m[1] * pickingDpr;")
    replace("      layoutLabels(active, anyActive, dt);", """      if (motion) motion.finish();
      layoutLabels(active, anyActive, dt);
      dpr = displayDpr;
      firstRender = false;""")
    replace("P.glowA = ease(P.glowA, P.isOn ? 1 : 0, Math.min(1, dt * 8));",
            "P.glowA = ease(P.glowA, P.isOn ? 1 : 0, firstRender || reduce ? 1 : Math.min(1, dt * 8));")
    replace("F.cur = ease(F.cur, target, Math.min(1, dt * 6));",
            "F.cur = ease(F.cur, target, firstRender || reduce ? 1 : Math.min(1, dt * 6));")
    replace("      const r = style.rough * dpr, ja", """      if (fast) {
        const x = P.sx[a], y = P.sy[a], endX = P.sx[b], endY = P.sy[b];
        if (Math.abs(endX - x) + Math.abs(endY - y) < 1) return;
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        return;
      }
      const r = style.rough * dpr, ja""")
    replace("      const g = ctx.createRadialGradient(it.q[0]", "      if (fast) return;\n      const g = ctx.createRadialGradient(it.q[0]")
    start = engine.index('    function render(dt)')
    end = engine.index('    function groundShadow()', start)
    section = engine[start:end].replace("ctx.fillStyle = '#fff';", "paint.set('fillStyle', '#fff');").replace("ctx.globalAlpha = 1;", "paint.set('globalAlpha', 1);")
    engine = engine[:start] + section + engine[end:]
    replace("    function dotItem(it) {", "    function dotItem(it) {\n      if (motion) { motion.dot(it.q[0], it.q[1], it.r, cachedColor(it.F.c), it.a); return; }")
    if bed:
        replace('animation:sk-pulse 1.4s ease-in-out infinite', 'animation:sk-pulse 1.4s ease-in-out 2')
    start = engine.index('    function dotItem(it)')
    end = engine.index('    /* —— 标签布局',start)
    engine = engine[:start] + re.sub(r'ctx\.(globalAlpha|fillStyle|strokeStyle|lineWidth) = ([^;]+);',r"paint.set('\1', \2);",engine[start:end]) + engine[end:]
    replace("    raf = requestAnimationFrame(frame);\n    const ctl", "    const ctl")
    replace("    return ctl;", "    invalidate();\n    return ctl;")
    replace("idle = -1e9; },", "invalidate(); },")
    replace("hoverPart = id ? byId[id] : null; },", "hoverPart = id ? byId[id] : null; invalidate(); },")
    replace("pinned = id ? byId[id] : null; if (pinned) showNote(pinned); },",
            "pinned = id ? byId[id] : null; if (pinned) showNote(pinned); invalidate(); },")
    replace("focusCur = (focusGoal || B0.c).slice(); },", "focusCur = (focusGoal || B0.c).slice(); invalidate(); },")
    replace("cancelAnimationFrame(raf);sizeObserver", "cancelAnimationFrame(raf);clearTimeout(qualityTimer);sizeObserver")
    engine = engine.replace(', swayAmp = 0, swayT = 0, idle = 99, sway = 0', '')
    engine = engine.replace('yaw += sway; sway = 0; swayAmp = 0; idle = 0;', '')
    engine = engine.replace('vyaw=vpitch=0;sway=0;', 'vyaw=vpitch=0;')
    engine = engine.replace('yaw + sway', 'yaw')
    engine = engine.replace(' idle = 0;', '')
    engine = engine.replace('    const bake = () => {  };\n', '')
    engine = engine.replace('bake(); ', '').replace('bake();', '')
    return engine
