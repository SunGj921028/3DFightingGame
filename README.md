# 3D Fighting Game

A browser-based 3D fighting game built with vanilla JavaScript and WebGL2, featuring real-time combat, first/third-person camera switching, dynamic shadows, cubemap reflections, and OBJ model loading.

---

## Project Highlights

- **Pure WebGL2 pipeline**: no game engine, rendering and interaction built from scratch
- **Playable combat loop**: movement, attack, skill cast, enemy HP, win condition
- **Advanced graphics features**:
  - shadow mapping (off-screen depth pass)
  - dynamic environment reflection (cubemap framebuffer)
  - normal mapping with TBN tangent space
- **Immersive control system**: pointer-lock mouse look + WASD + jump + mode switching
- **Custom OBJ loader**: in-project parser for model geometry and tangent-space preparation

---

## Demo Snapshot

![3DFightingGame Screenshot](https://github.com/user-attachments/assets/b36e6629-3c4f-4d86-ba89-a102afbdc485)

---

## Tech Stack

- **Language**: JavaScript
- **Graphics API**: WebGL2
- **Math Utilities**: `cuon-matrix.js`
- **Assets**: OBJ models + textures + cubemap
- **Runtime**: Browser Canvas (`<canvas id="webgl">`)

---

## Gameplay Features

- Player movement: `W/A/S/D`
- Jump: `Space`
- Camera mode toggle: `T` (first person / third person)
- Mouse sensitivity toggle: middle mouse or `I` guidance flow
- Attack: left mouse click
- Skill cast: right mouse click (temporary enemy slow)
- Pause with pointer unlock / resume with pointer lock
- Enemy HP reduction and game-over victory state

---

## Graphics and Rendering Pipeline

### 1) Multi-pass rendering

- **Shadow pass**: render scene depth to `shadowFBO`
- **Reflection pass**: render cubemap views to `dynamicReflectionFBO`
- **On-screen pass**: combine lighting, texture, shadows, and reflection

### 2) Lighting model

- Ambient + Diffuse + Specular (Phong-like shading)
- Light-space depth comparison for shadow visibility
- Percentage-closer style sampling for softer shadow edges

### 3) Normal mapping

- Tangent/bitangent generated per triangle from OBJ geometry + UVs
- TBN matrix built in vertex shader
- Normal map sampled in fragment shader for detailed surface lighting

---

## System Architecture & Project Structure

```text
3DFightingGame/
├── index.html            # App entry and script loading order
├── WebGL.js              # Core render loop, game state, camera, combat timing/collision checks
├── shader.js             # Shader sources: main shading, shadow map, env cube, reflection
├── init.js               # Program creation + uniform/attribute binding + FBO setup hooks
├── framebuffer.js        # Off-screen framebuffer utilities (shadow + cubemap rendering)
├── model.js              # OBJ loading/parsing and tangent-space data generation
├── object.js             # Scene object draw orchestration
├── setMat.js             # Matrix and material setup per draw call
├── interation.js         # Input system: pointer lock, keyboard/mouse actions, view mode switch
├── texture.js            # Texture and cubemap loading
├── cuon-matrix.js        # Matrix/vector math helper
├── screen_design.css     # UI and HUD styling
└── object/               # OBJ models
```

---

## Key Technical Points

- Designed a complete WebGL render architecture without external engine abstractions.
- Implemented shader-based shadows and dynamic cubemap reflections in the same scene.
- Built custom OBJ parsing and tangent-space generation to support normal mapping.
- Integrated gameplay logic and rendering loop while maintaining responsive camera/input behavior.
- Used pointer-lock based control to simulate FPS-style interaction in browser.

---

## Run Locally

Because models/textures are loaded via `fetch`, run with a local static server (do not open by `file://` directly).

### Option A: VSCode Live Server

- Open project folder
- Run **Live Server** on `index.html`

### Option B: Python static server

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

---

## Known Limitations

- Game logic and rendering state are largely global-variable driven, making large-scale extension harder.
- Enemy behavior is simple/randomized rather than full AI state machine.
- No build pipeline or module bundling; script loading is direct in `index.html`.

---

## Future Improvements

- Refactor to modular game architecture (entity/component or scene-system style).
- Add robust collision volumes and hitbox/hurtbox logic.
- Upgrade enemy AI to behavior tree or finite-state machine.
- Add audio feedback, combo system, and richer UI/HUD.
- Introduce TypeScript + lint/test tooling for maintainability.
