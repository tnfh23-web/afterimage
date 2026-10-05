# Eastern rooms — design and implementation brief

Extend AFTERIMAGE in its existing visual system. Preserve rooms 01–06 and attach an eastern loop through rooms 03 and 04: 07 Folded Light, 08 A Quiet Balance, 09 Layers of Silence, 10 The Shape of Breath. Each room contains one procedural 3D sculpture and one independently generated digital painting.

## Locked visual system

Existing 16 m square concrete rooms with 5.1 m ceilings, open 4 m doorways, gray tiled reflective floors, thin black lighting bars, low wall uplights. Painting remains left of the back-wall doorway and cannot overlap it. Ivory sculpture, aged bronze details, dark low plinth. UI uses Pretendard, charcoal #181A19, ivory #EEEAE2, muted #BCB9B1, existing navigation and artwork inspector.

The four room-NN-concept.png references were generated before implementation using the built-in ImageGen tool. They specify the full room composition and each new sculpture: broad folded vertical sheet; bronze mast with three ivory oval balancing discs; seven bowed vertical slabs; thick ivory spiral ribbon with bronze edges. All sculpture faces, edges, supports and bases must exist as actual Three.js geometry, not image billboards. Existing real-time renderer and practical performance limits remain applicable.

## Painting prompts

- 07: warm cream and ochre abstract folded paper, subtle mineral pigment, layered planes and a soft afternoon beam.
- 08: small rocky sand islands emerging from silky golden mist, distant mountains, luminous ivory sky.
- 09: blue-gray landscape of translucent mist strata, off-white ridges, restrained indigo.
- 10: soft peach dawn, one pale circular sun emerging from gently layered clouds, cream and muted coral.

One built-in ImageGen call per painting, referencing its corresponding room concept. Each artwork fills a standalone 1536×1024 asset, without frames, walls, signatures or UI. Original PNGs are retained here; served WebP textures live under public/art.

## Input and sound

Space jump with gravity, ground landing and unchanged horizontal wall collision. Mobile: a 112 px joystick with a 54 px handle, proportional speed, diagonals, captured pointer release/cancellation and a separate 68 px jump button. Movement, camera drag and jump accept distinct simultaneous pointers. No selection or iOS touch callout on gallery or controls; normal text selection remains in the reading dialogs.

Warm piano-style major chord score at 66 BPM with short restrained reverb, no long minor drone or piercing octave chimes. Footsteps have a stronger filtered transient and a short low body. No walking footsteps while airborne; one landing step. Sound remains on by default, first gesture unlocks playback, mute and volume are preserved.
