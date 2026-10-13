# Pathfinder — Personal AI Assistant
**Nebius x NVIDIA Global AI Hackathon (Track 3: Agentic Workflows & Developer Tools)**

Pathfinder is a production-grade, ultra-clean web dashboard for students and researchers. It operates as an autonomous agent interface that discovers hackathons and research grants via Tavily, performs ATS resume gap analysis against opportunity criteria, ensures client-side PII data sovereignty before cloud model routing, and provides strict OpenShell sandbox containment logs.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** React 19 + TypeScript + Vite
- **Routing:** React Router v7 (`react-router-dom`) — 6 dedicated screens + Onboarding flow
- **Styling:** Tailwind CSS with strict design tokens (Linear / Vercel developer tool aesthetic)
- **Typography:** Geist (UI text) + JetBrains Mono (metrics, percentages, code, and logs) via Google Fonts
- **Icons:** 100% inline SVG (linear, `strokeWidth="1.7"`, 16px), strictly zero emoji
- **Data & State Management:** Modular mock DB services (`src/db/opportunities.ts`, `src/db/userProfile.ts`) and reactive `AppContext` store (`AppContext.tsx`) with separated `localStorage` persistence for `user_profile` and `pathfinder_memory_md`

---

## 🎨 Design System & Developer Tool Aesthetics

The visual language follows strict engineering tool guidelines:
- **Background (`bg`):** `#070d1f` (deep dark blue-zinc foundation)
- **Sidebar (`sidebar`):** `#0a1128` (248px fixed width on desktop, responsive drawer on mobile)
- **Surface (`surface`):** `#0d1631` (cards and panels)
- **Surface Hover / Active:** `#16213f`
- **Borders:** Razor-sharp 1px lines (`#1f2c52`, strong `#2e3d6b`)
- **Single Functional Accent:** Emerald `#10b981` (active sandbox, ATS verified status, >80% match, verified badge)
- **Warning Accent:** Muted Amber `#f59e0b` / `#fcd34d` (security jail blocks, unverified skills)
- **Buttons & Inputs:** Minimum 44px touch/click target height, accessible focus-visible rings
- **Team Boundary Decoupling:** OpenShell (`ACTIVE` / `PAUSED`) and Nebius API (`CONNECTED` / `STANDBY`) status pills in the sidebar are interactive simulators, allowing judges and teammates to test decoupled backend behaviors.

---

## 🧭 Screen-by-Screen Breakdown

### 0. 🚀 Onboarding Wizard (`/onboarding` & First Launch)
- Automatically checks `localStorage` for `user_profile`. If uninitialized or requested, presents a clean 3-step setup modal with **zero hardcoded defaults**:
  1. **Account & Identity:** Clean empty inputs with ghost placeholders, secure password input with show/hide toggle, institution, major, location, and an expanded list of 9 academic/research roles.
  2. **Technical Stack & Projects:** Interactive multi-select pills for active technologies (Python, Go, Docker, PyTorch, Vector DBs, LLMs, ROS2, etc.) and project resume highlights.
  3. **Objectives & Local Boundary:** Streamlined career tracks (Hackathons, Graduate Grants, Internships) and local sovereign boundary confirmation.

### 1. 🎯 Opportunity Radar (`/`)
- Main feed of vetted opportunities gathered from `src/db/opportunities.ts`.
- **Organization Logos:** Custom inline SVG brand marks for Nebius, NVIDIA, MEXT Japan, Anthropic, CERN, and Y Combinator.
- **Dynamic Match Score Engine:** Opportunity match percentages recalculate in real-time based on the candidate's active and verified skills!
- Subtitle: `last scan 06:00 · 10 matches · source: Tavily · profile: <Candidate Name>`.
- Live trigger button: `[ Run Tavily Search Now ]` (dispatches agent simulation, tokenizes PII, routes to Nemotron, and logs events).
- Real-time search bar & filter chips: `All`, `Hackathons`, `Grants`, `Internships`, `Match >80%`.
- High-density cards with match percentage bars, tech stack pills (with candidate skill highlights), and actions:
  - `Draft Application`: Opens modal showing tokenized prompt and custom statement dynamically personalized for the candidate.
  - `Analyze CV Gaps`: Opens `CvGapsModal` showing matched, unverified, and missing skills with one-click verification quiz launch.
  - `View Details`: High-density modal with criteria, prize, and official link.

### 2. 📄 CV & Skill Lab (`/cv`)
- Subtitle: `gap analysis against: Nebius x NVIDIA Global AI Hackathon`.
- **CV Health Score:** Overall ATS score (`78/100`+) with breakdown for `structure 90`, `impact 72`, `keywords 68` (dynamically increments as skills are verified).
- **Live Document Preview (`Candidate_CV.pdf`):** Rendered student resume with contact info and job-matched keywords highlighted in `rgba(16,185,129,0.14)`.
- **Strengths & Gaps:** Side-by-side diagnosis cards.
- **Recommended Skills to Learn:**
  - Status badges (`VERIFIED`, `UNVERIFIED`, `MISSING`).
  - Interactive quiz trigger: `[ Take Skill Quiz (>70% to verify) ]`.
- **Quiz Modal:**
  - Active countdown timer, progress bar, 4 technical questions.
  - Scoring engine: achieving $\ge 70\%$ issues a verified badge, increases ATS score, and dynamically updates CV and radar match scores.

### 3. 🛡️ Privacy Shield (`/privacy`)
- Client-side data sovereignty dashboard.
- **PII Anonymization Engine Banner:** Dark emerald border (`#065f46`), active indicators, token chips (`Name`, `Phone`, `ID`, `Email`), and live counters:
  - `4 fields masked per request`
  - `48 masked this session` (increments dynamically on all agent calls).
- **Interactive Controls:**
  - `[x] Store preferences in local MEMORY.md`
  - `[x] Restrict agent execution to the OpenShell sandbox directory`
  - `[ ] Send unmasked contact details to cloud APIs` (permanently disabled with `DISABLED` badge).
- **Inspect Raw JSON Payload Accordion:** Side-by-side comparison of local unmasked payload vs. tokenized payload sent to Nebius Token Factory with candidate dynamic values.

### 4. 🧠 Agent Memory (`/memory`)
- Subtitle: `local MEMORY.md · N entries · agent behavioral context`.
- **Pure Memory Focus:** Separated from personal profile management to keep agent instructions pristine.
- **Context Flow Matrix:**
  - Left column: 128px timestamped memory cards (`PREFERENCES`, `CONSTRAINTS`, `SKILLS`, `GOALS`) with inline Edit and Delete actions.
  - Center column: 140px SVG with dynamic cubic Bezier curves (`M0 yl C70 yl 70 yr 140 yr`).
  - Right column: 7 target nodes (Opportunities & Constraints).
  - Hover or keyboard focus on a memory card dynamically illuminates connecting Bezier paths to emerald (`#10b981`) and highlights corresponding targets.
  - Backed by `localStorage` in genuine `MEMORY.md` format.

### 5. ⚙️ Logs & Terminal (`/logs`)
- Dedicated security and agent event stream.
- Status cards: `Sandbox: ACTIVE`, `Allowed directory: /workspace/pathfinder`, `Blocked this session`.
- Filter chips: `All`, `System`, `Sandbox`, `Model`.
- Terminal view with formatted columns: `time | [TAG] (132px) | message`.
  - `[SANDBOX WARNING]` highlighted in amber with row tint.
  - Blinking cursor prompt `$ /workspace/pathfinder █`.
  - Interactive CLI: execute commands (`access /root/system` to trigger the OpenShell sandbox boundary alert!).

### 6. 👤 Profile & Settings (`/profile`)
- Dedicated candidate profile and privacy settings management.
- **Candidate Identity & Security:** Update first name, surname, email, password, and contact numbers.
- **Academic & Role Configuration:** Change university, major, location, and role.
- **Technical Stack & Career Objectives:** Add or toggle programming languages, tools, frameworks, and target paths.
- **Discovery Visibility Controls:** Sovereign toggle for local vs. external discovery indexing.
- **Account Data Management:** Clear or reset profile to re-trigger the onboarding wizard.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Production Build
```bash
npm run build
```

---

## 🔐 OpenShell & Nebius Hackathon Alignment
- **OpenShell Sandboxing:** Agent execution is confined to `/workspace/pathfinder`. Any attempt to access `/root/system` is blocked by kernel sandbox rules.
- **Nebius Token Factory:** Client-side PII replacement ensures zero personal data is leaked to external LLM providers.
- **NVIDIA NIM / Nemotron-3.5-Lightning:** Target model for intelligent match ranking and prompt completion.
