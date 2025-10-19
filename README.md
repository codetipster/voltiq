# ⚡ VoltiQ

> A modular toolkit for EV charging calculations, simulation, and energy analytics — built for engineers and researchers.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.12-8884d8?style=flat)](https://recharts.org/)
[![Vitest](https://img.shields.io/badge/Vitest-2.0-6E9F18?style=flat&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Storybook](https://img.shields.io/badge/Storybook-8.3-FF4785?style=flat&logo=storybook&logoColor=white)](https://storybook.js.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Task Breakdown](#task-breakdown)

---

## 🎯 Overview

This application simulates electric vehicle charging station usage patterns over a full year to help business owners make informed decisions about EV infrastructure investments. By modeling realistic arrival patterns and charging demands, it calculates:

- **Total energy consumption** (kWh/year)
- **Peak power demand** (kW)
- **Concurrency factor** (actual vs. theoretical maximum demand)
- **Charging event patterns** over time

The simulator demonstrates that while 20 chargers at 11kW each have a **theoretical maximum** of 220kW, the **actual peak demand** is typically only 77-121kW due to staggered usage patterns.

Voltiq simulates real-world electric vehicle (EV) charging demand to help businesses estimate:

- Total yearly energy usage
- Actual peak load
- Concurrency factor compared to theoretical maximum

This project implements:

- **Task 1:** EV charging simulation engine (mathematical model)
- **Task 2a:** Interactive UI for configuring and visualizing results

---

## ✨ Features

### Task 1: Simulation Engine

- **Year-long simulation** : in 15-minute intervals (35,040 data points)
- **Probabilistic modeling** : using real-world arrival and demand distributions
- **Deterministic randomness** : with seeded RNG for reproducible results
- **High-performance** : simulation completes in ~100-200ms
- **Fully tested** : with 95%+ code coverage

### Task 2a: Interactive UI

- **Mobile-first responsive design** (works on phone, tablet, desktop)
- **Custom components** built from scratch (no UI libraries)
- **Real-time parameter adjustment** with interactive sliders
- **Data visualization** with power demand and event charts
- **Component library** with Storybook documentation

---

## 🛠️ Tech Stack

### Core

- **React 18** - UI framework
- **TypeScript 5** - Type safety and developer experience
- **Vite 5** - Lightning-fast build tool and dev server

### Styling

- **Tailwind CSS 3** - Utility-first CSS framework
- **Custom components** - No pre-built UI libraries (per requirements)

### Data & State

- **Zustand** - Lightweight state management
- **Recharts** - Composable charting library
- **date-fns** - Date utilities
- **seedrandom** - Deterministic pseudo-random number generation

### Development & Testing

- **Vitest** - Fast unit test framework
- **React Testing Library** - Component testing
- **Storybook 8** - Component development and documentation
- **ESLint** - Code quality
- **Prettier** - Code formatting

---

## 📁 Project Structure

```
voltiq/
├── src/
│   ├── simulation/              # Task 1 - Simulation Engine
│   │   ├── core/
│   │   │   ├── engine.ts        # Main EVChargingSimulator class
│   │   │   ├── constants.ts     # Probability distributions (T1, T2)
│   │   │   └── utils.ts         # Helper functions (random sampling, etc.)
│   │   ├── mock/
│   │   │   └── generator.ts     # Fast mock data for instant UI feedback
│   │   ├── types.ts             # TypeScript interfaces
│   │   └── index.ts             # Public API
│   │
│   ├── components/              # Task 2a - React UI
│   │   ├── atoms/               # Basic building blocks
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Slider.tsx
│   │   ├── molecules/           # Component combinations
│   │   │   ├── ConfigSlider.tsx
│   │   │   └── MetricCard.tsx
│   │   └── organisms/           # Complex components
│   │       ├── ConfigForm.tsx
│   │       ├── PowerChart.tsx
│   │       └── ResultsDashboard.tsx
│   │
│   ├── pages/
│   │   └── SimulationPage.tsx   # Main application page
│   │
│   ├── store/
│   │   └── simulationStore.ts   # Zustand state management
│   │
│   ├── hooks/
│   │   └── useSimulation.ts     # Custom React hooks
│   │
│   ├── styles/
│   │   └── globals.css          # Global styles & Tailwind imports
│   │
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Application entry point
│
├── tests/
│   ├── simulation/              # Task 1 unit tests
│   │   ├── engine.test.ts
│   │   ├── constants.test.ts
│   │   └── utils.test.ts
│   └── components/              # Task 2a component tests
│
├── .storybook/                  # Storybook configuration
├── public/                      # Static assets
├── index.html                   # HTML entry point
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+

### Installation & Run

```bash
# Clone the repository
git clone <repository-url>
cd ev-charging-calculator

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

That's it! The application should now be running. 🎉

---

## 💻 Development

### Available Scripts

| Command                   | Description                                   |
| ------------------------- | --------------------------------------------- |
| `npm run dev`             | Start development server (hot reload enabled) |
| `npm run build`           | Build for production                          |
| `npm run preview`         | Preview production build locally              |
| `npm test`                | Run all tests with Vitest                     |
| `npm run test:ui`         | Run tests with interactive UI                 |
| `npm run test:coverage`   | Generate test coverage report                 |
| `npm run storybook`       | Launch Storybook component explorer           |
| `npm run build-storybook` | Build Storybook for deployment                |
| `npm run simulate`        | Run standalone simulation (CLI)               |
| `npm run lint`            | Check code quality with ESLint                |
| `npm run format`          | Format code with Prettier                     |

### Development Workflow

1. **Start dev server**: `npm run dev`
2. **Open Storybook** (in new terminal): `npm run storybook`
3. **Make changes** - Hot reload updates instantly
4. **Run tests**: `npm test` (runs in watch mode)
5. **Check types**: TypeScript checks automatically in your IDE

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test engine.test.ts

# Run in UI mode (interactive)
npm run test:ui
```

### Test Coverage

The project maintains **95%+** code coverage for the simulation engine (Task 1). Key test areas:

- ✅ Simulation accuracy (validates against expected ranges)
- ✅ Probability distribution sampling
- ✅ Edge cases (zero arrivals, max capacity, fractional ticks)
- ✅ Deterministic behavior (seeded RNG)
- ✅ Performance benchmarks

## 📚 Task Breakdown

This project fulfills the Reonic technical assessment requirements:

### ✅ Task 1: Simulation Logic

**Location**: `src/simulation/`

**Requirements Met**:

- [x] Simulate 20 chargepoints with 11kW power
- [x] Full year simulation (365 days, 35,040 intervals)
- [x] Implement T1 arrival probability distribution
- [x] Implement T2 charging demand distribution
- [x] Calculate total energy consumed (kWh)
- [x] Calculate theoretical maximum demand (220kW)
- [x] Calculate actual maximum demand (77-121kW range)
- [x] Calculate concurrency factor (35-55% range)
- [x] **Bonus**: Support 1-30 chargepoints with varying concurrency
- [x] **Bonus**: Deterministic seeded randomness

**Run standalone**:

```bash
npm run simulate
```

### ✅ Task 2a: Frontend UI

**Location**: `src/components/`, `src/pages/`

**Requirements Met**:

- [x] Input parameters:
  - Number of chargepoints (1-30)
  - Arrival probability multiplier (20-200%)
  - Car efficiency (kWh/100km)
  - Charging power (kW)
- [x] Output visualizations:
  - Power demand chart (kW over time)
  - Total energy consumed (kWh)
  - Charging events per period
  - Exemplary day view
- [x] Mobile-first responsive design
- [x] Custom components (no UI libraries)
- [x] Tailwind CSS styling
- [x] Recharts for data visualization
- [x] Storybook component documentation

**View Storybook**:

```bash
npm run storybook
```

### 🔗 Integration

The UI seamlessly integrates with the simulation engine:

1. User adjusts parameters via sliders
2. Mock results display instantly (< 10ms)
3. Real simulation runs in background (~150ms)
4. Results update with actual data
5. Charts visualize power demand and charging patterns

This demonstrates both tasks working together in a cohesive, production-ready application.

---

## 🎨 Design Philosophy

### Simplicity & Clarity

- Clean, uncluttered interface
- Clear visual hierarchy
- Intuitive controls

### Performance

- Progressive enhancement (mock → real data)
- Optimized rendering (debounced updates)
- Fast simulation (< 200ms for full year)

### Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Sufficient color contrast

### Code Quality

- Strong TypeScript typing
- Modular component architecture
- Comprehensive test coverage
- Self-documenting code

---

## 📸 Screenshots

### Desktop View

![Desktop View](docs/screenshots/desktop.png)

### Mobile View

![Mobile View](docs/screenshots/mobile.png)

### Storybook

![Storybook](docs/screenshots/storybook.png)

---

## 👤 Author

**Samuel** - Junior Mobile Engineer Applicant  
Technical Assessment for Reonic GmbH

---

## 📄 License

This project is created as part of a technical assessment and is not licensed for commercial use.

---

## 🙏 Acknowledgments

- Reonic team for the interesting problem statement
- The React and TypeScript communities for excellent tooling
- Open-source maintainers of all dependencies used

---

**Built with ❤️ and ⚡ for sustainable mobility**
