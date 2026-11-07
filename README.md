# VexiQuest

*195 nations. One curious mind.*

[Play VexiQuest](https://vexiquest.vercel.app) · [Report an Issue](https://github.com/kazukazu7877/VexiQuest/issues)

[![Live Demo](https://img.shields.io/badge/Demo-vexiquest.vercel.app-f59e0b?style=flat&logo=vercel&logoColor=white)](https://vexiquest.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Status](https://img.shields.io/badge/Status-Actively_Developing-10B981?style=flat)](#development-status)

![VexiQuest Homepage Screenshot](./docs/screenshots/homepage.png)
*The Voyage Hub: interactive 3D orthographic globe, difficulty selection, and persistent personal records.*

---

## What is VexiQuest?

**VexiQuest** is a flag-guessing game inspired by the study of **vexillology** (the history and symbolism of flags) and the feel of classic arcade games.

You are given a flag, a text box, and a set number of lives. Your goal is simple: recognize as many national flags as you can, keep your streak alive, and learn something new about the world along the way. Every country in the database includes interesting historical notes, its capital city, and geographical context shown after each answer.

Visually, the game pairs a dark retro-arcade theme with vintage map-making details: CRT scanlines, pixel hearts, a rotatable wireframe globe, and nostalgic 16-bit sound synthesized directly in code.

---

## Features

- **195 Countries:** Covers all 193 UN member states plus Vatican City and Palestine.
- **Three Difficulties:** Hand-picked flag pools ranging from well-known nations to obscure islands.
- **Endless Mode:** Cards are drawn from a randomized deck with repeat prevention so you won't see duplicate flags until you've cycled through the pool.
- **Hints:** Contextual clues including capital cities, geographic landmarks, and historical facts (free in Easy, costs a life in Medium, disabled in Hard).
- **Lives & Scoring:** Track your streak, score points per correct flag, and watch out for near-miss life deductions.
- **Country Trivia:** Quick facts and background for every nation appear after you submit an answer.
- **Interactive 3D Globe:** A rotatable wireframe globe on the home screen built using D3 projections and TopoJSON land data.
- **Procedural Sound Engine:** Chiptune melodies and retro sound effects created on the fly with the Web Audio API—no external audio files needed.
- **Personal Records:** High scores and longest streaks are saved locally in your browser for each difficulty level.
- **Responsive Layout:** Designed to work cleanly on desktop monitors, tablets, and phones.

---

## Difficulty Modes

| Difficulty | Country Pool | Starting Lives | Points / Flag | Hint Rule |
| :--- | :---: | :---: | :---: | :--- |
| **Easy** | 48 common flags | 3 Lives | 10 pts | 1 free hint per flag |
| **Medium** | 116 common + regional flags | 2 Lives | 20 pts | Hint costs 1 life |
| **Hard** | All 195 nations | 1 Life | 30 pts | No hints allowed |

---

## Screenshots

<div align="center">

### The Flag Gauntlet
![Gameplay Screen](./docs/screenshots/gameplay.png)
*Guessing view with vector flag rendering, streak tracker, compass health meter, and fuzzy-matching input.*

<br/>

### Country Discovery & Trivia
![Country Reveal](./docs/screenshots/country-reveal.png)
*Cultural facts, official capital, continent, and trivia unlocked after each guess.*

<br/>

### Voyage Summary
![Results Screen](./docs/screenshots/results.png)
*Post-game screen showing final score, accuracy percentage, best streaks, and personal records.*

</div>

---

## Tech Stack

Built with a focused, modern web stack:

- **Framework:** [React 19](https://react.dev)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **Bundler:** [Vite 8](https://vitejs.dev)
- **Linter:** [Oxlint](https://oxc.rs)
- **Globe & Projections:** [d3-geo](https://github.com/d3/d3-geo), [topojson-client](https://github.com/topojson/topojson-client), [world-atlas](https://github.com/topojson/world-atlas)
- **Flags:** [flag-icons](https://github.com/lipis/flag-icons) & [svg-country-flags](https://github.com/stefangabos/world_countries)
- **Audio:** Web Audio API (procedural synthesis)
- **Hosting:** [Vercel](https://vercel.com)

---

## Running Locally

### Prerequisites

- [Node.js](https://nodejs.org) (v18 or higher recommended)
- `npm` (comes with Node.js)

### Setup

1. **Clone the repo:**
   ```bash
   git clone https://github.com/kazukazu7877/VexiQuest.git
   cd VexiQuest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local dev server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## Project Structure

```text
VexiQuest/
├── docs/                      # Screenshots and documentation assets
│   ├── assets/                # Social preview image
│   └── screenshots/           # In-game captures (home, gameplay, reveal, results)
├── public/                    # Static files
│   └── flags/                 # SVG vector flags for all 195 countries
├── src/
│   ├── components/            # UI components (Globe, FlagCard, InfoCard, Screens)
│   ├── data/
│   │   ├── countries.ts       # 195-country database (capitals, hints, facts)
│   │   ├── difficultyPools.ts # Partitioned flag pools for Easy, Medium, Hard
│   │   └── flagRatios.json    # Aspect ratio definitions for accurate display
│   ├── types/                 # TypeScript interfaces and game configs
│   ├── utils/
│   │   ├── answerChecker.ts   # Fuzzy string matching and alias normalizer
│   │   ├── gamePool.ts        # Randomizer and repeat prevention
│   │   ├── soundEngine.ts     # Procedural chiptune synth and SFX
│   │   └── storage.ts         # LocalStorage persistence for high scores
│   ├── App.tsx                # Game state coordinator
│   └── main.tsx               # App entry point
├── package.json
└── vite.config.ts
```

---

## Deployment

The game is hosted on **Vercel** with automatic deployments on every push to `main`:

**Live URL:** [https://vexiquest.vercel.app](https://vexiquest.vercel.app)

---

## Credits & Attributions

- **Flag Vectors:** Sourced from [flag-icons](https://github.com/lipis/flag-icons) and [svg-country-flags](https://github.com/stefangabos/world_countries) under MIT / Public Domain licenses.
- **Geographic Data:** Land and country TopoJSON data from [world-atlas](https://github.com/topojson/world-atlas) (Natural Earth public domain datasets).
- **Map Projections:** Mathematics powered by [d3-geo](https://github.com/d3/d3-geo) (ISC License).
- **Sound:** Custom procedural oscillators and noise generators using the browser Web Audio API.

---

## License

All rights reserved by the author. A formal open-source license has not yet been selected. You are welcome to view and run the code locally for personal exploration.

---

## Development Status

**Actively Developing.**

VexiQuest is an ongoing personal project. Next up on the roadmap: timed expedition modes, continent-specific filters, and daily challenges.
