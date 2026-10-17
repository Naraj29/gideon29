# ⚡ Gideon 29 — Universal Intelligence & Productivity Suite

<div align="center">

![Gideon 29 Banner](https://img.shields.io/badge/GIDEON-AI%20Intelligence-amber?style=for-the-badge&logo=openai&logoColor=black)
![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Ollama](https://img.shields.io/badge/Ollama-Local%20LLM-black?style=for-the-badge&logo=ollama)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=for-the-badge&logo=vite)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)

**A high-performance, local-first intelligence and productivity ecosystem featuring local LLM integration and 14 unified workspaces.**

</div>

---

## 🌟 Key Highlights

- 🧠 **Gideon AI Intelligence**: Powered locally via **Ollama** (`qwen2.5:1.5b` / local models) with fallback resilience, autonomous action execution, and contextual conversation memory.
- 🛠️ **Universal Workspace Suite**: 14 purpose-built, interconnected productivity tools running client-side with zero cloud lock-in.
- 🌓 **Dual Adaptive Themes**: Seamless dynamic switching between **Adaptive Obsidian Dark Mode** (`#09090b`) and **Clean Alabaster Light Mode** (`#f8fafc`).
- 🌐 **Full Bilingual Support**: Instant toggling between **English** and **Hindi (हिन्दी)** with persistent localization across all navigation, tools, and actions.
- ⚡ **Ultra-Fast & Modern**: Built with React 18, Vite 5, Tailwind CSS 4, and Framer Motion for responsive, tactile micro-interactions.

---

## 🧰 14 Integrated Workspaces

| Tool | Route | Description |
| :--- | :--- | :--- |
| 📖 **Personal Diary** | `/tools/diary` | Private sanctuary for introspective thoughts, sentiment tracking, and daily entries. |
| 📋 **Task Master** | `/tools/todo` | Priority-based task tracking with high-contrast execution and instant actions. |
| 📅 **Unified Calendar** | `/tools/calendar` | Interactive event scheduling, synchronization, and monthly agendas. |
| 💼 **Event Architect** | `/tools/planner` | Structured project roadmaps, milestones, and deliverables tracker. |
| 📝 **Note Archive** | `/tools/notes` | Rich markdown note-taking, pinning, tagging, and instant search. |
| 🛡️ **The Vault** | `/tools/vault` | Secure client-side credential and sensitive asset password manager. |
| 🧭 **The Navigator** | `/tools/compass` | Hardware sensor integration for geographical heading and orientation. |
| 🧮 **The Calculator** | `/tools/calculator` | Precision computations with permanent historical auditing and tape ledger. |
| 📡 **DropZone P2P** | `/tools/dropzone` | High-speed zero-cloud local peer-to-peer Wi-Fi file transfers. |
| 📷 **QR Studio** | `/tools/qrstudio` | Dynamic matrix code generation and camera optical scanning. |
| 💓 **Life Tracker** | `/tools/lifetracker` | Biometric telemetry, sleep quality, hydration, and habit tracking. |
| 🎬 **Media Tracker** | `/tools/media` | Unified tracking hub for movies, series, games, and literature collections. |
| 🤝 **Promise Tracker** | `/tools/promise` | Solemn commitment ledger with honor and accountability metrics. |
| 🗓️ **Timetable Maker** | `/tools/timetable` | Tactical daily schedule block planner and routine execution. |

---

## 🏗️ Architecture

```
gideon/
├── backend/
│   ├── server.js              # Express API server & Ollama LLM streaming bridge
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Layout, Sidebar, Navbar, AIPreviewSidebar
│   │   ├── context/           # ThemeContext (Dark/Light), LanguageContext (EN/HI)
│   │   ├── pages/             # Home, AIPage, ToolSelectionPage, Search, History
│   │   ├── tools/             # 14 distinct workspace modules
│   │   └── styles/            # globals.css (Tailwind v4 tokens & glassmorphism)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18 or newer
- **Ollama** installed locally ([Download Ollama](https://ollama.com))

### 2. Pull Ollama Model
Run Ollama with the lightweight 1.5B parameter model:
```bash
ollama run qwen2.5:1.5b
```

### 3. Setup Backend
```bash
cd backend
npm install
node server.js
```
The backend server runs at `http://localhost:3010`. Check `http://localhost:3010/health` to confirm Ollama connection status.

### 4. Setup Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` (or the port Vite provides) in your browser.

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env`)
```env
VITE_GIDEON_BACKEND="http://localhost:3010"
VITE_FIREBASE_API_KEY="your_api_key"
VITE_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
```

---

## 🎨 Themes & Localization

- **Theme Switching**: Toggle between dark and light themes dynamically from the navigation bar or profile drawer.
- **Language Selection**: Toggle between English and Hindi with full translation support across cards, buttons, titles, and placeholders.

---

## 👤 Author

Developed by **[naraj29](https://github.com/naraj29)**  
GitHub Repository: **[naraj29/gideon29](https://github.com/naraj29/gideon29)**
