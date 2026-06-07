# 🤖 Agent Instructions (AGENTS.md)

Welcome, AI Agent! This document contains critical context and rules for maintaining the CholesTrack codebase.

## 🧬 Project Philosophy
CholesTrack is built to feel like a high-end medical/tech instrument ("Cyber-Clinical").
- **Dark Mode First**: All UI should prioritize readability in low light and high-contrast accents.
- **Immediate Feedback**: Every input should trigger a visible change in the UI or Chart state immediately.
- **Modular Simplicity**: Keep logic in `app.js` organized by functional blocks (UI, Data, Auth, Chart).

## 🛠 Tech Stack Constraints
- **No Build Step**: The current version relies on CDNs. Do not add `npm` dependencies that require a bundler unless explicitly requested by the user.
- **Tailwind Only**: Use Tailwind utility classes for all styling. Avoid custom CSS in `index.html` where possible.
- **Mock-First**: If adding new features that require a backend, provide a local mock implementation (e.g., using `localStorage`) alongside the stubbed Firebase code.

## 📊 Data Layer
- **Historical Data**: Seeded data should always maintain a realistic trend (e.g., physiological limits).
- **Projections**: Projections should be clearly visually distinguished (currently using dashed lines and reduced opacity).

## 🧪 Testing & Verification
- Use **Playwright** for visual verification of UI changes.
- Ensure the **Service Worker** (`sw.js`) cache list is updated if you add new external assets.
