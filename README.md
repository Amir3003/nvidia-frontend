> Scheduled website radar: [GITHUB_RADAR_SETUP.md](GITHUB_RADAR_SETUP.md). Oracle VM setup for Telegram and Discord: [ORACLE_BOTS_SETUP.md](ORACLE_BOTS_SETUP.md). Local setup: [LOCAL_SETUP.md](LOCAL_SETUP.md). The bots' radar commands read the published JSON; CV scores and draft messages are still static examples. Rotate any bot token or webhook previously committed to this public repository.

<p align="center">
  <img src="public/logo.png" width="120" alt="QADAM Logo" />
</p>

<h1 align="center">QADAM («Қадам») — AI Opportunity & Career Hub</h1>

<p align="center">
  <strong>Autonomous Career Agent · Real-Time Opportunity Radar · Zero-Leak PII Privacy Shield · Multi-Channel Messenger Ecosystem</strong>
</p>

<p align="center">
  <a href="https://nvidia-pathfinder.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-Vercel-10B981?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
  <a href="https://discord.gg/A4rxRGx4Vt"><img src="https://img.shields.io/badge/Discord-Community-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord Community" /></a>
  <a href="https://t.me/QadamAgentBot"><img src="https://img.shields.io/badge/Telegram-@QadamAgentBot-0088cc?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram Bot" /></a>
  <img src="https://img.shields.io/badge/React%2019-TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/NVIDIA%20NIM-Nebius%20AI-76B900?style=for-the-badge&logo=nvidia&logoColor=white" alt="NVIDIA NIM" />
</p>

---

> ### *"QADAM («Қадам») — derived from the Kazakh word for 'step'. Your confident step toward global opportunities, grants, and technologies. 🚀"*

---

## 🌟 Executive Summary

**QADAM («Қадам»)** is a sovereign, production-grade AI platform and autonomous agent interface built for ambitious students, academic researchers, and developer squads. 

It solves the fragmented discovery and high-stakes application problem for global tech competitions, academic research fellowships, and engineering grants. Through client-side identity tokenization, dynamic ATS resume benchmark analysis, and native multi-channel bots (Telegram, Discord, KakaoTalk), QADAM acts as an always-on personal career scout that keeps sensitive personal information strictly protected.

---

## 🏛️ Core Architecture & Pillars

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       QADAM CLIENT & AGENT RUNTIME                          │
│                                                                             │
│   ┌────────────────────┐   ┌─────────────────────┐   ┌───────────────────┐  │
│   │ 🎯 Opportunity     │   │ 📄 ATS CV & Skill   │   │ 🧠 Agent Memory   │  │
│   │    Radar           │   │    Benchmark Lab    │   │    (MEMORY.md)    │  │
│   └─────────┬──────────┘   └──────────┬──────────┘   └─────────┬─────────┘  │
│             │                         │                        │            │
│             └─────────────────────────┼────────────────────────┘            │
│                                       ▼                                     │
│                     ┌───────────────────────────────────┐                   │
│                     │ 🛡️ CLIENT-SIDE PII SHIELD          │                   │
│                     │ Tokenizes: Name, Email, Phone, ID │                   │
│                     │ Confined to: /workspace/qadam     │                   │
│                     └─────────────────┬─────────────────┘                   │
└───────────────────────────────────────┼─────────────────────────────────────┘
                                        │ (Zero-PII Payload)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CLOUD & AGENT MESSENGER PLATFORMS                        │
│                                                                             │
│  ┌─────────────────────────┐  ┌──────────────────────┐  ┌────────────────┐  │
│  │ ⚡ Nebius Cloud /       │  │ 🤖 Telegram Bot      │  │ 🎮 Discord Bot │  │
│  │    Nemotron 3.5 NIM     │  │    @QadamAgentBot    │  │    & Webhooks  │  │
│  └─────────────────────────┘  └──────────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1. 📡 Real-Time Opportunity Radar (`/`)
- **Curated Global Opportunities:** Continuous index of vetted hackathons, graduate fellowships, and grants (including *Nebius x NVIDIA Global AI Hackathon*, *MEXT AI Research Fellowship (Japan)*, *Anthropic Safety Residency*, *CERN*, and *Y Combinator*).
- **Dynamic Skill-Compatibility Engine:** Computes real-time match compatibility percentages based on candidate verified credentials and quiz badges.
- **Deep Gap Diagnosis:** Direct integration with ATS criteria to detect missing requirements (e.g., Docker containerization or CUDA optimization) and trigger remediation.

### 2. 🛡️ Zero-Leak PII Privacy Shield (`/account?tab=settings`)
- **Client-Side Identity Tokenization:** Replaces student legal names, email addresses, phone numbers, and institutional IDs with cryptographically unlinkable placeholders (`[USER_NAME_1]`, `[EMAIL_MASKED]`, `[ID_MASKED]`) *before* prompt dispatch.
- **Inference Model Protection:** Frontier models (`nvidia/Nemotron-3.5-Lightning` on Nebius Cloud) receive tokenized data only, eliminating PII training risks and metadata profiling.
- **OpenShell Sandbox Confinement:** All agent tools and local file operations are strictly confined within `/workspace/qadam`. Unauthorized traversal attempts (such as accessing `/root/system`) are intercepted and logged by security boundaries.

### 3. 📄 ATS CV & Skill Benchmark Lab (`/cv`)
- **CV Health Index:** Holistic ATS score breakdown across technical stack alignment, structural clarity, and quantified impact.
- **Interactive Verification Quizzes:** 5-question timed technical benchmarks (PyTorch, Docker, LLM Prompt Architecture, Linux Systems) that upgrade unverified CV claims to verified badges, instantly boosting matching probabilities.

### 4. 🧠 Agent Memory Architecture (`/memory`)
- **Genuine `MEMORY.md` Protocol:** Transparent persistence of candidate preferences, behavioral constraints, verified skills, and career goals.
- **Interactive Context Flow Matrix:** Real-time SVG cubic Bezier curve visualizer that illuminates relationships between memory entries and target opportunities upon hover or focus.

### 5. 👥 Squad Network & Teammate Match (`/network`)
- **Collaborative Roster Construction:** Find co-builders with complementary skills for high-stakes team hackathons.
- **Role-Based Filtering:** Match with ML Engineers, Distributed Systems Architects, and Technical Designers.

---

## 🤖 Multi-Channel Agent Ecosystem

QADAM extends beyond the browser directly into developer daily communication workflows:

### 1. Official Telegram Bot (`@QadamAgentBot`)
- **Deep-Link Account Binding:** Clicking *Authorize with Telegram* in QADAM automatically binds the session via deep-link:
  `https://t.me/QadamAgentBot?start=connect_<username>`
- **Native Slash Commands:**
  - `/radar` — Real-time stream of top opportunities with match percentages, prizes, and deadlines.
  - `/gaps` — Diagnostic breakdown of resume gaps and missing credentials.
  - `/privacy` — Verification of client-side PII masking and sandbox containment status.
  - `/help` — Interactive commands index.
- **Confidential Proposal Drafting:** Generates an ATS-tailored proposal outline with student identity tokenized and provides an instant one-click link to [Application Studio](https://nvidia-pathfinder.vercel.app/application-studio).

### 2. Unified Discord Bot (`bot/discord.mjs`)
- **Official Server Community:** [https://discord.gg/A4rxRGx4Vt](https://discord.gg/A4rxRGx4Vt)
- **Rich Emerald & Indigo Embeds:** Interactive server commands (`!radar`, `!gaps`, `!privacy`, `!broadcast`, `!help`).
- **Confidential DM Bridge (`!draft <1|2|3>`):** Dispatches confidential proposal drafts directly to student private DMs to ensure zero public leakage of personal application details.
- **Squad Webhook Broadcaster:** Broadcasts real-time alerts into designated team channels via incoming webhooks.

### 3. KakaoTalk OpenBuilder Integration
- **Seoul & Korea University Delegation Readiness:** Official Kakao i OpenBuilder channel support with 알림톡 (AlimTalk) notification templates for Asian academic grants and regional student hackathons.

---

## 💻 Tech Stack & Engineering Standards

- **Core Framework:** React 19, TypeScript, Vite
- **Routing:** React Router v7 (`react-router-dom`)
- **Styling:** Tailwind CSS with warm daylight and cosmic night palettes, 60fps GPU-accelerated interactive canvas (`AmbientBackground.tsx`)
- **Typography:** Geist (UI text) + JetBrains Mono (metrics, telemetry, and terminal logs)
- **State Management:** Reactive `AppContext` with multi-key `localStorage` resilience
- **Bot Engine:** Zero-external-dependency Node.js 22 native `WebSocket` (Gateway v10) and `fetch` REST client

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js:** v22.0.0 or higher
- **npm:** v10.0.0 or higher

### 1. Clone & Install
```bash
git clone https://github.com/your-username/qadam-opportunity-hub.git
cd qadam-opportunity-hub
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Autonomous Messenger Bots

| Command | Description |
| :--- | :--- |
| `npm run bot` | Starts the Telegram Bot (`@QadamAgentBot`) via long-polling |
| `npm run bot:discord` | Starts the Unified Discord Bot Gateway & REST API listener |
| `npm run bot:all` | Concurrently runs both Telegram and Discord bot processes |

### 4. Production Build & Verification
```bash
npm run build
```

---

## 📂 Project Structure

```
├── bot/
│   ├── index.mjs             # Zero-dependency Telegram Bot (Long Polling & API)
│   └── discord.mjs           # Zero-dependency Discord Bot (Gateway v10 & Webhook)
├── public/
│   ├── logo.png              # Official QADAM Brand Logo (Footprint / Step Icon)
│   ├── favicon.svg           # Vector Favicon
│   └── assets/
│       └── logo.png          # High-resolution asset clone
├── src/
│   ├── components/
│   │   ├── AmbientBackground.tsx    # 60fps interactive particle constellation canvas
│   │   ├── OnboardingWizard.tsx     # 4-step user identity & role registration modal
│   │   ├── OpportunityDetailsModal.tsx # Full opportunity briefing modal
│   │   ├── CvGapsModal.tsx          # ATS gap analysis & quiz launch modal
│   │   ├── QuizModal.tsx            # Interactive skill verification quiz
│   │   ├── Sidebar.tsx              # Brand header & 5 core navigation modules
│   │   └── PageHeader.tsx           # Standardized workspace header
│   ├── context/
│   │   └── AppContext.tsx           # Central store (user profile, memory, logs, radar)
│   ├── db/
│   │   ├── opportunities.ts         # Verified opportunities database & logos
│   │   ├── userProfile.ts           # Roles, tech stack, and user schema
│   │   └── teammates.ts             # Teammate network & squad messaging storage
│   ├── pages/
│   │   ├── WelcomePage.tsx          # Scrollytelling showcase & onboarding portal
│   │   ├── RadarPage.tsx            # Opportunity radar feed & match filters
│   │   ├── CvLabPage.tsx            # ATS CV analyzer & skill lab
│   │   ├── MemoryPage.tsx           # MEMORY.md context flow matrix
│   │   ├── NetworkPage.tsx          # Teammates & squad network hub
│   │   ├── NotificationsPage.tsx    # Multi-channel messenger bots & webhooks
│   │   ├── ApplicationStudioPage.tsx# PII-masked proposal drafting studio
│   │   └── AccountPortalPage.tsx    # Settings, terminal logs, and tech support
│   ├── utils/
│   │   └── anonymizer.ts            # Client-side PII tokenization regex engine
│   ├── App.tsx                      # Root application & routing tree
│   ├── index.css                    # Tailwind CSS configuration & custom utilities
│   └── main.tsx                     # Vite React root mount
├── .env                             # Bot credentials & domain targets (gitignored)
├── .gitignore                       # Repository security exclusions
├── index.html                       # SEO metadata, OpenGraph, and favicon tags
├── package.json                     # Project manifest & bot scripts
├── vercel.json                      # Single-page app routing rewrites for Vercel
└── README.md                        # Documentation & architecture showcase
```

---

## 🤝 Community & Support

- **Live Production Platform:** [https://nvidia-pathfinder.vercel.app](https://nvidia-pathfinder.vercel.app)
- **Discord Developer Community:** [https://discord.gg/A4rxRGx4Vt](https://discord.gg/A4rxRGx4Vt)
- **Official Telegram Agent:** [@QadamAgentBot](https://t.me/QadamAgentBot)
- **License:** MIT

<p align="center">
  <strong>QADAM («Қадам») • Your confident step toward global opportunities. 🚀</strong>
</p>
