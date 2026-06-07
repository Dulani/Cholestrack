# CholesTrack | Personalized Lipid Optimization System

CholesTrack is a production-ready Progressive Web App (PWA) designed for systems biology enthusiasts and health-conscious individuals. It provides a "Cyber-Clinical" interface to track cholesterol levels, lifestyle inputs, and simulated hardware data streams.

![CholesTrack Dashboard](https://raw.githubusercontent.com/placeholder-path-to-screenshot/dashboard.png)

## 🚀 Features

- **KPI Dashboard Grid**: Real-time tracking of Total Cholesterol, LDL, and HDL with delta variance and clinical targets.
- **Dynamic Visualization**: Interactive Chart.js plotting with 60-day rolling windows, smooth cubic interpolation, and linear trend projections.
- **Lifestyle Loggers**:
  - 🍎 **Food Intake**: Track saturated fat and soluble fiber.
  - 🏃 **Physical Activity**: Log exercise type, duration, and MET-mapped intensity.
  - 💊 **Supplement Logger**: Manage your daily health regimen.
- **Hardware Emulators**:
  - ⌚ **Smartwatch**: Simulate active calorie burn and HR trends.
  - ⚖️ **Smart Scale**: Monitor weight and body water percentage.
  - 🩸 **Manual Home Test**: Commit new lipid results to your history instantly.
- **PWA Ready**: Offline caching, manifest compliance, and "Add to Home Screen" support.

## 🛠 Tech Stack

- **Frontend**: Tailwind CSS (CDN), Chart.js (CDN), FontAwesome.
- **Backend**: Firebase v11 (Auth & Firestore) - currently stubbed for rapid prototyping.
- **Architecture**: Modular vanilla JS with PWA Service Workers.

## 📦 Getting Started

### Prerequisites
- Any modern web browser.
- A local web server (e.g., Live Server, `python -m http.server`, or Firebase Hosting).

### Installation
1. Clone the repository.
2. Serve the directory from your local server.
3. Open the browser and navigate to the local address.

## 📄 Documentation

- [Firebase Setup Guide](FIREBASE_SETUP.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Agent Instructions](AGENTS.md)

## ⚖️ License
MIT License - 2024 CholesTrack Systems Biology UI.
