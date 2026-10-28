#!/usr/bin/env python3
import json,html,subprocess,shutil,hashlib,re
from pathlib import Path
R=Path(__file__).resolve().parents[1];products=json.loads((R/'content/products.json').read_text());esc=html.escape
for p in products:p['path']='/care-bed.html' if p['id']=='care-bed' else '/figures/'+p['id']+'.html'
node=shutil.which('node') or str(Path.home()/'.local/bin/node')
names=json.loads(subprocess.check_output([node,'--input-type=module','-e',"const ids=['care-bed','smart-toilet','smoke-alarm','accessible-shower'];const out={};for(const id of ids){const m=await import('./models/'+id+'.js');out[id]=m.createScene().steps.map(s=>s.name);}console.log(JSON.stringify(out));"],cwd=R,text=True))
for p in products:p['stepNames']=names[p['id']]
(R/'catalog.js').write_text('export const products='+json.dumps(products,ensure_ascii=False,indent=2)+';\n')
catalog_hash=hashlib.sha256((R/'catalog.js').read_bytes()).hexdigest()[:12]
site=R/'site.js';site.write_text(re.sub(r"import \{products\} from './catalog.js(?:\?v=[a-f0-9]+)?';", "import {products} from './catalog.js?v="+catalog_hash+"';",site.read_text()))
css=R/'site.css';s=css.read_text()
for name in ['aging-hand-subset.ttf','aging-caveat-subset.ttf']:
 f=R/'fonts'/name
 if f.exists():s=re.sub(r'/fonts/'+re.escape(name)+r'(?:\?v=[a-f0-9]+)?','/fonts/'+name+'?v='+hashlib.sha256(f.read_bytes()).hexdigest()[:12],s)
css.write_text(s)
head='''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="description" content="把照护放回生活。用彩绘交互图鉴看懂护理床、智能马桶、烟雾报警器与无障碍淋浴间。"><meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'"><title>AgingBuy · 把照护放回生活</title><link rel="stylesheet" href="/site.css?v=2.1"></head><body>'''
mast='''<a class="skip" href="#main">跳到正文</a><div class="page"><header class="mast"><a href="/" class="wordmark" data-home>agingbuy<span>日常，值得更好。</span></a><nav aria-label="主要导航"><a href="/#figures" data-home>产品图鉴</a><a href="/#sources" data-home>资料来源</a><a href="/atlas.html">产业研究 ↗</a></nav></header><main id="main">'''
foot='''</main><footer><a class="wordmark" href="/" data-home>agingbuy</a><p>理解产品，选择更好的日常。</p><a href="/atlas.html#evidence">原有研究与证据边界 ↗</a></footer></div><script type="module" src="/site.js?v=2.1"></script></body></html>'''
def card(p,i):
 return f'''<article class="card"><a class="card-image" href="/product.html?item={p['id']}" data-product="{p['id']}"><img src="/cards/{p['id']}.png" alt="{p['name']}固定步骤彩绘模型" width="1000" height="620" loading="lazy"><span class="card-number">FIG. 0{i+1}</span></a><div class="card-copy"><p class="eyebrow">{p['tag']}</p><h3>{p['name']}</h3><p>{p['line']}</p><a class="button" href="/product.html?item={p['id']}" data-product="{p['id']}">透视看看 <span aria-hidden="true">↗</span></a></div></article>'''
home='''<section class="intro"><p class="eyebrow">CARE, IN EVERYDAY LIFE / 01—04</p><h1>把照护，<br>放回<span>生活。</span></h1><div><p class="intro-copy">看懂一件产品，<br>从一张会动的图开始。</p><p class="muted">转动 · 透视 · 动手操作</p></div></section><section id="figures" aria-labelledby="figures-title"><div class="section-heading"><h2 id="figures-title">日常照护图鉴</h2><p>四件产品，一次看懂一件。</p></div><div class="cards">'''+''.join(card(p,i) for i,p in enumerate(products))+'''</div></section><section id="sources" class="source-intro"><p class="eyebrow">READ THE EVIDENCE</p><h2>图可以直观，<br>依据要分清。</h2><div><p>模型讲原理，资料讲边界。</p><p>详情逐项区分官方题录、厂商资料、二手转引和模拟假设。未核实的条款不当作认证，动画读数不代表真实产品性能。</p><p class="small">四份用户底稿 · 更新 2026-10-28 · <a href="/licenses/fonts/README.md">字体与许可</a></p></div></section><section class="research"><p class="eyebrow">THE BIGGER PICTURE</p><h2>产品背后，<br>是一个长寿经济网络。</h2><div><a class="button" href="/atlas.html">进入产业图谱 ↗</a><a href="/全球长寿经济市场分析与三家高成长企业.md">全球市场与企业案例 ↗</a><a href="/atlas.html#clusters">BioBAY 地域研究 ↗</a><a href="/atlas.html#evidence">原始资料、来源与日期 ↗</a></div></section>'''
(R/'index.html').write_text(head+mast+home+foot)
def detail(p):
 sources=''.join(f'''<article class="source-row"><div><span class="badge">{esc(s['kind'])}</span><h3>{esc(s['title'])}</h3></div><dl><dt>版本／日期</dt><dd>{esc(s['version'])} · {esc(s['date'])}</dd><dt>适用型号／范围</dt><dd>{esc(s['scope'])}</dd><dt>条款核验</dt><dd>{esc(s['clause'])}</dd><dt>状态</dt><dd>{esc(s['status'])} · 核对日期 2026-10-28</dd><dt>原始链接</dt><dd>{('<a href="'+esc(s['url'])+'" target="_blank" rel="noopener">查看来源 ↗</a>') if s['url'] else '原链接未提供；不补造链接'}</dd></dl></article>''' for s in p['sources'])
 points=''.join(f'''<article class="buy-point"><span class="number">0{i+1}</span><h3>{esc(b['title'])}</h3><p>{esc(b['text'])}</p><button type="button" data-inspect="{i}">看图中位置 ↗</button></article>''' for i,b in enumerate(p['points']))
 return f'''<nav class="product-nav" aria-label="切换产品"><a href="/" data-home>← 全部图鉴</a><div>{''.join(f'<a href="/product.html?item={x["id"]}" data-product="{x["id"]}"'+(' aria-current="page"' if p['id']==x['id'] else '')+f'>{x["name"]}</a>' for x in products)}</div></nav><section class="product-heading"><p class="eyebrow">FIG. 0{products.index(p)+1} / {p['en']}</p><h1>{p['name']}</h1><p class="product-line">{p['line']}</p><p>{p['audience']}</p><p class="boundary"><strong>示意边界</strong> {p['boundary']}</p></section><section class="interaction" aria-labelledby="interaction-title"><div class="section-heading"><h2 id="interaction-title">动手试试</h2><p>转动 · 透视 · 点部件读中文名称</p></div><div class="state-return"><button id="return-view" hidden>返回原视图（保持暂停）</button><span id="state-message" role="status"></span></div><div id="model-host" data-item="{p['id']}"><img class="model-poster" src="/cards/{p['id']}.png" alt="{p['name']}静态图板" width="1000" height="620"><p class="load-status" role="status">正在准备交互；静态图与下方资料可先阅读。</p></div><div class="colour-key" aria-label="颜色含义">{''.join('<span style="--sw:'+c+'"><i aria-hidden="true"></i>'+t+'</span>' for c,t in [('#6baed2','水／清洗'),('#e5a064','加热／热水'),('#df6965','报警／危险'),('#b2c665','电源／信号'),('#c5a0ca','人体／交互'),('#91a7b8','机械／支撑')])}</div><p class="small">活动部件与步骤同色提亮；非工作部件淡化。颜色只作索引，编号、名称与文字说明同时保留。</p><details class="audit-details"><summary>模型工具检查范围</summary><p>只检查程序声明的几何／ID／变换条件，另需人工看图。零问题也不等于制造装配、无碰撞或安全合格。</p><button id="run-audit">运行模型检查</button><pre id="audit-result" role="status">尚未运行</pre></details></section><section class="buying"><div class="section-heading"><h2>选购前，先看这些</h2><p>点“看图中位置”定位部件，可返回原视图。</p></div><div class="buy-grid">{points}</div></section><section id="usage"><div class="section-heading"><h2>使用步骤与动作</h2></div><p>图板中的步骤按钮／时间轴只控制演示；护理床沿用七按钮顺序。真实使用请按具体型号说明。点击步骤会先合拢拆解模型。</p></section><section id="product-sources"><div class="section-heading"><h2>标准与资料来源</h2><p>事实、线索与假设分开读。</p></div>{sources}<details open class="assumptions"><summary>模拟假设 · 不是产品指标</summary><ul>{''.join('<li>'+esc(x)+'</li>' for x in p['assumptions'])}</ul><p>所有读数与模型共用动画状态，不等于真实产品认证。</p></details></section><section class="cautions"><h2>注意与限制</h2><p>{p['cautions']}</p></section>'''
for p in products:
 path=R/('care-bed.html' if p['id']=='care-bed' else 'figures/'+p['id']+'.html')
 path.write_text(head.replace('<body>','<body data-product="'+p['id']+'">')+mast+detail(p)+foot)
(R/'product.html').write_text(head+mast+home+foot)
# A trusted local template lets navigation render the same statically built content.
(R/'detail-templates.json').write_text(json.dumps({p['id']:detail(p) for p in products},ensure_ascii=False))
for dest in [R/'care-bed.html',*[R/'figures'/f'{p["id"]}.html' for p in products[1:]],R/'detail-templates.json']:
 s=dest.read_text()
 for p in products:
  marker='点击步骤会先合拢拆解模型。</p></section>'
  steps='<ol class="usage-steps">'+''.join('<li>'+esc(name)+'</li>' for name in p['stepNames'])+'</ol>'
  # Replace only the current product's static usage section (JSON templates separately).
  if dest.suffix=='.html' and dest.name==('care-bed.html' if p['id']=='care-bed' else p['id']+'.html'):s=s.replace(marker,'点击步骤会先合拢拆解模型。</p>'+steps+'</section>')
 if dest.suffix=='.json':
  data=json.loads(s)
  for p in products:
   steps='<ol class="usage-steps">'+''.join('<li>'+esc(name)+'</li>' for name in p['stepNames'])+'</ol>'
   data[p['id']]=data[p['id']].replace('点击步骤会先合拢拆解模型。</p></section>','点击步骤会先合拢拆解模型。</p>'+steps+'</section>')
  s=json.dumps(data,ensure_ascii=False)
 dest.write_text(s)
# Progressive links reach the correct static detail even without JS or templates.
for dest in [R/'index.html',R/'product.html',R/'care-bed.html',*[R/'figures'/f'{p["id"]}.html' for p in products[1:]],R/'detail-templates.json']:
 s=dest.read_text()
 for p in products:s=s.replace('/product.html?item='+p['id'],p['path'])
 for p in products:
  image=R/'cards'/f'{p["id"]}.png'
  if image.exists():s=s.replace('/cards/'+p['id']+'.png','/cards/'+p['id']+'.png?v='+hashlib.sha256(image.read_bytes()).hexdigest()[:12])
 dest.write_text(s)
active=[R/'site.js',R/'site.css',R/'catalog.js',R/'semantic.js',R/'detail-templates.json',*sorted((R/'models').glob('*.js')),*sorted((R/'cards').glob('*.png')),*sorted((R/'fonts').glob('*.ttf'))]
revision=hashlib.sha256(b''.join(p.read_bytes() for p in active)).hexdigest()[:16]
for dest in [R/'index.html',R/'product.html',R/'care-bed.html',*[R/'figures'/f'{p["id"]}.html' for p in products[1:]]]:
 dest.write_text(dest.read_text().replace('/site.js?v=2.1','/site.js?v='+revision).replace('/site.css?v=2.1','/site.css?v='+revision))
(R/'build-info.json').write_text(json.dumps({'version':'2.1','revision':revision,'assets':{str(p.relative_to(R)):hashlib.sha256(p.read_bytes()).hexdigest() for p in active}},indent=2))
print('Built static home, four progressive detail pages and canonical catalog.')
