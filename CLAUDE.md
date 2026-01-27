# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick commands

- Install deps: `npm install`
- Dev (auto-select platform): `npm run dev:custom` (runs `uni -p`, prompts/uses target platform)
- Dev H5: `npm run dev:h5`
- Dev H5 SSR: `npm run dev:h5:ssr`
- Dev mini-programs (examples):
  - Weixin: `npm run dev:mp-weixin`
  - Alipay: `npm run dev:mp-alipay`
  - Harmony: `npm run dev:mp-harmony`

- Build H5: `npm run build:h5`
- Build H5 SSR: `npm run build:h5:ssr`
- Build mini-programs (examples):
  - Weixin: `npm run build:mp-weixin`
  - Alipay: `npm run build:mp-alipay`
  - Harmony: `npm run build:mp-harmony`

Notes:
- Scripts are thin wrappers around the `uni` CLI.
- There are no explicit lint/test scripts configured in `package.json`.

## Architecture overview

This is a UniApp + Vue 3 project scaffolded to build via Vite.

- Vite entry/config:
  - `vite.config.js` registers `@dcloudio/vite-plugin-uni`.
  - `index.html` loads the app entry at `/src/main.js`.

- App bootstrap:
  - `src/main.js` exports `createApp()` and uses `createSSRApp(App)` (UniApp/Vue 3 pattern).
  - `src/App.vue` is the top-level application component and defines UniApp lifecycle hooks (`onLaunch`, `onShow`, `onHide`).

- Routing / pages:
  - `src/pages.json` defines the app pages and global navigation styling.
  - Example page: `src/pages/index/index.vue`.

- Platform manifests:
  - `src/manifest.json` holds platform-specific configuration for App-plus and mini-program builds.

- Styles / assets:
  - Global styles live in `src/uni.scss`.
  - Static assets are under `src/static/`.

## Notable files

- `template.html`: a standalone static HTML template (includes external CDN assets). It is not referenced by the Vite/UniApp entry by default; treat it as separate from the UniApp runtime unless you wire it in explicitly.
