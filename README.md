> Scheduled website radar: [GITHUB_RADAR_SETUP.md](GITHUB_RADAR_SETUP.md). Oracle VM setup for Telegram and Discord: [ORACLE_BOTS_SETUP.md](ORACLE_BOTS_SETUP.md). Local setup: [LOCAL_SETUP.md](LOCAL_SETUP.md). The bots' radar commands read the published JSON; CV scores and draft messages are still static examples. Rotate any bot token or webhook previously committed to this public repository.

<p align="center">
  <img src="public/logo.png" width="100" alt="QADAM Logo" />
</p>

<h1 align="center">QADAM («Қадам»)</h1>

<p align="center">
  <strong>AI Opportunity Hub, CV Benchmark & Multi-Channel Career Agent</strong>
</p>

<p align="center">
  <a href="https://discord.gg/A4rxRGx4Vt"><img src="https://img.shields.io/badge/Discord-Community-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord" /></a>
  <a href="https://t.me/QadamAgentBot"><img src="https://img.shields.io/badge/Telegram-@QadamAgentBot-0088cc?style=flat-square&logo=telegram&logoColor=white" alt="Telegram Bot" /></a>
  <img src="https://img.shields.io/badge/React_19-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

---

## Overview

**QADAM** (from Kazakh *«Қадам»* - "step") is a unified platform built for university students, researchers, and engineering teams to discover and apply for global academic grants, fellowships, internships, and tech hackathons.

Instead of browsing dozens of scattered portals, students get a personalized feed matched to their actual technical stack, automated CV gap diagnostics, and instant notifications via Telegram and Discord.

---

## Key Features

- **Opportunity Radar (`/dashboard`):** Curated database of global grants, research fellowships (e.g., MEXT, CERN, DAAD), and AI hackathons with real-time skill-match scoring.
- **CV & Skill Benchmark Lab (`/cv`):** Evaluates resumes against target requirements, highlights missing technical skills, and provides short verification quizzes (PyTorch, Docker, Linux, LLM Engineering) to validate competencies.
- **Client-Side Privacy Filter (`/account`):** Masks personal identifiers (full name, email, phone, student ID) on the client before sending resume text or application drafts to external LLM APIs.
- **Squad & Teammate Finder (`/network`):** Connects students looking for co-builders (ML engineers, backend developers, designers) for upcoming competitions.
- **Application Studio (`/application-studio`):** Workspace for drafting motivation letters and research proposals tailored to specific grant criteria.

---

## Messenger Bots

QADAM integrates directly with Telegram and Discord so students can track deadlines and generate drafts without leaving their messenger.

### Telegram (`@QadamAgentBot`)
- Account linking via deep-link: `https://t.me/QadamAgentBot?start=connect_<username>`
- Commands:
  - `/radar` - Top matched opportunities and upcoming deadlines
  - `/gaps` - Missing skills based on current profile
  - `/privacy` - Status of PII masking
  - `/help` - Command reference

### Discord (`bot/discord.mjs`)
- Server commands: `!radar`, `!gaps`, `!privacy`, `!broadcast`, `!help`
- Direct Message drafting (`!draft <id>`): Sends application outlines directly to private DMs.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, React Router v7, Tailwind CSS
- **State & Storage:** React Context API with local persistence
- **Bots:** Node.js (native WebSocket Gateway v10 & REST APIs for Telegram and Discord)

---

## Getting Started

### Prerequisites
- Node.js 20+ and npm

### 1. Installation
```bash
git clone https://github.com/Amir3003/qadam.git
cd qadam
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory (never commit this file):
```env
# Production Domain
WEB_APP_URL=https://nvidia-pathfinder.vercel.app

# Telegram Bot Credentials
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
BOT_USERNAME=QadamAgentBot

# Discord Bot Credentials
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_INVITE_URL=https://discord.gg/A4rxRGx4Vt
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here
```

### 3. Run Locally
```bash
# Start Vite development server
npm run dev

# Start Telegram Bot (optional)
npm run bot

# Start Discord Bot (optional)
npm run bot:discord

# Run both bots concurrently
npm run bot:all
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## Project Structure

```
qadam/
├── bot/
│   ├── index.mjs             # Zero-dependency Telegram bot (Long polling & API)
│   └── discord.mjs           # Zero-dependency Discord bot (Gateway v10 & Webhook)
├── public/
│   ├── logo.png              # Official QADAM brand logo
│   ├── favicon.svg           # Vector favicon
│   └── assets/
│       └── logo.png          # High-resolution asset clone
├── src/
│   ├── components/
│   │   ├── AmbientBackground.tsx    # Interactive constellation canvas
│   │   ├── OnboardingWizard.tsx     # Student registration & identity modal
│   │   ├── OpportunityDetailsModal.tsx # Opportunity briefing & application modal
│   │   ├── CvGapsModal.tsx          # ATS gap analysis & quiz launch modal
│   │   ├── QuizModal.tsx            # Technical skill verification quiz
│   │   ├── Sidebar.tsx              # Navigation sidebar & mobile bottom bar
│   │   └── ScrollToTop.tsx          # Route & auth scroll reset utility
│   ├── context/
│   │   └── AppContext.tsx           # Global state (profile, memory, opportunities)
│   ├── db/
│   │   ├── opportunities.ts         # Verified opportunities database
│   │   ├── userProfile.ts           # Student profile, skills, and roles
│   │   └── teammates.ts             # Teammate matchmaking network
│   ├── pages/
│   │   ├── WelcomePage.tsx          # Landing & onboarding portal
│   │   ├── RadarPage.tsx            # Opportunity radar feed & match filters
│   │   ├── CvLabPage.tsx            # ATS CV analyzer & skill lab
│   │   ├── MemoryPage.tsx           # MEMORY.md context flow matrix
│   │   ├── NetworkPage.tsx          # Teammates & squad network hub
│   │   ├── NotificationsPage.tsx    # Multi-channel messenger notifications
│   │   ├── ApplicationStudioPage.tsx# PII-masked proposal drafting studio
│   │   └── AccountPortalPage.tsx    # Settings, terminal logs, and tech support
│   ├── utils/
│   │   └── anonymizer.ts            # Client-side PII tokenization regex engine
│   ├── App.tsx                      # Root application & routing
│   ├── index.css                    # Tailwind CSS configuration & custom utilities
│   └── main.tsx                     # React root mount
├── .env                             # Environment variables (gitignored)
├── .gitignore                       # Git exclusion rules
├── index.html                       # SEO metadata, OpenGraph, and favicon tags
├── package.json                     # Project manifest & scripts
├── vercel.json                      # Single-page app routing rewrites for Vercel
└── README.md                        # Documentation
```

---

## License

MIT
```

### 2. Environment Setup
Create a `.env` file in the root directory (never commit this file):
```env
# Production Domain
WEB_APP_URL=https://nvidia-pathfinder.vercel.app

# Telegram Bot Credentials
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
BOT_USERNAME=QadamAgentBot

# Discord Bot Credentials
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_INVITE_URL=https://discord.gg/A4rxRGx4Vt
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here
```

### 3. Run Locally
```bash
# Start Vite development server
npm run dev

# Start Telegram Bot (optional)
npm run bot

# Start Discord Bot (optional)
npm run bot:discord

# Run both bots concurrently
npm run bot:all
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## Project Structure

```
qadam/
├── bot/
│   ├── index.mjs             # Zero-dependency Telegram bot (Long polling & API)
│   └── discord.mjs           # Zero-dependency Discord bot (Gateway v10 & Webhook)
├── public/
│   ├── logo.png              # Official QADAM brand logo
│   ├── favicon.svg           # Vector favicon
│   └── assets/
│       └── logo.png          # High-resolution asset clone
├── src/
│   ├── components/
│   │   ├── AmbientBackground.tsx    # Interactive constellation canvas
│   │   ├── OnboardingWizard.tsx     # Student registration & identity modal
│   │   ├── OpportunityDetailsModal.tsx # Opportunity briefing & application modal
│   │   ├── CvGapsModal.tsx          # ATS gap analysis & quiz launch modal
│   │   ├── QuizModal.tsx            # Technical skill verification quiz
│   │   ├── Sidebar.tsx              # Navigation sidebar & mobile bottom bar
│   │   └── ScrollToTop.tsx          # Route & auth scroll reset utility
│   ├── context/
│   │   └── AppContext.tsx           # Global state (profile, memory, opportunities)
│   ├── db/
│   │   ├── opportunities.ts         # Verified opportunities database
│   │   ├── userProfile.ts           # Student profile, skills, and roles
│   │   └── teammates.ts             # Teammate matchmaking network
│   ├── pages/
│   │   ├── WelcomePage.tsx          # Landing & onboarding portal
│   │   ├── RadarPage.tsx            # Opportunity radar feed & match filters
│   │   ├── CvLabPage.tsx            # ATS CV analyzer & skill lab
│   │   ├── MemoryPage.tsx           # MEMORY.md context flow matrix
│   │   ├── NetworkPage.tsx          # Teammates & squad network hub
│   │   ├── NotificationsPage.tsx    # Multi-channel messenger notifications
│   │   ├── ApplicationStudioPage.tsx# PII-masked proposal drafting studio
│   │   └── AccountPortalPage.tsx    # Settings, terminal logs, and tech support
│   ├── utils/
│   │   └── anonymizer.ts            # Client-side PII tokenization regex engine
│   ├── App.tsx                      # Root application & routing
│   ├── index.css                    # Tailwind CSS configuration & custom utilities
│   └── main.tsx                     # React root mount
├── .env                             # Environment variables (gitignored)
├── .gitignore                       # Git exclusion rules
├── index.html                       # SEO metadata, OpenGraph, and favicon tags
├── package.json                     # Project manifest & scripts
├── vercel.json                      # Single-page app routing rewrites for Vercel
└── README.md                        # Documentation
```

---

## License

MIT
npm install