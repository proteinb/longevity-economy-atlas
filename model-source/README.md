# Active 2.1 sources

The four reviewed `sketch/*.html` files preserve the reference geometry and kinematics. The build reads their scene definitions and explosion offsets. `sketch/oxygen-concentrator.js` is a scene-only input with the supplied gas-flow colours, steps and simulated readouts.

Run `python3 scripts/build-model.py` from the repository root. The build writes the five scene modules to `models/` and creates the static pages from `content/products.json`. Each generated module imports `defineModel` from `../engine.js` and exports its own scene factory and the bound `createScene()` and `mount(host)` functions. `engine.js` owns the mesh primitives, mounting, Canvas drawing, playback, input and audit. `motion-renderer.js` supplies the WebGL preview. `semantic.js` applies the existing colour mappings by product ID. Scenes without a mapping retain their colours.

To add a product, supply `sketch/<id>.js` with a single `export const makeScene = (S, M) => { ... };` declaration. Return a scene with `parts`, `steps` and `view`; add `flows`, `animate` and `readout` when the model uses them. Use the same ID for the catalogue entry and `cards/<id>.png`. The build adds the engine import and binding. See the [root README](../README.md#接入新产品图解) for the complete workflow.

Controllers support step, xray, playback and audit URL state, as well as view/labels, snapshot/restore/inspect and destroy. Explosion controls appear for scenes with explosion offsets. Restore keeps time, camera, xray, explosion and selection in a paused view. The nursing bed retains its geometry/contact audit. The other four use the ID, parent and finite-transform audit.

The root-level `nursing-bed.html` and Three.js prototype files in this directory are historical, not active build inputs. Old gallery files remain for legacy references; the active entry points use site.js/site.css only. Do not rebuild 2.1 from the old prototype or copy a standalone input over a generated detail page.

Font regeneration is optional using `scripts/build-fonts.py --sources <official TTF directory>` with FontTools and Brotli, after preserving OFL notices. The script emits WOFF2 and TTF; the site loads WOFF2 first. Ordinary builds use tracked local subsets without installing or downloading anything. Cards are real fixed-step browser captures; `cards/captures.json` records the camera/state and crop.
