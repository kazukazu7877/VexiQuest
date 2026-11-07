# VexiQuest

*195 nations. One curious mind.*

[![Live Demo](https://img.shields.io/badge/Live_Demo-vexiquest.vercel.app-f59e0b?style=flat&logo=vercel&logoColor=white)](https://vexiquest.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Status](https://img.shields.io/badge/Status-Actively_Developing-10B981?style=flat)](#development-status)

![VexiQuest Homepage Screenshot](./docs/screenshots/homepage.png)
*VexiQuest voyage hub — 1980s retro arcade interface with real-time interactive 3D orthographic globe, difficulty selection, and persistent personal records.*

---

## About VexiQuest

**VexiQuest** is a retro arcade-inspired flag guessing game built around the study of **vexillology** — the history, symbolism, and design of national flags.

The project pairs geographical learning with the focused tension of classic coin-op arcade gauntlets. Players explore 195 sovereign nations across tiered difficulties, test their recall against high-resolution vector flags, manage limited voyage lives, build answer streaks, and unlock curated cultural and historical trivia for every country.

Designed with an aesthetic reminiscent of 1980s arcade terminals and vintage navigation instruments, VexiQuest runs entirely in the browser with real-time vector graphics, an orthographic 3D canvas globe, and procedural chiptune soundscapes.

---

## Features

- **195 Sovereign Nations:** Full flag dataset comprising 193 UN member states plus Vatican City and Palestine.
- **Three Tiered Difficulties:** Hand-curated country pools tailored for beginners (*Easy*), experienced travellers (*Medium*), and vexillology scholars (*Hard*).
- **Endless Gameplay:** Randomized country decks with strict repeat prevention so flags do not cycle until the active pool is exhausted.
- **Contextual Hint System:** Clues based on geography, geography facts, capitals, and landmarks (free in Easy, life-costing in Medium, disabled in Hard).
- **Lives & Scoring:** Visual life counters with arcade hearts and compasses, dynamic point rewards, and consecutive-answer streak bonuses.
- **Country Facts & Trivia:** Educational post-answer summaries presenting capitals, continents, aliases, and interesting historical details.
- **Interactive 3D Globe:** Custom orthographic projection built with D3-geo and TopoJSON that smoothly tracks pointer movement.
- **Procedural Web Audio Engine:** Nostalgic 16-bit arcade sound effects and chiptune melodies synthesized in real time via the Web Audio API without bulky audio files.
- **Persistent Personal Bests:** LocalStorage tracking for high scores, best streaks, and total voyages across each difficulty tier.
- **Responsive Layout:** Clean, viewport-optimized layout that adapts between desktop and mobile browsers.

---

## Difficulty Modes

| Difficulty | Nation Pool | Starting Lives | Points / Correct | Hint Rule | Focus |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **Easy** | 48 Most Recognizable Flags | **3 Lives** | **10 pts** | 1 Free hint per flag | Beginners & casual exploration |
| **Medium** | 116 Recognizable & Regional Flags | **2 Lives** | **20 pts** | Hint costs **1 Life** | Seasoned world travellers |
| **Hard** | All 195 Sovereign Nations | **1 Life** | **30 pts** | **No hints allowed** | Vexillology purists |

---

## Screenshots

<div align="center">

### The Flag Gauntlet
![VexiQuest Gameplay Interface](./docs/screenshots/gameplay.png)
*Active gameplay view featuring high-fidelity vector flags, live streak counter, compass health, and instant fuzzy-match input.*

<br/>

### Country Discovery & Fact Reveal
![VexiQuest Fact Reveal](./docs/screenshots/country-reveal.png)
*Cultural trivia, official capital, continent classification, and historical context unlocked after each guess.*

<br/>

### Voyage Log & High Scores
![VexiQuest Game Over Results](./docs/screenshots/results.png)
*Post-voyage breakdown with accuracy calculations, streak analysis, score summaries, and record indicators.*

</div>

---

## Technology Stack

Inspected directly from the project dependencies and configuration:

- **Frontend Framework:** [React 19](https://react.dev) (`react`, `react-dom`)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **Bundler & Build Tool:** [Vite 8](https://vitejs.dev)
- **Linter:** [Oxlint](https://oxc.rs)
- **Globe & Projections:** [d3-geo](https://github.com/d3/d3-geo), [topojson-client](https://github.com/topojson/topojson-client), [world-atlas](https://github.com/topojson/world-atlas)
- **Flag Assets:** [flag-icons](https://github.com/lipis/flag-icons) & [svg-country-flags](https://github.com/stefangabos/world_countries)
- **Audio Engine:** Native browser Web Audio API (procedural oscillators and gain envelopes)
- **Deployment Platform:** [Vercel](https://vercel.com)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v18 or higher recommended)
- `npm` (bundled with Node.js)

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kazukazu7877/VexiQuest.git
   cd VexiQuest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview the production build locally:**
   ```bash
   npm run preview
   ```

---

## Project Structure

```text
VexiQuest/
├── docs/                      # Genuine game captures and repository assets
│   ├── assets/                # Social preview screenshot
│   └── screenshots/           # Real in-game screenshots
├── public/                    # Static assets (favicons, SVG icons, country flags)
│   └── flags/                 # 195 vector country flag SVGs
├── src/
│   ├── assets/                # Branding icons
│   ├── components/            # React UI components
│   │   ├── AudioControls.tsx       # Music and sound effects toggles
│   │   ├── CompassLives.tsx        # Compass and pixel life meters
│   │   ├── FlagCard.tsx            # Flag presentation card with accurate aspect ratios
│   │   ├── GameOverScreen.tsx      # Results breakdown, accuracy and high score log
│   │   ├── GameScreen.tsx          # Active guessing gauntlet interface
│   │   ├── HomeScreen.tsx          # Voyage hub and mode selection
│   │   ├── Icons.tsx               # Vector retro arcade iconography
│   │   ├── InfoCard.tsx            # Country facts, capital, and trivia modal
│   │   ├── InteractiveGlobe.tsx    # D3-geo orthographic 3D canvas globe
│   │   ├── PixelHearts.tsx         # Arcade heart health indicators
│   │   └── VintageDecorations.tsx  # CRT scanlines and border flourishes
│   ├── data/
│   │   ├── countries.ts            # 195-country database (hints, capitals, facts)
│   │   ├── difficultyPools.ts      # Easy, Medium, and Hard flag groupings
│   │   └── flagRatios.json         # Aspect ratio mapping for all flags
│   ├── types/
│   │   └── game.ts                 # TypeScript interfaces and difficulty configs
│   ├── utils/
│   │   ├── answerChecker.ts        # Fuzzy matching, accent normalization, and aliases
│   │   ├── gamePool.ts             # Deck randomization and repeat prevention
│   │   ├── soundEngine.ts          # Procedural Web Audio synth engine
│   │   └── storage.ts              # LocalStorage persistence for records
│   ├── App.css                # Retro arcade CRT styling and animations
│   ├── App.tsx                # Master state machine and screen navigation
│   ├── index.css              # Typography and base reset
│   └── main.tsx               # React application entry point
├── package.json               # Scripts and dependencies
├── tsconfig.json              # TypeScript compiler settings
├── vercel.json                # Vercel SPA routing rewrites
└── vite.config.ts             # Vite configuration
```

---

## Deployment

VexiQuest is deployed on **Vercel** and accessible worldwide:

- **Live URL:** [https://vexiquest.vercel.app](https://vexiquest.vercel.app)
- **Deployment Workflow:** Connected to the `main` branch of this repository. Pushes to `main` trigger automated builds and continuous atomic deployments.

---

## Credits & Attribution

- **Flag Vector Graphics:** Distributed via [flag-icons](https://github.com/lipis/flag-icons) and [svg-country-flags](https://github.com/stefangabos/world_countries) under MIT / Public Domain licenses.
- **Geographical Topography:** Land and country TopoJSON data from [world-atlas](https://github.com/topojson/world-atlas) (Natural Earth public domain datasets).
- **Map Projections:** Spherical mathematics powered by [d3-geo](https://github.com/d3/d3-geo) (ISC License).
- **Audio:** Original procedural synthesizers written for VexiQuest using the native browser Web Audio API.

---

## License & Usage

All rights reserved by the author. An open-source license has not yet been assigned to this repository. You may view and run the code for personal, non-commercial evaluation.

---

## Development Status

**Actively Developing.**

VexiQuest is under active development. Planned features include timed sprint modes, continental filters, daily challenges, and additional historical trivia.
