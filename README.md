```
██╗   ██╗██╗   ██╗██╗     ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗
██║   ██║██║   ██║██║     ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝
██║   ██║██║   ██║██║     ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗
╚██╗ ██╔╝██║   ██║██║     ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║
 ╚████╔╝ ╚██████╔╝███████╗██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║
  ╚═══╝   ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
                    V U L N E X U S
```

# VulnExus — Security Dashboard

A full-featured web security monitoring dashboard. Run scans, track vulnerabilities, manage reports, and visualize threat data across your infrastructure, all from a single interface.

![Vite](https://img.shields.io/badge/vite-7.3.1-646CFF?style=flat-square&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/react-19.2.0-61DAFB?style=flat-square&logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/three.js-r183-black?style=flat-square&logo=three.js&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## Overview

VulnExus is a front-end security dashboard built with React and Vite. It ships with a mock API layer that simulates real backend behavior - realistic delays, occasional random failures, and demo auth - so you can develop and test the full UI without a running server.

The landing page features a live 3D globe rendered with WebGL (Three.js + React Three Fiber) showing animated network arcs between global threat coordinates. The dashboard itself covers scanning, vulnerability tracking, report generation, user management, and historical analysis.

---

## Tech Stack

| Area | Library | Version |
|---|---|---|
| Build | Vite | 7.3.1 |
| UI | React | 19.2.0 |
| Routing | react-router-dom | 7.13.1 |
| 3D / WebGL | three, @react-three/fiber, @react-three/drei | r183 / 9.x / 10.x |
| Charts | recharts | 3.7.0 |
| Icons | lucide-react | 0.577.0 |
| Fonts | Inter, JetBrains Mono | via Google Fonts |

No UI component library. All styles are hand-written vanilla CSS with CSS custom properties for theming.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

The dev server runs at `http://localhost:5173` by default.

**Demo credentials**

```
Email:    demo@vulnexus.io
Password: demo1234
```

---

## Project Structure

```
src/
├── api/
│   └── mockApi.js          # Mock backend — auth, scans, vulnerabilities, reports
├── components/
│   ├── BackgroundFX/       # Animated canvas background effect
│   ├── DomainInput/        # Domain/URL input with validation
│   ├── ErrorState/         # Error boundary display component
│   ├── Footer/
│   ├── Globe/              # Interactive 3D globe (WebGL, instanced mesh, animated arcs)
│   ├── Header/
│   ├── Modal/
│   ├── RiskScore/          # Circular risk score gauge
│   ├── ScanCard/
│   ├── ScanProgress/       # Live scan progress stepper
│   ├── Sidebar/
│   ├── SkeletonLoader/
│   ├── Tooltip/
│   ├── UploadBox/
│   └── VulnerabilityTable/
├── context/
│   ├── AuthContext.jsx
│   ├── NotificationContext.jsx
│   └── ThemeContext.jsx
├── hooks/
│   └── useApi.js           # useApi, useAnimatedCounter, useTypingEffect, useInView, useDebounce
├── pages/
│   ├── Dashboard/
│   ├── Help/
│   ├── Landing/            # Public landing page with globe, typed hero, stat counters
│   ├── Login/
│   ├── NewScan/
│   ├── Notifications/
│   ├── Reports/
│   ├── ScanHistory/
│   ├── ScanProgress/
│   ├── ScanResults/
│   ├── Settings/
│   ├── Users/
│   ├── Vulnerabilities/
│   └── VulnerabilityDetail/
└── styles/
    └── global.css
```

---

## Routes

| Path | Page | Auth |
|---|---|---|
| `/` | Landing | Public |
| `/login` | Login | Public |
| `/dashboard` | Dashboard | Protected |
| `/scan/new` | New Scan | Protected |
| `/scan/progress` | Scan Progress | Protected |
| `/scan/results` | Scan Results | Protected |
| `/reports` | Reports | Protected |
| `/vulnerability` | Vulnerabilities | Protected |
| `/vulnerability/:id` | Vulnerability Detail | Protected |
| `/settings` | Settings | Protected |
| `/users` | User Management | Protected |
| `/history` | Scan History | Protected |
| `/notifications` | Notifications | Protected |
| `/help` | Help & Docs | Protected |

All protected routes redirect to `/login` if the user is not authenticated. After login, the user is forwarded to `/dashboard`.

---

## Features

**Scanning**
- Domain and file-upload scan modes
- Real-time progress view with animated steps
- Result breakdown by severity (Critical / High / Medium / Low / Info)

**Vulnerability Management**
- Sortable, searchable vulnerability table
- Severity badges, CVSS scores, status tracking
- Detail view per vulnerability with remediation notes

**Dashboard & Reports**
- Summary stats with animated counters
- Bar and line charts (recharts) for scan trends and severity distribution
- Downloadable report stubs

**Misc**
- Dark/light theme toggle (persists via localStorage)
- Responsive layout with collapsible sidebar and mobile drawer
- Skeleton loaders on every async route
- Toast notification system
- React `Suspense` + `lazy` on all page imports

---

## Globe Component

The 3D globe on the landing page is built entirely with Three.js primitives via React Three Fiber:

- **WorldDots** - 5,000 instanced `CircleGeometry` meshes distributed across the globe's surface using spherical coordinate math
- **AnimatedArc** - `TubeGeometry` arcs drawn progressively with `setDrawRange` each frame, following a `CubicBezierCurve3` path between two lat/lng coordinates
- **PulseMarker** - small sphere at each arc endpoint that scales up and down via `useFrame.`
- **Starfield** - 1,000 points distributed on a large outer sphere shell

Eight random arc events are generated on page load, and each arc loops through a draw → hold → fade cycle.

---

## Mock API

`src/api/mockApi.js` exports a single `api` object. Every method returns a `Promise` and simulates network latency (200–800 ms). There is a 5% random failure rate on most endpoints to exercise error states in the UI.

```js
api.login(email, password)
api.getDashboardData()
api.getVulnerabilities()
api.getVulnerabilityById(id)
api.runScan(config)
api.getScanProgress(scanId)
api.getScanResults(scanId)
api.getReports()
api.getScanHistory()
api.getUsers()
api.getNotifications()
```

---

## License

MIT
