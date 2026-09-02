# Deployment, packaging and local inference

## Docker

```bash
docker compose up --build     # http://localhost:3001
```

The compose file maps host **3001** → container 3000 and sets `NODE_ENV=production`. The
Dockerfile is a four-stage Node 20 Alpine build (`base` → `deps` → `builder` → `runner`) that
copies each workspace's `package*.json` before `npm install`, then runs `build:packages` and
`build`. Because it copies the submodule package manifests explicitly, **submodules must be
checked out on the host before building the image** — an empty `packages/Vibe-Workflow` fails
the COPY.

## Desktop builds (electron-builder)

| Command | Output |
|---|---|
| `npm run electron:build` | macOS DMG (x64 + arm64) |
| `npm run electron:build:win` | Windows NSIS installer (x64) |
| `npm run electron:build:linux` | Linux AppImage + .deb (x64) |
| `npm run electron:build:linux:dir` | Unpacked Linux dir (fast iteration) |
| `npm run electron:build:all` | mac + win + linux in one pass |
| `npm run package:linux:deb[:arm64\|:x64]` | .deb via `scripts/package-linux-deb.js` |
| `npm run stage:local-ai` | Stage the sd.cpp binary into `build/local-ai` before packaging |

Artifacts land in `release/`. App id `ai.generative.open`, product name "Open Generative AI",
`main` is `electron/main.js`, and `afterPack.js` runs post-package. `build/local-ai` is copied
in as an extra resource, and the Linux build ships `build/linux/apparmor.profile`.

Every build runs `vite build` first — the Electron app loads the Vite bundle from `dist/`, not
the Next.js output. Editing `app/` alone will not change the desktop app.

Prebuilt installers are unsigned: Windows shows SmartScreen, macOS shows Gatekeeper
(`gatekeeperAssess: false` only disables the check at build time, not on the user's machine).

## Local inference — desktop only

Configured under **Settings → Local Models**. Two independent engines; neither works in the
hosted/`npm run dev` web version.

### sd.cpp (bundled)

C++ [stable-diffusion.cpp](https://github.com/leejet/stable-diffusion.cpp) engine, installed
in-app with one click — nothing lands system-wide. Metal on Apple Silicon, CUDA/Vulkan/ROCm on
Linux/Windows, CPU everywhere. Image models only: Z-Image Turbo/Base, Dreamshaper 8,
Realistic Vision v5.1, Anything v5, SDXL Base 1.0. Z-Image additionally needs two shared aux
files (Qwen3-4B text encoder 2.4 GB, FLUX VAE 335 MB).

Once installed, toggle **⚡ Local** next to the model selector in Image Studio. No API key needed.

Storage root:

- macOS `~/Library/Application Support/open-generative-ai/local-ai`
- Windows `%APPDATA%\open-generative-ai\local-ai`
- Linux `~/.config/open-generative-ai/local-ai`

Override with `OPEN_GENERATIVE_AI_LOCAL_AI_DIR` before launching; the app creates `bin/`,
`models/` and `tmp/` under it. Engine logs go to the app's process console — launch from a
terminal when debugging.

Memory: Z-Image wants 16 GB RAM and is known to hang 8 GB M-series Macs — use SD 1.5 there.
On an M2, SD 1.5 should run ~1–2 s/step with Metal; ~10 s/step means it fell back to CPU.

To sanity-check the engine outside the UI, drive `sd-cli` directly (same binary the app uses):

```bash
APP_DATA="${OPEN_GENERATIVE_AI_LOCAL_AI_DIR:-$HOME/Library/Application Support/open-generative-ai/local-ai}"
DYLD_LIBRARY_PATH="$APP_DATA/bin" "$APP_DATA/bin/sd-cli" \
  -m "$APP_DATA/models/DreamShaper_8_pruned.safetensors" \
  -p "a serene mountain lake at sunrise, oil painting" \
  -o /tmp/sd15-test.png --steps 12 -H 512 -W 512 --cfg-scale 7.5 --seed 42 \
  --sampling-method euler_a
```

A Metal-backed run prints `total params memory size = ... (VRAM 1969.78MB, RAM 0.00MB)`. If
VRAM is `0.00MB`, the dylib is CPU-only — check
`otool -L "$APP_DATA/bin/libstable-diffusion.dylib" | grep -i metal` and reinstall the engine.

### Wan2GP (bring your own server)

The app bundles no Python and no weights — it is an HTTP client to a
[Wan2GP](https://github.com/deepbeepmeep/Wan2GP) Gradio server you run on a CUDA/ROCm GPU box:

```bash
git clone https://github.com/deepbeepmeep/Wan2GP && cd Wan2GP
./install.sh                                    # install.bat on Windows
python wgp.py --listen --server-name 0.0.0.0
```

Paste the URL (e.g. `http://192.168.1.42:7860`) into **Settings → Local Models → Wan2GP server**,
Test, Save. Gives you Flux.1 Dev and Qwen Image (image), plus Wan 2.2 T2V/I2V, Hunyuan Video and
LTX Video. Image Studio explicitly rejects video output; full Video Studio wiring is upstream
roadmap. Wan2GP's runtime is CUDA-only (no MPS), which is why it is remote — a Mac can drive a
Linux GPU box, gaming PC, or a rented RunPod/vast.ai instance.
