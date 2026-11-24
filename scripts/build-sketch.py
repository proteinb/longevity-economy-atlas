#!/usr/bin/env python3
"""Compile reviewed, canonical Sketch3D sources to directly mounted ES modules.
No mesh or kinematics rewriting: scene bodies are copied verbatim.
"""
import re,json,hashlib,runpy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
IDS=[product['id'] for product in json.loads((ROOT/'content/products.json').read_text())]
optimize=runpy.run_path(str(ROOT/'scripts/sketch-performance.py'))['optimize']
MOTION_HASH=hashlib.sha256((ROOT/'motion-renderer.js').read_bytes()).hexdigest()[:12]
ENGINE_HASH=hashlib.sha256((ROOT/'engine.js').read_bytes()).hexdigest()[:12]
SEMANTIC_HASH=hashlib.sha256((ROOT/'semantic.js').read_bytes()).hexdigest()[:12]
API=r'''
      snapshot(){ invalidate(); return JSON.parse(JSON.stringify({u,uAbs,expl,expT,yaw,pitch,zoom,xray,xrayT,labelMode,selected:pinned?.id||null,playing,allPlayback,allFinished,speedIx,focusGoal,focusCur,viewHold,EXTRA_STATE})); },
      restore(s){ playing=false;allPlayback=!!s.allPlayback;allFinished=!!s.allFinished;u=s.u;uAbs=s.uAbs;expl=s.expl;expT=s.expT;yaw=s.yaw;pitch=s.pitch;zoom=s.zoom;xray=s.xray;xrayT=s.xrayT;labelMode=s.labelMode;speedIx=s.speedIx;pinned=byId[s.selected]||null;focusGoal=s.focusGoal;focusCur=s.focusCur;camGoal=null;vyaw=vpitch=0;sway=0;viewHold=true;RESTORE_EXTRA;lastStep=-2;if(pinned)showNote(pinned);syncButtons(); },
      step(n){ invalidate(); const s=steps[Number(n)-1];if(!s)return false;playing=false;setU(s.from+(s.to-s.from)*.45);STEP_EXTRA;lastStep=-2;syncButtons();return true; },
      inspect({part,step,xray:inside=true}){this.step(step||1);playing=false;expl=expT=0;xray=xrayT=inside?1:0;labelMode=0;runAnim(u);worlds(0);pinned=byId[part]||null;viewHold=true;camGoal=null;bake();if(pinned){focusGoal=ap(pinned.W,pinned.anchor);focusCur=focusGoal.slice();zoom=Math.min(view0.zoom*1.35,1.8);showNote(pinned);}syncButtons();},
      query(params) {
        const number = key => {
          const value = params.get(key);
          return value !== null && value.trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : null;
        };
        const modeValue = params.get('mode');
        if (modeValue === 'auto' || modeValue === 'buttons') this.mode?.(modeValue);
        QUERY_PRESS
        if (number('step') !== null) this.step(number('step'));
        if (number('u') !== null) { playing = false; setU(clamp(number('u'), 0, 0.9999)); }
        if (number('xr') !== null) this.xray(number('xr'));
        if (number('explode') !== null) this.explode(clamp(number('explode'), 0, 1));
        const labels = { off: 2, all: 0, step: 1, 0: 2, 1: 1, 2: 1 };
        if (Object.hasOwn(labels, params.get('labels'))) this.labels(labels[params.get('labels')]);
        const view = {};
        for (const key of ['yaw', 'pitch', 'zoom']) if (number(key) !== null) view[key] = number(key);
        if (params.get('focus')) {
          runAnim(u); worlds(expl);
          const value = params.get('focus'), coords = value.split(',').map(Number);
          const part = Object.hasOwn(byId, value) ? byId[value] : parts.find(P => P.label === value);
          if (coords.length === 3 && coords.every(Number.isFinite)) focusGoal = coords;
          else if (part) focusGoal = ap(part.W, part.anchor);
          if (focusGoal) { focusCur = focusGoal.slice(); viewHold = true; }
        }
        if (Object.keys(view).length) this.view(view);
        syncButtons();
        if (params.has('play')) this.play(params.get('play') === '1' && !reduce);
        if (params.get('audit') === '1') { liveDiagnostics = true; return this.audit(); }
        runAnim(u); worlds(expl); publishDiagnostics();
        diagnosticsPending = true;
        invalidate();
      },
      audit(o){
        const wasPlaying = playing;
        playing = false;
        let result;
        try { result = RUN_AUDIT; }
        finally { playing = wasPlaying; }
        wrap.dataset.audit = JSON.stringify(result);
        publishDiagnostics();
        diagnosticsPending = true;
        invalidate();
        return result;
      },
      destroy(){if(destroyed)return;destroyed=true;cancelAll();playing=false;cancelAnimationFrame(raf);sizeObserver.disconnect();document.removeEventListener('visibilitychange',visibilityHandler);lifecycle.abort();DESTROY_EXTRA;host.replaceChildren();},
'''
GENERIC_AUDIT=r'''(()=>{const problems=[],warnings=['仅检查部件 ID、父级与动画变换有限值；缺少制造装配约束，不检查承载、碰撞和安全。'];const ids=new Set();for(const p of parts){if(ids.has(p.id))problems.push('重复 ID '+p.id);ids.add(p.id);if(p.def.parent&&!byId[p.def.parent])problems.push('父级不存在 '+p.id);}const keep=u;let checks=0;for(let i=0;i<=16;i++){runAnim(i/16);worlds(0);for(const p of parts){checks++;if(!p.W.every(Number.isFinite))problems.push('变换无效 '+p.id);}}runAnim(keep);worlds(expl);return {ok:!problems.length,checks,problems,warnings,scope:'ID、父级和17姿态有限值；非结构复验'};})()'''
for ident in IDS:
    sketch_dir=ROOT/'model-source/sketch'
    scene_file=sketch_dir/f'{ident}.js'
    # Scene-only inputs use the generic Sketch3D template.
    html=(sketch_dir/('smart-toilet.html' if scene_file.exists() else f'{ident}.html')).read_text()
    scripts=re.findall(r'<script[^>]*>([\s\S]*?)</script>',html)
    engine=next(s for s in scripts if 'root.Sketch3D =' in s)
    scene=next(s for s in scripts if "\nSketch3D.mount('#app'" in s)
    scene=scene[scene.index("Sketch3D.mount('#app', ")+len("Sketch3D.mount('#app', "):].strip()
    assert scene.endswith(');');scene=scene[:-2]
    if scene_file.exists():
        scene=scene_file.read_text().split('export const makeScene = ',1)[1].strip().removesuffix(';')
        engine=re.sub(r'const explodeVectors=\{[^;]+\};','const explodeVectors={};',engine)
        engine=engine.replace('    expRange.addEventListener', '    explosionBar.hidden=expNote.hidden=!hasExplode;\n    expRange.addEventListener')
    # Per-instance styles and lifetime. No global last-controller or iframe bridge.
    engine=engine.replace('    injectCSS();','    let destroyed=false,viewHold=false;const lifecycle=new AbortController();')
    engine=engine.replace("const wrap = el('div', 'sk'); host.appendChild(wrap);","const wrap = el('div', 'sk'); host.appendChild(wrap);const sheet=document.createElement('style');sheet.textContent=CSS+EXTRA_CSS;host.appendChild(sheet);")
    engine=engine.replace('document.documentElement.dataset','wrap.dataset')
    engine=engine.replace('new ResizeObserver(resize).observe(stage); resize();','const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(stage); resize();')
    engine=engine.replace('document.fonts.ready.then(resize)','document.fonts.ready.then(()=>{if(!destroyed)resize();})')
    engine=engine.replace("document.addEventListener('visibilitychange', () => { onScreen=!document.hidden; if(onScreen&&!raf)raf=requestAnimationFrame(frame); });","const visibilityHandler=()=>{onScreen=!document.hidden;if(document.hidden)playing=false;if(onScreen&&!raf&&!destroyed)raf=requestAnimationFrame(frame);};document.addEventListener('visibilitychange',visibilityHandler);")
    engine=engine.replace('      if (!onScreen) return;','      if (!onScreen||destroyed) return;')
    engine=engine.replace('function wantView(si) {','function wantView(si) {if(viewHold)return;')
    engine=engine.replace('function resetView() {','function resetView() {viewHold=false;')
    engine=engine.replace('function setU(x) {','function setU(x) {viewHold=false;')
    engine=engine.replace('view(o) { bake();','view(o) { viewHold=true;bake();')
    engine=engine.replace('const k = Math.min(1, dt * 2.6)', 'const k = reduce?1:Math.min(1, dt * 2.6)')
    engine=engine.replace('camK = Math.min(1, dt * 8)', 'camK = reduce?1:Math.min(1, dt * 8)')
    engine=engine.replace('camK = Math.min(1, dt * 2.6)', 'camK = reduce?1:Math.min(1, dt * 2.6)')
    engine=engine.replace('      if (!ptrs.size) {', '      if(reduce)vyaw=vpitch=0;\n      if (!ptrs.size) {')
    engine=engine.replace("e.addEventListener('click', () => press(b.id))", "e.addEventListener('click', () => press(b.id,reduce))")
    engine=engine.replace('press(+k);','press(+k,reduce);')
    engine=engine.replace('    root.Sketch3D.last = ctl;','')
    if ident=='care-bed':
        engine=engine.replace("bPlay.setAttribute('aria-pressed', String(!playing));", "bPlay.setAttribute('aria-pressed', String(!playing));bPlay.disabled=mode==='buttons'&&!curSeg;if(bPlay.disabled)bPlay.firstChild.textContent='先选步骤';")
        engine=engine.replace('play(v = true) { playing = v; syncButtons(); }', "play(v = true) {if(v&&mode==='buttons'&&!curSeg){const next=pbs.find(b=>!done.has(b.id)&&b.needs.every(n=>done.has(n)));if(next)press(next.id,reduce);else playing=false;}else playing=v;syncButtons();}")
        start=engine.index('    const Q = new URLSearchParams');end=engine.index('    raf = requestAnimationFrame(frame);',start)
        engine=engine[:start]+engine[end:]
        # Keep the original geometry audit but expose it through the same instance API.
        engine=engine.replace('audit(o) { const r = audit(o); showAudit(r); return r; },','')
    # One-shot sequence lives in the existing per-instance frame; canonical geometry stays unchanged.
    engine=engine.replace('    let chips = [], knob = null;', "    let allPlayback=false,allFinished=false;const allButtons=[];const allStatus=el('p','sk-all-status');allStatus.setAttribute('role','status');allStatus.id='all-play-status';const addAll=row=>{const b=el('button','sk-step sk-all','全选');b.type='button';b.title='从第一步顺序播放全部步骤，完成后停止';b.setAttribute('aria-describedby','all-play-status');b.addEventListener('click',startAll);row.appendChild(b);allButtons.push(b);};\n    let chips = [], knob = null;")
    engine=engine.replace('      steps.forEach((s, i) => {', '      addAll(row);\n      steps.forEach((s, i) => {')
    engine=engine.replace("    pbs.forEach((b) => {", "    addAll(pRow);\n    pbs.forEach((b) => {",1)
    engine=engine.replace("    const caption = el('div', 'sk-caption');", "    wrap.appendChild(allStatus);\n    const caption = el('div', 'sk-caption');")
    if ident!='care-bed':engine=engine.replace('    // 时间轴', '    const pbs=[];\n    // 时间轴')
    for name in ['setU','setExplosion','press','setMode']:
        engine=re.sub(r'(function '+name+r'\([^)]*\)\s*\{)',r'\1cancelAll();',engine)
    engine=engine.replace("btn('复位模型','',()=>{", "btn('复位模型','',()=>{cancelAll();")
    engine=engine.replace('    function togglePlay()', (ROOT/'scripts/play-all-engine.js').read_text()+'\n    function togglePlay()')
    engine=engine.replace('    function syncButtons() {','    function syncButtons() {syncAll();')
    engine=engine.replace("      if (playing && mode === 'buttons') {", "      if(allPlayback) advanceAll(dt);\n      else if (playing && mode === 'buttons') {")
    if ident!='care-bed':engine=engine.replace('      if (playing) { uAbs +=', '      if(allPlayback) advanceAll(dt);\n      else if (playing) { uAbs +=',1)
    query_press="""for (const key of (params.get('press') || '').split(',').filter(Boolean)) {
          press(Number.isFinite(Number(key)) ? Number(key) : key, true);
        }""" if ident=='care-bed' else ''
    extra=API.replace('        QUERY_PRESS\n', '        '+query_press+'\n' if query_press else '').replace('RUN_AUDIT','audit(o)' if ident=='care-bed' else GENERIC_AUDIT)
    extra=extra.replace('EXTRA_STATE',"mode,done:[...done],segment:curSeg?.id||null" if ident=='care-bed' else "mode:'auto'")
    extra=extra.replace('RESTORE_EXTRA',"mode=s.mode;done.clear();s.done.forEach(x=>done.add(x));curSeg=pbs.find(x=>x.id===s.segment)||null" if ident=='care-bed' else '')
    extra=extra.replace('STEP_EXTRA','curSeg=pbs.find(b=>u>=b.from&&u<b.to)||null' if ident=='care-bed' else '')
    extra=extra.replace('DESTROY_EXTRA','clearTimeout(toastT)' if ident=='care-bed' else '')
    engine=engine.replace('    const ctl = {','    const ctl = {'+extra)
    # Keep the original engine geometry implementation, localize its root.
    engine=engine.replace("})(typeof window !== 'undefined' ? window : globalThis);",'})(localRoot);')
    engine=optimize(engine, ident=='care-bed')
    engine='const localRoot={};\n'+engine
    extra_css=r'''
      .sk{--cn:system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;--hand:"AgingHand","AgingCaveat","KaiTi",cursive;color:#242936;background:#fff;padding:20px 16px;max-width:1200px}
      .sk-title,.sk-sub,.sk-label,.sk-part-title{font-family:var(--hand)!important}
      .sk-sub{font-size:15px;line-height:1.65;color:#59616b}
      .sk-title{font-size:30px;line-height:1.3}.sk-fig{display:none}
      .sk-stage{height:clamp(420px,52vw,620px);border:1px solid #9aa7af;border-radius:12px;background:#fff}
      .sk-btn,.sk-step,.sk-pbtn{border:1px solid #65717b;border-radius:5px;box-shadow:2px 2px 0 #394552;font:14px/1.5 var(--cn);min-height:44px}
      .sk button:disabled{opacity:.45;box-shadow:none;cursor:not-allowed}.sk button:focus-visible,.sk [role=button]:focus-visible,.sk input:focus-visible{outline:3px solid #284f73;outline-offset:3px}
      .sk-all-status{font:14px/1.6 var(--cn);margin:8px 0;min-height:1.6em;color:#43515d}.sk-all{font-weight:700;background:#f5f1d8;flex-shrink:0}.sk-all.on{background:#e6edd8}
      .sk-readout{font:14px/1.4 ui-monospace,monospace;font-variant-numeric:tabular-nums}
      .sk-caption{font:15px/1.75 var(--cn)}.sk-step.on,.sk-pbtn.on{box-shadow:2px 2px 0 #394552,inset 0 0 0 1px #394552}
      .sk-part-name{display:none}.sk-part-panel{display:none}.sk.pins .sk-part-panel{display:block;margin:14px 0 20px}
      .sk-part-title{font-size:16px;margin:0 0 8px}.sk.pins .sk-part-panel .sk-legend{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;columns:auto;margin:0;font-size:14px}
      .sk-part-panel .sk-legend li{min-height:44px;padding:7px 5px;border:1px solid #d2d8da;white-space:normal;line-height:1.5}
      .sk.compact .sk-part-name{display:block;position:absolute;left:8px;right:8px;top:8px;z-index:2;pointer-events:none;background:#fff9e9;border:1px solid #bbb49d;border-radius:5px;padding:7px 9px;font-size:14px;line-height:1.4}
      .sk.compact .sk-stage{height:460px}.sk.compact .sk-readout{font-size:12px}.sk-hint{font:12px var(--cn)}
      .nursing-explosion,.aging-explosion{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:16px 0 8px}.nursing-explosion input,.aging-explosion input{flex:1;min-width:80px;accent-color:#42697b}.nursing-explosion button,.aging-explosion button{background:#edf3f7;font-weight:650}.nursing-exp-note,.aging-explosion-note{font:12px/1.6 var(--cn);color:#58636a}
      @media(prefers-reduced-motion:reduce){.sk *{animation:none!important;transition:none!important}}
    '''
    module='import {easeTo, canvasPaint, edgeBatch, localLighting} from "../engine.js?v='+ENGINE_HASH+'";\nimport {createMotionRenderer, triangulate} from "../motion-renderer.js?v='+MOTION_HASH+'";\nimport {prepareScene} from "../semantic.js?v='+SEMANTIC_HASH+'";\nconst EXTRA_CSS='+json.dumps(extra_css)+';\n'+engine+'\nexport const makeScene='+scene+';\nexport function createScene(){return prepareScene(makeScene(localRoot.Sketch3D.S,localRoot.Sketch3D.M),'+json.dumps(ident)+');}\nexport function mount(host){const scene=createScene();const ctl=localRoot.Sketch3D.mount(host,scene);ctl.view(scene.view);ctl.play(false);return ctl;}\n'
    (ROOT/'models').mkdir(exist_ok=True);(ROOT/'models'/f'{ident}.js').write_text(module)
print(f'Built {len(IDS)} direct-mount models from Sketch3D sources.')
