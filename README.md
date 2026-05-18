# 🧩 Cube Solve

<div align="center">

[![React](https://img.shields.io/badge/React-19.2.6-61DAFB?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0.12-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.184.0-000000?style=flat&logo=three.js)](https://threejs.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js->=16-339933?style=flat&logo=node.js)](https://nodejs.org)
[![Status](https://img.shields.io/badge/Status-Active-success?style=flat)]()

**A precision AI-powered Rubik's Cube solver with camera scanning and step-by-step visualization**

[Features](#-features) • [Demo](#-getting-started) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage)

</div>

---

## 📋 Overview

**Cube Solve** is a full-stack web application that leverages computer vision and advanced solving algorithms to help users solve Rubik's cubes. Scan all six faces of your cube with your device camera, and the application will generate an optimal solution using the Kociemba algorithm, displaying moves in a beautiful 3D visualization.

Built as a **Computer Science portfolio project** demonstrating proficiency in modern web technologies, real-time graphics rendering, algorithm implementation, and mobile-first UI design.

---

## ✨ Features

- 📷 **Camera Scanning** - Real-time color detection from device camera
- 🤖 **Optimal Solving** - Uses Kociemba algorithm (solves any cube in ≤20 moves)
- 🎨 **3D Visualization** - Interactive Three.js cube rendering with smooth animations
- ✋ **Manual Input** - Enter cube colors manually if camera scanning isn't available
- 📊 **Solution Review** - Step-by-step move guide with visual feedback
- 💾 **History Tracking** - Save and review past cube solutions
- ⚙️ **Settings Panel** - Customize preferences and reset data
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- ♿ **Accessibility** - Semantic HTML and keyboard navigation support

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
- **Cube Solver** - Cube state representation and manipulation
- **Cubing.js** - Move notation and standard cube terminology

### Development
- **ESLint 10** - Code quality and style enforcement
- **Vite React Plugin** - Fast refresh during development

---

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm (or yarn/pnpm)
- Git
- A modern web browser with camera support (for scanning feature)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/farhanbin65/Cube-Solve.git
   cd Cube-Solve
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173` (Vite default)
   - The app will hot-reload on file changes

---

## 🚀 Usage

### Getting Started

1. **Welcome Screen** - Read the 4-step process overview
2. **Choose Input Method**
   - 📷 **Scan with Camera**: Allow camera access and scan each face
   - ✏️ **Enter Manually**: Input cube colors through the UI
3. **Review Data** - Verify all detected/entered colors are correct
4. **Generate Solution** - Algorithm computes optimal move sequence
5. **Follow Guide** - Watch the 3D cube and follow step-by-step instructions
6. **Success!** - Celebrate your solved cube

### Available Scripts

```bash
npm run dev       # Start development server with HMR
npm run build     # Optimize and bundle for production
npm run preview   # Preview production build locally
npm run lint      # Check code quality with ESLint
```

---

## 📁 Project Structure

```
Cube-Solve/
├── src/
│   ├── components/
│   │   ├── Cube3D.jsx          # 3D cube renderer with Three.js
│   │   └── MoveDiagram.jsx     # Move notation visualization
│   ├── screens/
│   │   ├── IntroScreen.jsx     # Welcome and instructions
│   │   ├── CaptureScreen.jsx   # Camera-based color detection
│   │   ├── Cube3Dscreen.jsx    # Interactive 3D cube view
│   │   ├── ReviewScreen.jsx    # Verify detected colors
│   │   ├── SolutionScreen.jsx  # Display solving steps
│   │   ├── SuccessScreen.jsx   # Completion celebration
│   │   ├── HistoryScreen.jsx   # Past solutions
│   │   └── SettingsScreen.jsx  # User preferences
│   ├── utils/
│   │   ├── cubeSolver.js       # Kociemba algorithm wrapper
│   │   └── cubeState.js        # Cube state management
│   ├── App.jsx                 # Router setup
│   ├── AppShell.jsx            # Main layout wrapper
│   └── main.jsx                # React entry point
├── public/                     # Static assets
├── package.json               # Dependencies and scripts
├── vite.config.js            # Vite configuration
├── eslint.config.js          # Linting rules
└── README.md                 # This file
```

---

## 🎓 Learning Outcomes

This project demonstrates:

- ✅ **Frontend Development**: React hooks, state management, routing
- ✅ **3D Graphics**: Three.js, WebGL, camera controls, animations
- ✅ **Algorithm Integration**: WASM, async operations, error handling
- ✅ **Mobile Development**: Camera API, responsive design, touch events
- ✅ **Code Quality**: ESLint, modular architecture, component reusability
- ✅ **Performance**: Lazy loading, code splitting, optimized renders

---

## 🔧 Configuration

### Vite
- Fast HMR for development
- Optimized production builds with rollup
- CSS preprocessing support

### ESLint
- React best practices enforcement
- React Hooks linting rules
- Code consistency and style

### Camera Permissions
- Application requests camera access when scanning starts
- User can deny or revoke permissions anytime
- Graceful fallback to manual entry

---

## 🚧 Future Enhancements

- [ ] Two-phase solving algorithm option (beginner-friendly)
- [ ] Cube scramble generator
- [ ] Multiple language support
- [ ] Dark/Light theme toggle
- [ ] Share solutions via URL
- [ ] Leaderboard and statistics tracking
- [ ] Mobile app with native camera features

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Farhan Bin Hossain** | Computer Science Student
- 📧 Email: [Your Email]
- 💼 LinkedIn: [Your LinkedIn]
- 🐙 GitHub: [@farhanbin65](https://github.com/farhanbin65)

---

## 🙏 Acknowledgments

- **Kociemba Algorithm** - Optimal Rubik's cube solving
- **Three.js Community** - 3D graphics and examples
- **React Documentation** - Best practices and patterns
- **Vite Team** - Ultra-fast build tooling

---

<div align="center">

**If you found this project helpful, please consider giving it a ⭐ on GitHub!**

</div>
