---
name: open-generative-ai
description: "Set up, run, extend and troubleshoot Open Generative AI (github.com/Anil-matcha/Open-Generative-AI) — the open-source Next.js + Electron AI studio for image, video, audio, lip sync, cinema, workflow and agent generation on top of the MuAPI model catalog. Use when cloning or building the app, wiring a MuAPI access key, fixing the submodule/workspace build, adding or modifying a studio tab, calling MuAPI models from code, configuring local inference (sd.cpp or Wan2GP), or packaging the desktop app."
---

# Open Generative AI

Working guide for [Open Generative AI](https://github.com/Anil-matcha/Open-Generative-AI) — a
Next.js 15 + React 19 monorepo (also shipped as an Electron desktop app) that wraps the
[MuAPI](https://muapi.ai) model catalog in ~15 generation studios. MIT licensed.

**It is an application, not a library.** You clone it and run it; you don't `npm install` it
into another project. The reusable part is the `packages/studio` component library, consumed
through the npm workspace.

## The one thing that breaks every setup

`npm install` alone does **not** produce a runnable app. The repo has three git submodules and
four npm workspaces that must be built before either dev script works. Always:

```bash
git clone --recurse-submodules https://github.com/Anil-matcha/Open-Generative-AI.git
cd Open-Generative-AI
npm run setup     # submodule init + npm install + build:packages
```

`npm run setup` is exactly `git submodule update --init --recursive && npm install && npm run build:packages`.
If a clone already exists without submodules, run `git submodule update --init --recursive`
then `npm run setup`.

Requires Node 18+ (the Dockerfile uses Node 20).

## Choosing an entry point

| Goal | Command | Result |
|---|---|---|
| Desktop app (Electron + Vite) | `npm run electron:dev` | Native window; the upstream-recommended path |
| Web app (Next.js) | `npm run dev` | http://localhost:3000 → redirects to `/studio` |
| Production web | `npm run build && npm run start` | |
| Container | `docker compose up --build` | Host port **3001** → container 3000 |

Local model inference (sd.cpp / Wan2GP) is **desktop-only** — it does not work under `npm run dev`.

## API key

The app is BYOK against MuAPI. Get an access key at
[muapi.ai/access-keys](https://muapi.ai/access-keys) and paste the **key value**, not the key
name — a common failure. The app prompts on first use and stores it in `localStorage` under
`muapi_key`; `MuapiClient.getKey()` reads `window.__MUAPI_KEY__` first, then that entry. The key
is never sent anywhere except MuAPI.

`process.env.MUAPI_KEY` exists as a server-side fallback in one route only — it is not the main
path, so do not tell users to put a key in `.env` and expect the UI to pick it up. There is no
`.env.example` in the repo.

Skip the key entirely if only local models will be used.

## Repo layout

```
app/                    Next.js App Router — /studio, /workflow, /agents, /assistant, /zh (i18n)
  api/                  Catch-all proxy routes to MuAPI + upload endpoints
components/             StandaloneShell.js (tab nav + BYOK), ApiKeyModal.js
packages/studio/        Shared React component library — all studio UIs live here
packages/Vibe-Workflow/         submodule → workflow-builder workspace
packages/Open-Poe-AI/           submodule → ai-agent workspace
packages/Open-AI-Design-Agent/  submodule → design-agent workspace
src/                    Vite/Electron entry (main.js, lib/muapi.js, lib/models.js)
electron/main.js        Electron main process (package.json "main")
```

Two parallel `lib/muapi.js` + `lib/models.js` trees exist (`src/lib/` for the Vite/Electron
build, `packages/studio/src/` for the shared library). Check which one the code path you are
editing actually imports before changing a model definition.

## Editing a studio

Every studio is exported from `packages/studio/src/index.js`: `ImageStudio`, `VideoStudio`,
`AudioStudio`, `ClippingStudio`, `VibeMotionStudio`, `LipSyncStudio`, `RecastStudio`,
`CinemaStudio`, `MarketingStudio`, `WorkflowStudio`, `AgentStudio`, `DesignAgentStudio`,
`AppsStudio`, `McpCliStudio`, `AiInfluencerStudio`, `LayersStudio`.

To add or change one:

1. Edit/create the component in `packages/studio/src/components/`.
2. Export it from `packages/studio/src/index.js`.
3. Register the tab in `components/StandaloneShell.js`.
4. Rebuild the workspace — `npm run build:studio` — or changes will not appear.

Image and Video studios are **dual-mode**: they swap their whole model list depending on whether
a reference image is present (text-to-image vs image-to-image, text-to-video vs image-to-video).
Model capability flags drive which controls render (aspect ratio, resolution, quality, duration),
so a new model needs correct metadata in `models.js`, not new UI.

See [references/muapi.md](references/muapi.md) for the generation client and model catalog, and
[references/deployment.md](references/deployment.md) for desktop packaging and local inference.

## Troubleshooting

**`Couldn't find a 'pages' directory`** — Next.js can't see `app/`. Run `npm run dev` from the
repo root, and confirm submodules are populated (`ls packages/Vibe-Workflow`). Re-run `npm run setup`.

**Empty `packages/*` directories** — submodules were never initialised: `git submodule update --init --recursive`.

**"API Key missing. Please set it in Settings."** — thrown by `MuapiClient.getKey()`. The
localStorage entry is missing or the user pasted the key's *name* instead of its value.

**Studio changes not showing** — `packages/studio` is a built workspace; re-run `npm run build:studio`.

**Windows SmartScreen / macOS Gatekeeper warnings** on the prebuilt installers are expected;
the binaries are unsigned. The README documents the click-through for each.
