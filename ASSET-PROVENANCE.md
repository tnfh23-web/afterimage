# Assets and portfolio credits

This project contains a fictional exhibition. Its artist names and artwork descriptions are invented.

| Asset | Origin |
|---|---|
| Ten gallery concept images (including the four eastern rooms); six case-study concepts | Generated with OpenAI ImageGen for this project |
| Cinematic loader concept and tunnel backdrop | Generated with OpenAI ImageGen; backdrop edited from the loading concept to remove UI while preserving its architecture, paintings and light. Used only during the entry transition, not as the navigable gallery. The atmospheric paintings in this backdrop are distinct from the ten gallery paintings. |
| Paintings and reconstructed painting-match variants | Generated with OpenAI ImageGen for this project |
| Stone, concrete, bronze and rock texture images | Generated for this project; several procedural textures are also created in code |
| New gallery architecture/material concepts and seamless pale limestone | Generated with OpenAI ImageGen for this project; source references in design/new-gallery-*.png and design/limestone-clean-source.png. Served floor texture is public/art/limestone-clean.webp. The navigable building is real Three.js geometry. |
| Production 3D sculptures and architectural meshes | Project-authored Three.js geometry code; no imported external sculpture mesh |
| Logo bitmap | Generated for this project |
| Logo SVG and GLB | Project-authored vector/solid geometry based on the project logo |
| Music and effects | Project-authored Web Audio synthesis; no downloaded recording |
| Gallery furniture, oak louvers, olive plants and wall typography | Procedural Three.js geometry and canvas lettering authored for this project in src/gallery-details.js. No external model or additional image assets. |
| Second-floor screening hall concept | Generated with OpenAI ImageGen for this project; design/cinema-concept.png is a direction reference, not a runtime screenshot. |
| “Afterglow / 여운의 문” film and poster | Original three-act Three.js motion artwork (luminous portals, folded metallic ribbons, expanding light fragments) with project-authored Web Audio felt-piano music, recorded in-browser with MediaRecorder as H.264/AAC MP4. The poster is a frame from the same artwork. No external video, stock music, paid generation service, or imported model. Authoring source: design/film-production. |
| Second-floor hall, seats and stairs | Project-authored Three.js geometry; repeated chair parts use instanced meshes. |
| Actual process screenshots | Browser captures of the running project, not concept renderings |
| Fonts / libraries | Pretendard SIL OFL; Helvetiker original license in public/fonts; Three.js MIT; React MIT; Vite MIT |

The evaluated Veiled Phantom Bust by 3DBOX42 (Printables, CC BY-NC 4.0) was **not used** in this app or included in the source archive. No commercial permission for it was assumed. No derivative mesh was generated from that STL.

Suggested portfolio description: “Fictional 3D web exhibition. Planning, identity, frontend and interactive 3D implementation assisted by AI. Concept images, paintings and material images generated with AI. Sculptures and architectural forms implemented with procedural geometry.”

The gallery's procedural sculptures still differ from the initial image concepts, particularly the veiled bust. Do not present the concepts as screenshots of the actual implementation, or describe AI-generated paintings as manually painted or scanned works.

Rooms 07–10 extend the existing gallery: four new ImageGen paintings, four original procedural solid sculptures (folded sheet, balancing mobile, seven bowed slabs, and spiral ribbon). Concept references and original painting PNGs are stored in design/expansion; production textures use WebP. The music was rewritten as an original warm felt-piano-style synthesized score, with no purchased or downloaded recording.
