# K Raj Shekar — ePortfolio

> Live on Vercel · Built with Next.js + WebAssembly (C)

## 🧠 The C / WASM angle

`portfolio.wat` (WebAssembly Text Format — the human-readable form of C-level logic) is compiled to a `.wasm` binary and embedded in the app. It runs real C-style functions in the browser:

| C function | What it does |
|---|---|
| `months_experience(sy, sm, cy, cm)` | Computes months at AWS Cloud Club |
| `skill_score(seed, base)` | Deterministic skill bar percentages |
| `hash2(x, y)` | Seeds particle positions & colours in the hero canvas |
| `grade_stars(score*10)` | Converts 90.6% → 5 stars |
| `clamp(v, lo, hi)` | Integer clamp utility |

## 🗂 Structure

```
portfolio/
├── src/app/
│   ├── layout.tsx       — Next.js root layout
│   ├── page.tsx         — Main portfolio page (uses WASM)
│   ├── page.module.css  — All styles
│   ├── globals.css      — CSS variables + resets
│   └── wasm.ts          — WASM loader (base64 embedded)
├── portfolio.wat         — C-level WebAssembly source
├── portfolio.wasm        — Compiled binary
├── next.config.js
├── package.json
├── tsconfig.json
└── vercel.json
```

## 🚀 Deploy to Vercel

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "🚀 portfolio"
git remote add origin https://github.com/rajshekarsachin9-svg/portfolio.git
git push -u origin main

# 2. Go to vercel.com → New Project → Import repo → Deploy
# That's it. Done.
```

Or use Vercel CLI:
```bash
npm i -g vercel
vercel
```

## 🛠 Local dev

```bash
npm install
npm run dev
# open http://localhost:3000
```
