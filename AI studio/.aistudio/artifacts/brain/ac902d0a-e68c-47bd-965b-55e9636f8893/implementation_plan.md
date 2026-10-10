# Warehouse Dispatch System & Executive Terminal Portal

A high-fidelity, real-time logistics operations suite featuring the **Executive Dispatch Console** authentication gateway and the **Warehouse Dispatch System** operational console with dynamic tariff calculation, multi-persona controls (Operator vs. Supervisor/Admin), live terminal staging telemetry, and interactive operational modules (Dock Doors, Fleet Telemetry, Manifests, and Exceptions).

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions incorporate the choices confirmed in Phase 1:

- **Confirmed: Gateway Authentication & Navigation**: The application launches into the **Executive Dispatch Console** (Screen 2) where operators and supervisors authenticate with realistic credentials or quick SSO; upon authentication, the system transitions smoothly into the full **Warehouse Dispatch System** (Screen 1) with an active session indicator, role toggle, and user profile switcher. A top bar / profile action allows returning to the terminal sign-in at any time.
- **Confirmed: Dedicated Subview Modules**: In addition to the primary **Dispatch Console**, the sidebar navigation supports dedicated, fully-featured interactive views for **Dock Doors Matrix**, **Fleet Telemetry**, **Load Manifests**, **Exceptions** (with active exception resolution workflow), and **Throughput & KPIs**.
- **Confirmed: Live Real-Time Queue Telemetry**: The dispatch queue features both simulated real-time background events (live stream ticker, automatic staging progression, temperature sensor updates) and manual controls (Simulate Sync, cancel request, priority override, bay reallocation).

---

## 1. Overview & Core Concept

- **What It Does**: Bridges warehouse gate clearance, yard staging, autonomous tractor pairing, and cross-dock dispatching into a unified terminal dashboard. Dispatchers generate dynamic system-signed dispatch tokens (DSP-2025-XXXX), validate cargo specifications with automatic pallet weight and surcharge calculations, and manage live transit pipelines.
- **Target Audience / Personas**:
  - *Dispatch Operator*: Enters requests, verifies cargo handling rules (Hazmat, Cold Chain, High Security), monitors transit ETAs, and audits manifests.
  - *Fleet Supervisor / Admin (PRO)*: Unlocks elevated override actions, forced bay allocation, priority pre-emption, and exception clearance.
- **Key Value**: Eliminates turnaround bottlenecks with instant dynamic rate matrix calculations, guaranteed door locks, and real-time terminal sync.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Executive Dispatch Console (Authentication Gateway)      │
│    - Visual terminal status & bay telemetry glance          │
│    - Role toggle (Operator vs. Supervisor / Admin)          │
│    - Email/passcode input, FIDO2 / SSO quick login          │
│    - Hub & Gate Sector selection                            │
└──────────────────────────────┬──────────────────────────────┘
                               │ Authenticate & Enter
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Warehouse Dispatch System (Operations Console)           │
│    ├─ Left Column: Create Dispatch Request (FORM-04)        │
│    │  • Dynamic token generation (DSP-2025-XXXX-X)          │
│    │  • Origin bay & destination selection                  │
│    │  • Priority tier radio selector (Standard/Exp/Crit)    │
│    │  • Pallet counter with live weight estimation          │
│    │  • Special handling protocols & dynamic surcharge rate │
│    │  • Real-time rate locking & bay slot assignment        │
│    │  • Autonomous Load Allocator indicator                 │
│    │                                                        │
│    ├─ Right Column: Real-time Queue & Telemetry Stream      │
│    │  • Search & multi-status filtering (All/Pending/etc.)  │
│    │  • Live cards: route nodes, cold chain metrics, ETA    │
│    │  • Role-aware actions (Telemetry, Assign, Override)    │
│    │  • Dock Door Matrix status summary bar                 │
│    │                                                        │
│    └─ Dedicated Views via Sidebar Navigation:               │
│       • Dock Doors: 12-bay interactive terminal matrix      │
│       • Fleet Telemetry: Active tractor units & GPS routes  │
│       • Load Manifests: Verifiable BOLs & proof of delivery │
│       • Exceptions: Cold-chain alerts & resolution workflow │
└─────────────────────────────────────────────────────────────┘
```

### Visual Identity & Theme

- **Aesthetic Direction**: High-precision enterprise logistics terminal. Clean, sharp typography paired with tactical slate and technical blue container accents.
- **Color Palette**:
  - Background Canvas: Cool logistics surface `#F8F9FF` (Light) and deep industrial slate `#0B1C30` / `#213145` (Dark visual context).
  - Primary Action / Accent: Electric Terminal Blue (`#004AC6` / `#2563EB`) for focused CTAs, active selections, and priority indicators.
  - Status Indicators: Emerald Green (`#006243` / `#16A34A`) for operational sync, Amber (`#D97706`) for buffer staging, and Crimson (`#BA1A1A`) for critical priority & cold-chain alarms.
- **Typography**: Clean sans (`Inter`) for crisp UI density with monospace tabular numerals (`tabular-nums`) for currency, ETAs, timestamps, and cargo weights.
- **Assets & Imagery**:
  - Hotlinked distribution center hero backdrop from provided design.
  - Official warehouse dispatch brand icon.
  - Crisp Material Symbols / Lucide icons for all operational metrics and affordances.

---

## 3. Key Product Decisions & Trade-Offs

- **State Management & Persistence**:
  - *Chosen Approach*: Reactive in-memory state initialized with all 4 authentic queue cards from the reference design, with localStorage synchronization so submitted dispatches and status changes persist across reloads.
  - *Why*: Immediate zero-latency reactivity without server round-trips, while keeping all live queue mutations responsive.
- **Dynamic Surcharge Matrix**:
  - *Chosen Approach*: Real-time rate evaluation engine calculating fuel base ($42.00) + pallet fee ($18.50/unit) + protocol adjustments (Hazmat +$95, Cold Chain +$65, High Security +$50) + priority multipliers (Expedited 1.15x, Critical 1.45x).
  - *Why*: Matches the exact numbers and responsiveness of the reference specification.
- **Role Elevation Security Simulation**:
  - *Chosen Approach*: Seamless role switching between Dispatch Operator and Fleet Supervisor / Admin directly from the top header or login portal, dynamically revealing admin-only controls ("Force Priority", "Force Assign Bay", "Clear Exception").

---

## 4. Technical Architecture & Data Strategy

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           State & Data Layer                              │
│  - authState (current user, active role: 'operator' | 'admin', token)    │
│  - queueItems (list of dispatch requests with statuses, telemetry, cargo)│
│  - dockDoors (12-bay status array: occupied, staging, available, cleaning)│
│  - rateEngine (pallet count, priority, protocols -> cost & turnaround)   │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
         ┌────────────────────────────┴───────────────────────────┐
         ▼                                                        ▼
┌───────────────────────────────────┐    ┌──────────────────────────────────┐
│ Executive Dispatch Console View   │    │ Warehouse Operations Suite       │
│ - Split hero layout               │    │ - Fixed sidebar with occupancy   │
│ - Telemetry snapshot              │    │ - Top bar with live UTC clock,   │
│ - Interactive credentials form    │    │   search (⌘K), & persona toggle  │
│ - SSO & hardware token buttons    │    │ - Main console with 2-column     │
└───────────────────────────────────┘    │   request form & queue cards     │
                                         │ - Dedicated Views:               │
                                         │   * Dock Doors Matrix            │
                                         │   * Fleet Telemetry              │
                                         │   * Load Manifests               │
                                         │   * Exceptions Center            │
                                         └──────────────────────────────────┘
```

### Planned File Structure & Modules

- `src/types/dispatch.ts`: Data types for requests, cargo classifications, handling protocols, dock bay states, and user sessions.
- `src/data/initialData.ts`: Accurate seed data containing the reference cards (`DSP-2025-7712`, `DSP-2025-7713`, `DSP-2025-7714`, `DSP-2025-7708`), dock door matrix, and fleet units.
- `src/components/AuthScreen.tsx`: Complete Executive Dispatch Console authentication portal matching Image 1 / second HTML.
- `src/components/Sidebar.tsx`: Fixed left navigation with bay occupancy gauge and active routes.
- `src/components/Header.tsx`: Global top telemetry bar with role toggle, search bar, notifications, and user avatar.
- `src/components/DispatchConsole.tsx`: 2-column main console matching Image 3 / first HTML.
  - `CreateDispatchForm.tsx`: FORM-04 with dynamic token generation, pallet stepper, rate calculation, and validation.
  - `QueueList.tsx`: Live filterable queue with real-time stream indicator, search, and action modals.
- `src/components/DockDoorsView.tsx`: Interactive visual map of Bay Doors 1–12 with status, cleaning schedules, and trailer pairing.
- `src/components/FleetTelemetryView.tsx`: Active tractor units, driver telemetry, cold chain sensor feeds, and GPS routes.
- `src/components/ManifestView.tsx`: Proof of Delivery (POD) verified manifests and cargo audit modal.
- `src/components/ExceptionsView.tsx`: Active 4-count operational exceptions desk with quick resolve and re-route workflows.
- `src/components/TelemetryModal.tsx`: Real-time sensor graph modal for temperature and speed.
