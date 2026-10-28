"""Optional font subset regeneration: supply official font TTFs and FontTools.
Already-built subsets are tracked; ordinary builds do not install or download.
Usage: python build-fonts.py --sources /path/with/zcool.ttf,caveat.ttf
"""
from pathlib import Path
import argparse,json,hashlib
from fontTools import subset
from fontTools.ttLib import TTFont
p=argparse.ArgumentParser();p.add_argument('--sources',type=Path,required=True);a=p.parse_args();r=Path(__file__).resolve().parents[1]
files=[r/'site.js',r/'semantic.js',r/'site.css',r/'content/products.json',r/'scripts/build-site.py',r/'scripts/build-sketch.py',*list((r/'model-source/sketch').glob('*.html'))]
chars=''.join(sorted(set(''.join(x.read_text() for x in files)+'0123456789°℃⌀≥≤×%↗←→／—−·，。暂停播放全部当前返回部件名称未命名图模型算例检查原视图')))
(r/'fonts/characters.txt').write_text(chars)
manifest={}
for key,name in [('zcool','aging-hand-subset.ttf'),('caveat','aging-caveat-subset.ttf')]:
 src=a.sources/(key+'.ttf');f=TTFont(src);missing=sorted(ord(c) for c in chars if ord(c)>32 and ord(c) not in f.getBestCmap());o=subset.Options();o.name_IDs=['*'];o.name_legacy=True;o.name_languages=['*'];s=subset.Subsetter(options=o);s.populate(text=chars);s.subset(f);out=r/'fonts'/name;f.save(out)
 manifest[key]={'source':'https://github.com/google/fonts/tree/main/ofl/'+('zcoolkuaile' if key=='zcool' else 'caveat'),'original_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'subset_sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'size':out.stat().st_size,'missing_codepoints':missing}
(r/'licenses/fonts/manifest.json').write_text(json.dumps(manifest,indent=2))
print('Self-hosted font subsets rebuilt; preserve OFL notices and system symbol fallback.')
