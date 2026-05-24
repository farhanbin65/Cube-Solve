# Cube Solve

<div align="center">

[![React](https://img.shields.io/badge/React-19.2.6-61DAFB?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0.12-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.184.0-000000?style=flat&logo=three.js)](https://threejs.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js->=16-339933?style=flat&logo=node.js)](https://nodejs.org)
[![Status](https://img.shields.io/badge/Status-Active-success?style=flat)]()

**A precision AI-powered Rubik's Cube solver with camera scanning and step-by-step visualization**

[Features](#-features) • [Demo](#-live-demo) • [Tech Stack](#-tech-stack) • [Usage](#-usage)

</div>

---

## Overview

**Cube Solve** is a full-stack web application that uses computer vision and the Kociemba algorithm to generate optimal Rubik's Cube solutions in ≤20 moves. Scan all six faces with your camera or enter colors manually, then follow the solution through interactive 3D visualization or a step-by-step move guide.

---

## 🔴 Live Demo

🌐 **Web App** → [solvecuber.netlify.app](https://solvecuber.netlify.app)

🎮 **itch.io** → [farhanbin.itch.io/rubiks-cube-3d-scanner](https://farhanbin.itch.io/rubiks-cube-3d-scanner)

---
### Application Workflow

```mermaid
graph TD
   START([START: Landing Page]) -->|Scan Cube| SCAN[SCAN MODE]
   START -->|Enter Manually| MANUAL[MANUAL MODE]

   SCAN -->|Auto-detect faces| REVIEW[REVIEW SCREEN]
   MANUAL -->|Fill 54 stickers| REVIEW

   REVIEW -->|Validation Fails / Looks Wrong| START
   REVIEW -->|Confirm Legal State ✓| HUB[MAIN HUB]

   HUB -->|Explore| V3D[3D VIEW]
   HUB -->|Animate| SOLVE[AUTO-PLAY SOLVE]
   HUB -->|Follow Steps| STEPS[STEP-BY-STEP SOLUTION]

   V3D --> END([END: Solved State ✓])
   SOLVE --> END
   STEPS --> END

   %% Styling Elements
   subgraph Input Modes
      SCAN
      MANUAL
   end

   subgraph Solution Engines
      V3D
      SOLVE
      STEPS
   end

   classDef default fill:#fafafa,stroke:#333,stroke-width:1px,font-family:'Helvetica Neue',Arial,sans-serif,font-size:11pt;
   classDef startEnd fill:#2c3e50,stroke:#2c3e50,font-weight:bold,color:#fff;
   classDef important fill:#e74c3c,stroke:#c0392b,color:#fff,font-weight:bold;
   classDef hub fill:#3498db,stroke:#2980b9,color:#fff,font-weight:bold;

   class START,END startEnd;
   class REVIEW important;
   class HUB hub;
```

---

## Features

- **Camera Scanning** - Real-time color detection from device camera
- **Optimal Solving** - Kociemba algorithm solves any cube in ≤20 moves
- **3D Visualization** - Interactive Three.js cube rendering with smooth animations
- **Manual Input** - Enter cube colors manually if camera scanning isn't available
- **Solution Review** - Step-by-step move guide with visual diagrams
- **History Tracking** - Save and review past cube solutions
- **Settings Panel** - Customize preferences and reset data
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile


---

## 🛠 Tech Stack

### Frontend
- **React 19** - UI framework with hooks and modern patterns
- **Vite 8** - Lightning-fast build tool and dev server
- **React Router v7** - Client-side routing
- **Three.js** - 3D graphics and WebGL rendering
- **React Three Fiber** - React renderer for Three.js
- **Lottie** - Smooth animations and illustrations

### Algorithms & Solving
- **Kociemba WASM** - WebAssembly-based optimal cube solver
- **Cubing.js** - Move notation and cube state manipulation

### Development
- **ESLint 10** - Code quality and style enforcement
- **Vite React Plugin** - Fast refresh during development

---

##  Usage

### Getting Started

1. **Welcome Screen** - Read the 4-step process overview
2. **Choose Input Method**
   - **Scan with Camera**: Allow camera access and scan each face
   - **Enter Manually**: Input cube colors through the UI
3. **Review Data** - Verify all detected/entered colors are correct
4. **Generate Solution** - Algorithm computes optimal move sequence
5. **Follow Guide** - Watch the 3D cube and follow step-by-step instructions
6. **Success!** - Celebrate your solved cube

---
## Changelog

### v1.1.0 — Bug Fixes
- **Fixed** D and B face tile index mapping in Review screen (vertical flip correction)
- **Fixed** U and D move arrow directions in Solution screen
- **Fixed** B face sticker mapping in 3D renderer (`SCAN_TO_3D`)
- **Fixed** Empty Kociemba result incorrectly treated as "already solved"
- **Fixed** Invalid cube state now correctly returns error instead of false positive

---

## Future Enhancements

- [ ] PWA support — offline mode after first visit
- [ ] Two-phase solving algorithm (beginner-friendly)
- [ ] Share solutions via URL
- [ ] Leaderboard and statistics tracking

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Author

**Farhan Bin Hossain** | Computer Science Student
- Portfolio: [Farhan Bin Hossain](https://www.farhanbin.dev)
- GitHub: [@farhanbin65](https://github.com/farhanbin65)

---

##  Acknowledgments

- **Kociemba Algorithm** - Optimal Rubik's cube solving
- **Three.js Community** - 3D graphics and examples
- **React Documentation** - Best practices and patterns
- **Vite Team** - Ultra-fast build tooling

---
