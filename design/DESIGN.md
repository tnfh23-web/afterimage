# Current status, 2026-10-03

The fidelity requirement remains unfulfilled, especially the veiled bust. The prior completion claims below describe an earlier technical milestone and were rejected by the user on visual fidelity. Use FIDELITY-REVISION.md for the current comparison and QA; do not describe the implementation as identical to the concepts.

# AFTERIMAGE / 잔상

Original fictional surreal exhibition. Six connected rooms. User chose free walking, dark media-art space, paintings and sculpture, six rooms with corridors, surreal art; requires genuine 3D and original logo. Offset remains completed and separate.

## Locked concept set
01 낮은 하늘: ivory offset doorway sculpture, sunset desert painting. Opening overlay on left with 잔상, 눈을 감은 뒤에도 남는 여섯 개의 장면., 전시 입장.
02 잠든 정원: suspended bronze botanical stems and ivory leaves over moon rock, moon garden painting.
03 얼굴 없는 초상: three veiled ivory/copper busts on cylindrical plinths, veiled portrait.
04 거꾸로 흐르는 시간: copper orbital rings around an ivory sphere, ceiling pendulums, moving particle projection and eclipse painting.
05 남겨진 바다: blue ribbed wave and floating stone, sea painting.
06 깨어나기 직전: tilted luminous ivory portal, horizon painting.

Each room has a fresh 1536x1024 image-generated concept. Separate original painting textures and logo assets; never use concept screenshots as the WebGL backdrop.

## Tokens and layout
Full-bleed WebGL architecture. Charcoal concrete #242522, dark tile #1d2020, ivory #eeeae2, muted #bcb9b1, bronze #93613e; room05 restrained blue #456e9c. Warm spotlights except blue room. No page tint over the scene. Thin rule #ffffff55; sharp square buttons, no cards, no pills, no arrow ornaments.
Local Pretendard: regular400, bold700, black900. Heading120px desktop/72px phone; body19/16px; chrome15/13px with moderate tracking. UI perimeter padding40px desktop/22px tablet/18px phone. Header brand left, 전시 지도 and 관람 안내 right. Footer room number/title left, W A S D 이동 · 드래그 시선 · 작품 선택 right. Responsive touch pad is required functional extension, not decorative chrome.

Original logo: two offset open rectangular frames, condensed uppercase AFTERIMAGE, Korean 잔상. Final generated transparent asset delivered, plus precise native vector tracing for favicon/emblem and extruded mesh entrance mark. 3D wordmark uses actual extruded letter geometry. Keep raster brand typography on chrome.

## Architecture and controls
React app shell, Gallery component lazy import; scene/controller isolated module, sculpture factories, rooms/content data, dialogs. Single rAF for refs/imperative scene updates; no React state per frame. Room state only on transition. Six rooms connected in two-row loop; collision against union of room/corridor floor rectangles and plinths. WASD/arrows move, drag look, Shift faster, artwork click or E to inspect, Escape closes, map provides accessible instant room selection. Touch movement pad and drag look. Artwork catalog through map for keyboard users. Dialog focus trap and restore.

## Intentional practical translation
Concepts show ray-traced stone detail/reflections. Implementation uses real-time textured geometry, finite shadows and restrained reflections within browser performance budget. Veiled bust is custom procedural sculpture, not a downloaded photogrammetry model. Camera has free movement: composition varies after entry. No replacement of room with static image. Six screens share first concept perimeter alignment rather than inconsistent generated header rules. Loading text and accessible map/guide/detail are functional necessities. Reduced motion pauses sculpture movement and camera transitions.

## Fidelity checks required
Compare concept and render in view_image at1536x1024: opening placement/copy, titleweight, ivory portal thickness, painting placement, charcoal architecture, warm lighting, chrome perimeter, six distinct sculptures, phonecontrols. Validate walking/collision through corridors, artifact selection, detail zoom, map, guide, keyboard/touch, resize, reducedmotion and disposal. Record actual differences and fixes in QA.md.

## Final fidelity ledger / completed validation
Reference: design/room-01.png through room-06.png, each native1536x1024. Final evidence: outputs/afterimage/desktop-opening.png, room-01..06.png, mobile-opening.png and mobile-detail.png in the parent task workspace. All reference/render pairs inspected directly with view_image in final comparison passes.

| Comparison | Evidence and outcome |
|---|---|
| Opening composition | Left lower 잔상, supporting copy and square 전시 입장; right solid ivory offset doorway. Hierarchy and relative text/CTA positions preserved at1536x1024. Architecture is a navigable two-exit room rather than a photographic stage. |
| Visible copy | AFTERIMAGE, 전시 지도, 관람 안내, 잔상, 눈을 감은 뒤에도 남는 여섯 개의 장면., 전시 입장 and all six room names verified. Functional extension: motion setting and near-art selection hint. No invented marketing eyebrow or repeated arrow buttons. |
| Typography | Local Pretendard400/700/900 for Korean and UI. Original condensed brand direction translated to outlined SVG and extruded Helvetiker letter geometry; exact glyph contours differ from the raster concept. No serif. |
| Palette/materials | Charcoal concrete, slate floor, ivory, bronze; blue only in room05. Generated material scans replace smooth noise-only surfaces. Floor reflection plane moved below tile surface and reduced from perfect mirror to a restrained blend. |
| Room02 and03 sculpture | Hanging branches/leaves over a rock; three ivory/copper veiled busts. Smooth shared-vertex stone and continuous anatomical bust profile replace accidental faceting and segmented neck. Procedural sculpture retains subject/material placement but does not reproduce scanned fabric detail. |
| Room04 | True solid orbital bands, slowly rotating around ivory sphere, pendulums and moving particle installation. Thin tube rings replaced with dimensional bands after comparison. |
| Room05 | All32 rib sections aligned to the supporting plinth; painting aspect retained; physically floating stone with slow motion. Initial offset that left ribs beyond the plinth corrected. |
| Room06 | Tilted light-lined portal, pale horizon painting and side-wall light aperture. Corrected aperture overlap with painting. Real-time local light/reflection substitutes for ray-traced photographic bloom. |
| Containers/responsive | Full-bleed canvas and perimeter UI. Mobile touch pad, artwork bottom sheet, desktop right sheet. No overflowing document at1366x768,1024x768,768x1024,390x844,375x812,360x640,844x390. Native1536x1024 separately captured. |
| Interaction | All six corridors traversed with held WASD/Shift and real mouse drag. External wall and plinth collisions pass. Mesh click, sculpture orbit/reset, painting zoom, single dialog layering, Escape/focus and live reduced motion pass. Fresh390x844 touch context supports simultaneous two-finger movement+look. |

IAB first: actual page identity, rendered room, entry, map and room navigation. Official Playwright CLI supplement: exact viewport, held keys, pointer drag, true mobile multi-touch and screenshots; current IAB DOM path does not supply sustained simultaneous pointer/key testing. Production npm run build passes. No JavaScript runtime errors in the final UI/touch runs. Windows ANGLE emitted a non-fatal PMREM shader precision warning; no rendering failure. Three.js lazy-loaded3D chunk is approximately152KB gzip and produces Vite's raw500KB size advisory.

Remaining deliberate differences: browser PBR/shadow/reflection budget, procedural fabric/stone/sculpture detail, moving viewpoint, two-exit connected floorplan, constrained portrait crop, functional motion/inspection UI, traced production branding. These are explicitly3D implementation translations, not claimed pixel-identical photographs. Safari and physical phone performance were not tested; touch was Chromium device emulation. This was a technical milestone, not successful concept fidelity. The user subsequently rejected the appearance; see the current revision ledger.
