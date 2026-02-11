# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick commands

- Install deps: `npm install`
- Dev (auto-select platform): `npm run dev:custom` (runs `uni -p`, prompts/uses target platform)
- Dev H5: `npm run dev:h5` (dev server at http://localhost:3000)
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
- H5 router mode is configured as `hash` in `pages.json`.

## Architecture overview

This is a UniApp + Vue 3 e-commerce application ("橘上生香") built with Vite.

- **App entry**: `src/main.js` exports `createApp()` using `createSSRApp(App)` pattern.
- **Top-level component**: `src/App.vue` defines UniApp lifecycle hooks (`onLaunch`, `onShow`, `onHide`).
- **Pages**: Defined in `src/pages.json` with custom navigation styling on most pages.

**Page structure**:
- TabBar pages: `index/index`, `mall/mall`, `me/me`
- Auth: `auth/login`
- Product: `product/detail`, `admin/admin` (management)
- Order: `order/orders`, `order/detail`
- Checkout: `checkout/checkout`
- Address: `address/address`, `address/form`

**Data layer** (`src/utils/`):
- `request.js`: Token management and mock API layer using localStorage
- Domain modules: `user.js`, `product.js`, `cart.js`, `order.js`, `address.js`

**Custom components**: `src/components/`

**Key dependencies**:
- Vue 3 with Composition API
- Vue-i18n for internationalization
- Sass for styling

**Configuration files**:
- `vite.config.js`: Vite config with `@dcloudio/vite-plugin-uni`, dev server on port 3000
- `src/manifest.json`: Platform-specific settings for App-plus and mini-programs
- `src/uni.scss`: Global styles

**Static assets**: `src/static/` (includes tab bar icons)
