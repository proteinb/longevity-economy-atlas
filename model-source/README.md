# Active 2.1 sources

`sketch/care-bed.html`, `sketch/smart-toilet.html`, `sketch/smoke-alarm.html`, and `sketch/accessible-shower.html` are the canonical reviewed 855e9ca scene/engine inputs. They preserve stable part IDs, original geometry/kinematics, hand-ink renderer, explosion and mobile Chinese label logic. Raw user attachments remain outside this publication repository. No newer sketch-anatomy.zip was resolved in this task; the existing maintainable sources are the version baseline.

Run `python3 scripts/build-model.py` to compile all four sources into direct-mount ES modules under `models/`, then build the static site from `content/products.json`. Lifecycle, query, snapshot/restore and rendering adaptations live in `scripts/build-sketch.py`; semantic colour mapping lives in `semantic.js`. Generated modules expose `createScene()` and `mount(host)` returning an independent controller. No active page uses iframe or Sketch3D.last.

Each controller supports step/xr/play/explode/audit URL options, view/labels, snapshot/restore/inspect and destroy. Restore retains the original time, camera, xray, explosion and selection but stays paused deliberately. Nursing bed retains the original declared geometry/contact audit; the other three explicitly report their narrower ID/parent/finite-transform checks. None is manufacturing or safety certification.

The root-level `nursing-bed.html` and Three.js prototype files in this directory are historical, not active build inputs. Old gallery files remain for legacy references; the active entry points use site.js/site.css only. Do not rebuild 2.1 from the old prototype or copy a standalone input over a generated detail page.

Font regeneration is optional using `scripts/build-fonts.py --sources <official TTF directory>` with FontTools, after preserving OFL notices. Ordinary builds use tracked local subsets without installing or downloading anything. Cards are real fixed-step browser captures; `cards/captures.json` records the camera/state and crop.
