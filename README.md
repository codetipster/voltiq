# ⚡ VoltiQ

> A modular toolkit for EV charging calculations, simulation, and energy analytics.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.12-8884d8?style=flat)](https://recharts.org/)
[![Vitest](https://img.shields.io/badge/Vitest-2.0-6E9F18?style=flat&logo=vitest&logoColor=white)](https://vitest.dev/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Testing](#testing)

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

### Task 2a: Interactive UI

- **Mobile-first responsive design** (works on phone, tablet, desktop)
- **Custom components** built from scratch
- **Real-time parameter adjustment** with interactive sliders
- **Data visualization** with power demand and event charts

---

## 🛠️ Tech Stack

### Core

- **React 19** - UI framework
- **TypeScript 5** - Type safety and developer experience
- **Vite 7** - Lightning-fast build tool and dev server

### Styling

- **Tailwind CSS 4** - Utility-first CSS framework
- **Custom components** - No pre-built UI libraries

### Data & State

- **Recharts** - Composable charting library
- **date-fns** - Date utilities
- **seedrandom** - Deterministic pseudo-random number generation

### Development & Testing

- **Vitest** - Fast unit test framework
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
│   │   ├── types.ts             # TypeScript interfaces
│   │   └── index.ts             # Public API
│   │
│   ├── components/              # Task 2a - React UI
│   │   ├── atomic/              # Basic building blocks
│   │   │   ├── AlertDialog.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Label.tsx
│   │   │   ├── Slider.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── index.ts
│   │   └── voltiq/              # VoltIQ-specific components
│   │       ├── ChargePointTypeManager.tsx
│   │       ├── ConfigurationForm.tsx
│   │       ├── ConfigurationList.tsx
│   │       ├── SimulationResults.tsx
│   │       └── index.ts
│   │
│   ├── types/                   # TypeScript type definitions
│   │   └── simulation.ts        # Simulation-related types
│   │
│   ├── utils/                   # Utility functions
│   │   ├── mockApi.ts           # Mock API for frontend
│   │   └── mockData.ts          # Mock data generation
│   │
│   ├── styles/
│   │   └── globals.css          # Global styles & Tailwind imports
│   │
│   ├── App.tsx                  # Root component with main UI
│   ├── main.tsx                 # Application entry point
│   └── cli.ts                   # Command-line simulation runner
│
├── tests/
│   └── simulation/              # Task 1 unit tests
│       └── engine.test.ts
--- docs/                        # images
|    |----screenshots/
|         |--desktop.png
|         |--mobile.png
|
├── public/                      # Static assets
│   └── vite.svg
├── index.html                   # HTML entry point
├── vite.config.ts               # Vite configuration
├── vitest.config.ts             # Vitest configuration
├── tsconfig.json                # TypeScript configuration
├── tsconfig.app.json            # App-specific TypeScript config
├── tsconfig.node.json           # Node-specific TypeScript config
├── eslint.config.js             # ESLint configuration
└── package.json                 # Dependencies and scripts
```

---

## 🚀 Quick Start - Running Voltiq

### Prerequisites

- Node.js 18+ and npm 9+

### Installation & Run

```bash
# Clone the repository
git clone <repository-url>
cd voltiq

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

That's it! The application UI should now be running. 🎉

### Running the simulation locally (Optional)

You can run the simulation engine directly from the command line to test different configurations:

```bash
# Run with default configuration (20 chargers, 11kW, 100% arrival rate)
npm run simulate

# Run with custom parameters
npm run simulate numChargers=10 chargerPowerKW=22 arrivalMultiplier=150

# Run with different car efficiency
npm run simulate carEfficiencyKWhPer100Km=20

# Combine multiple parameters
npm run simulate numChargers=15 chargerPowerKW=50 arrivalMultiplier=120 carEfficiencyKWhPer100Km=16
```

**Available parameters:**
- `numChargers` - Number of charge points (1-30)
- `chargerPowerKW` - Power per charger in kW (3.7-350)
- `arrivalMultiplier` - Arrival rate multiplier (0.2-2.0)
- `carEfficiencyKWhPer100Km` - Car efficiency (10-30 kWh/100km)
- `seed` - Random seed for reproducible results (optional)

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

```

### Test Coverage

- ✅ Simulation accuracy (validates against expected ranges)
- ✅ Probability distribution sampling
- ✅ Edge cases (zero arrivals, max capacity, fractional ticks)
- ✅ Deterministic behavior (seeded RNG)
- ✅ Performance benchmarks

## 📚 Task Breakdown

### ✅ Task 1: Simulation Logic

**Location**: `src/simulation/`

### ✅ Task 2a: Frontend UI

**Location**: `src/components/`

## 🎨 Design Philosophy

### Simplicity & Clarity

- Clean, uncluttered interface
- Clear visual hierarchy
- Intuitive controls

### Performance

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

---

## 👤 Author

**Samuel** - Junior Mobile Engineer Applicant  
(Technical Assessment for Reonic GmbH)

---

## 🙏 Acknowledgments

- Reonic team for the interesting problem statement
- The React and TypeScript communities for excellent tooling
- Open-source maintainers of all dependencies used
