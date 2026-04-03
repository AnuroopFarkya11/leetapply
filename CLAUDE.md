# LeetApply - Complete Project Context

## What is LeetApply?
LeetApply is a **LeetCode-inspired job application tracker**. Job seekers apply to dozens of companies daily but have no system to track progress, no motivation to stay consistent, and no visibility into their journey. LeetApply gamifies the job search — streaks, heatmaps, badges, progress rings — exactly like LeetCode did for DSA practice.

**Name origin:** "LeetApply" — directly inspired by LeetCode. The UI, UX, and psychology are all modeled after LeetCode's profile page.

**One-line pitch:** Job search ke chaos ko ek gamified, trackable system mein convert karna — taaki log motivated rahein aur koi application lost na ho.

## Creator
- **Anuroop Farkya** (@anuroopfarkya / @anuroopfarkya11 on GitHub)
- Currently: System Engineer at TCS
- University: Medi-Caps University, India
- Target: SDE at a product company
- LeetCode profile: 186 problems solved, Rank 816,757
- Skills: JavaScript, React, Node.js, Python, DSA, SQL

## Current Phase: MVP (Phase 1) - BUILT
MVP is **built and functional**. No backend, no database, no auth. Everything runs in the browser with localStorage.

---

## All Features (Currently Implemented)

### 1. Profile Page / Dashboard (`index.html`)
Main landing page. Modeled EXACTLY after LeetCode's profile page:
- **Profile Card** (left sidebar): Avatar with initials, name with verified badge, username, rank, following/followers, "Edit Profile" button, company/role, location, university, target role, GitHub link, skill tags
- **Circular Progress Ring**: SVG donut (140x140, stroke-width 7) showing total applications with colored arcs — Easy (green #00af9b), Medium (yellow #ffb800), Hard (red #ef4743)
- **Difficulty Breakdown**: Easy/Medium/Hard with animated progress bars and count/total (targets: Easy 200, Medium 200, Hard 100)
- **Badges Section**: Dynamic badges earned based on activity — 7 Day Streak, 30 Day Streak, 50 Apps Club, 100 Apps Club, First Interview, First Offer. Badge count and "Most Recent Badge" update automatically
- **Application Heatmap**: LeetCode-style green squares calendar. **Month gaps** (6px extra spacing between months). Month labels at BOTTOM. Responsive cell sizing. Hover tooltips. Colors: empty `#f0f0f0`, 1-2 `#9be9a8`, 3-4 `#40c463`, 5-6 `#30a14e`, 7+ `#216e39`
- **Stats Bar**: Total applications, Total active days, Max streak, Current streak (green colored)
- **Community Stats**: Profile Views, Interviews count, Offers count, Reputation
- **Recent Activity Tabs**: 4 tabs — Recent Applications, Interviews, Offers, Rejections. Max 8 items per tab. Each shows company, role, status badge, relative date
- **Streak Warning Banner**: Shows at top if user hasn't applied today. Orange warning if streak active ("Apply today to keep your X day streak alive!"), red if streak broken, neutral if new user. Has "Apply Now" button and dismiss X

### 2. Add Application Form (Modal on both pages)
Triggered by "+ Add Application" button in navbar:
- Company name (required)
- Role/Position (required)
- Difficulty: Easy / Medium / Hard (styled radio buttons with colored highlight on selection)
- Platform: LinkedIn / Naukri / Indeed / Internshala / Wellfound / Direct / Referral / Other (dropdown)
- Date applied (defaults to today)
- Job link/URL (optional)
- Notes (optional textarea)
- Submit saves to localStorage, closes modal, refreshes all page data and streak banner

### 3. Applications List Page (`applications.html`)
Full application management:
- **Stats Cards Row** (top): 4 cards — Total Applied (blue), Interviews (purple), Offers (green), Response Rate % (orange). Response rate = (screening + interview + offer + rejected) / total
- **Streak Warning Banner**: Same as dashboard — shows if not applied today
- **Filters Bar**: Search by company/role, filter by Status (all/applied/screening/interview/offer/rejected), filter by Difficulty (all/easy/medium/hard)
- **Applications Table**: Columns — Company/Role, Difficulty tag, Date, Platform, Status (dropdown to change), Actions (edit/link/delete)
- **Click company name or edit icon** → opens Edit Modal
- **Status dropdown** in table row — change status inline, auto-saves
- **Delete** with confirmation dialog
- **Empty state** when no applications — shows "Add First Application" button
- **Round count** shown under company name if interview rounds are logged

### 4. Edit Application Modal (on Applications page)
Two-tab modal:
- **Details Tab**: Edit all fields — company, role, difficulty, platform, date, link, notes. Save Changes button
- **Interview Rounds Tab**: Log round-by-round interview progress
  - Add rounds with: Round type (OA/Phone Screen/DSA/System Design/Machine Coding/HR/Hiring Manager/Other), Date, Outcome (Pending/Cleared/Failed/Ghosted), Questions/Notes
  - View all rounds as cards with round number, type, outcome badge (color-coded), date, notes
  - Delete individual rounds
  - "Add Interview Round" button with expandable form

### 5. localStorage Persistence
- ALL data in browser localStorage, no backend
- Key: `leetapply_applications` — array of application objects
- Key: `leetapply_profile` — user profile data
- Auto-saves on every change
- All stats (heatmap, streak, ring, badges, stats cards) calculate dynamically from stored data

### 6. Streak System
- **Current streak**: Counts consecutive days (from today backwards) with at least 1 application
- **Max streak**: Longest ever consecutive run
- **Total active days**: Total unique days with applications
- **Streak banner**: Warning on both pages if not applied today
- **Badge rewards**: 7-day and 30-day streak badges

---

## Tech Stack
- **Plain HTML5** — semantic markup, no build step
- **Plain CSS3** — CSS variables for theming, no frameworks, no Tailwind (npm blocked on this machine due to corporate proxy)
- **Plain JavaScript (ES6+)** — no React, no framework, no bundler
- **Google Fonts: Inter** — `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap')`
- **localStorage** — for all data persistence
- **SVG** — hand-coded for progress ring and heatmap (no chart libraries)

---

## UI/Design Rules (CRITICAL — Follow Exactly)

### Must look EXACTLY like LeetCode:
- Reference screenshot: `/Users/afarkya/Desktop/Recordings/Screenshot 2026-03-30 at 1.19.16 AM.png`
- Heatmap reference: `/Users/afarkya/Desktop/Recordings/Screenshot 2026-03-30 at 2.39.36 AM.png`
- Earlier prototype (for reference only): `/Users/afarkya/demo/leetapply/`

### Theme: Light (NOT dark)
- Background: `#f7f8fa`
- Cards: `#fff` with `box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)` — **NO hard borders on cards**
- Border radius: `10px` on cards
- Font: Inter, weights 400/500/600/700
- `-webkit-font-smoothing: antialiased`

### Color Palette (CSS Variables in style.css):
```
--bg: #f7f8fa              --card: #fff
--text-primary: #262626    --text-secondary: #595959
--text-muted: #a3a3a3      --text-light: #c4c4c4
--border: #ebebeb          --hover-bg: #fafbfc
--easy: #00af9b            --medium: #ffb800
--hard: #ef4743            --accent: #ffa116
```

### Status Badge Colors:
```
Applied:   bg #e8f4fd, text #1890ff
Screening: bg #f3e8ff, text #722ed1
Interview: bg #fff7e6, text #d48806
Offer:     bg #e6fffb, text #08979c
Rejected:  bg #fff1f0, text #f5222d
```

### Heatmap Specifics:
- Empty cells: `#f0f0f0` (very light, almost invisible)
- Green shades: `#9be9a8` → `#40c463` → `#30a14e` → `#216e39`
- Cell size: dynamically calculated to fill container width, clamped 8-13px
- Cell gap: 3px within months
- **Month gap: 6px extra spacing between months** (key LeetCode detail)
- Month labels at BOTTOM (not top)
- No day labels (Mon/Wed/Fri) — clean look
- SVG uses viewBox for responsive scaling
- Hover tooltip: dark bg (#262626), white text, shows count + date

### Layout:
- Max width: `1100px`, centered
- Dashboard: Two-column grid — sidebar `270px`, content `1fr`, gap `24px`
- Applications: Single column, max-width `960px`
- Navbar: height `50px`, white bg, sticky top, z-index 50

### Typography:
- Logo: 17px/700  |  Profile name: 17px/600  |  Headers: 13-14px/600
- Body: 13-14px/400-500  |  Small/muted: 11-12px  |  Stats: 500-600

---

## File Structure
```
/Users/afarkya/workspace/leetapply/
├── CLAUDE.md              ← THIS FILE — complete project context
├── index.html             ← Dashboard/Profile page (main landing)
├── applications.html      ← Applications list + edit + interview rounds
├── css/
│   ├── style.css          ← Global: reset, variables, navbar, layout, overlays,
│   │                         streak banner, stats cards, edit modal, interview rounds
│   ├── profile.css        ← Profile page: sidebar, progress ring, badges, heatmap,
│   │                         activity tabs, community stats
│   ├── applications.css   ← Apps page: filters, table, status dropdown, empty state
│   └── modal.css          ← Add application modal: form, radio buttons, submit
├── js/
│   ├── store.js           ← Data layer: localStorage CRUD, getStats(), streak calc,
│   │                         addRound(), deleteRound(), hasAppliedToday(), formatDate()
│   ├── profile.js         ← Dashboard logic: renderHeatmap (with month gaps), renderRing,
│   │                         renderBadges, renderDiffBars, activity tabs, streak banner
│   ├── applications.js    ← Apps page: table render, filters, status change, delete,
│   │                         EditModal object, interview rounds UI, stats cards update
│   └── modal.js           ← Add modal: open/close, form submit, refresh both pages
└── assets/                ← Static assets (currently empty)
```

---

## Data Schema

### Application Object:
```json
{
    "id": "auto-generated",
    "company": "Google",
    "role": "SDE-2, Backend",
    "link": "https://...",
    "difficulty": "hard",        // "easy" | "medium" | "hard"
    "platform": "linkedin",      // "linkedin"|"naukri"|"indeed"|"internshala"|"wellfound"|"direct"|"referral"|"other"
    "dateApplied": "2026-03-28", // YYYY-MM-DD
    "status": "applied",         // "applied"|"screening"|"interview"|"offer"|"rejected"
    "notes": "Referred by friend",
    "createdAt": "2026-03-28T10:30:00Z",
    "rounds": [                  // optional, added when interview rounds are logged
        {
            "id": "auto-generated",
            "type": "DSA",       // "OA"|"Phone Screen"|"DSA"|"System Design"|"Machine Coding"|"HR"|"Hiring Manager"|"Other"
            "date": "2026-03-29",
            "outcome": "cleared", // "pending"|"cleared"|"failed"|"ghosted"
            "notes": "Asked 2 medium LC questions, solved both"
        }
    ]
}
```

### Status Flow:
```
applied → screening → interview → offer
                                → rejected
(any status can also go directly to rejected)
```

### Profile Object:
```json
{
    "name": "Anuroop Farkya",
    "username": "anuroopfarkya",
    "company": "TCS",
    "role": "System Engineer",
    "location": "India",
    "university": "Medi-Caps University",
    "target": "SDE @ Product Company",
    "github": "anuroopfarkya11",
    "skills": ["JavaScript", "React", "Node.js", "Python", "DSA", "SQL"]
}
```

---

## Key Decisions Made
- No frameworks — plain HTML/CSS/JS only (npm blocked by corporate proxy pointing to PayPal registry)
- No backend — localStorage only for MVP
- Light theme — matching LeetCode's actual UI (NOT dark theme, we tried dark first and it looked wrong)
- Inter font from Google Fonts CDN (only external dependency)
- Box-shadows on cards instead of hard borders (LeetCode style)
- Two-page app: Dashboard (`index.html`) + Applications (`applications.html`)
- Heatmap: month labels at bottom, extra gap between months, responsive cell sizing, no day labels
- Desktop-first (mobile responsiveness is NOT priority for MVP)
- Streak banner shows on BOTH pages
- Add Application modal available on BOTH pages via navbar button
- Edit modal is only on Applications page (click company name or edit icon)
- Interview rounds are per-application (stored inside the application object)
- Badges are dynamically calculated, not manually awarded
- Stats cards only on Applications page (not dashboard — dashboard has its own stats in heatmap header and community stats)

---

## Store.js API Reference
```js
Store.getProfile()              // returns profile object
Store.saveProfile(profile)      // saves profile
Store.getApps()                 // returns all applications array
Store.addApp(app)               // adds new app, returns it with id
Store.updateApp(id, updates)    // partial update, merges fields
Store.updateAppStatus(id, status) // shortcut for status change
Store.getApp(id)                // get single app by id
Store.deleteApp(id)             // delete app
Store.addRound(appId, round)    // add interview round to app
Store.deleteRound(appId, roundId) // delete a round
Store.hasAppliedToday()         // boolean — applied today?
Store.getStats()                // returns { total, easy, medium, hard, statusCounts, heatmap, currentStreak, maxStreak, totalActiveDays }
Store.formatRelativeDate(date)  // "2d", "1w", "3mo"
Store.formatDate(date)          // "Mar 28, 2026"
```

---

## What is NOT Built Yet (Future Phases):
- Browser extension (Phase 2)
- Kanban pipeline drag-drop board (Phase 3)
- Gmail/Outlook integration with auto status detection (Phase 4)
- Follow-up reminders with email drafts (Phase 5)
- Community feed for interview experiences (Phase 6)
- Job of the Day (JOTD) — needs job API
- Export to CSV
- Dark mode toggle
- Weekly summary
- Backend/database/auth/signup
- Mobile responsive design

---

## Competitor Comparison
| Feature | LeetApply | Huntr | Teal | Seekario |
|---|---|---|---|---|
| LeetCode Heatmap | YES | No | No | No |
| Streak System | YES | No | No | No |
| Easy/Medium/Hard | YES | No | No | No |
| Interview Round Notes | YES (round-wise) | Partial | Yes | Partial |
| Gamification/Badges | YES | No | No | No |
| Browser Extension | Planned | Yes | No | No |
| Gmail Integration | Planned | No | No | No |

## Market Context
Job application tracking software market **$2.5B in 2024** → projected **$6.5B by 2033** at 11% CAGR. No existing player combines gamification + smart email parsing + LeetCode-style UI.