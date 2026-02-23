---
name: Scenarios — Unified Saved Application State
issue: <#tbd>
state: todo
version: 0.1
---

## Goal

Replace the existing "Custom Configs" and scattered "suspicious metrics" features with a single unified **Scenarios** concept. A Scenario captures a full snapshot of the application state and lets users save, share, and selectively apply it — enabling repeatable analysis workflows across teams.

## Background & Context

Three features were previously considered separately:
- **Metric Scenarios** — saved metric selections (area, height, color, edge)
- **Custom Views** — saved application state including camera and filters
- **Suspicious Metrics** — pre-configured metric combinations highlighting code risk

All three are the same concept at different levels of completeness. This PRD defines a single unified implementation that covers all three.

**Custom Configs** (existing feature) is **sunset** by this feature. Users can import existing Custom Config files as Scenarios.

---

## What is a Scenario?

A Scenario is a **named, full snapshot** of the application state. It always saves all sections. When applying, the user **selects which sections to apply** via a checklist dialog.

### State captured in a Scenario

| Section | Description |
|---|---|
| **Metrics** | Selected metrics for area, height, color, edge dimensions |
| **Colors** | Color range thresholds, neutral color, color mode |
| **Camera** | Camera position, zoom level, orbit target |
| **Filters** | Active blacklist, flattened nodes, focused folders |
| **Labels & Folders** | Label visibility settings, folder highlight colors |

### Scenario types

| Type | Who creates it | Editable | Source |
|---|---|---|---|
| **Built-in** | Product team | Read-only (can duplicate) | Shipped with app |
| **User** | End user | Full CRUD | Created at runtime |

---

## User Stories

1. **As a developer**, I want to save my current analysis setup as a named Scenario so I can return to it later without reconfiguring everything.
2. **As a team lead**, I want to export a Scenario and share it with my team so we all analyze code from the same baseline.
3. **As a new user**, I want to apply a built-in Scenario that highlights risky code so I can find problems without knowing which metrics matter.
4. **As a power user**, I want to apply only the metric section of a Scenario without overwriting my current camera position.
5. **As a user migrating from Custom Configs**, I want to import my existing `.cc.json`-embedded Custom Config as a Scenario.

---

## Tasks

### 1. Data Model

- Define `Scenario` type with: `id`, `name`, `description?`, `isBuiltIn`, `mapBinding?` (optional map file name), `createdAt`, and a `state` object containing all sections.
- Each section in `state` is independently present or absent (full save always includes all; selective apply is controlled at apply time).
- Define `.ccscenario` file format — JSON, compatible with existing Custom Config format where feasible; include a `schemaVersion` field for future-proofing.
- Extend or replace the Custom Config state slice in ngrx.

### 2. Persistence

- Store user Scenarios in **IndexedDB** (same mechanism already used by the app).
- Support **export** of a Scenario to a `.ccscenario` JSON file.
- Support **import** of `.ccscenario` files (and legacy Custom Config files) via the existing upload mechanism.
- Global Scenarios apply to any loaded map; map-specific Scenarios are explicitly bound to a map file name at save time.

### 3. UI — Scenarios Panel (Ribbon Bar)

- Add a **Scenarios panel** to the ribbon bar (same pattern as Color Settings, Height Settings panels).
- Panel shows a **flat list** of all Scenarios (built-ins + user) with a **search/filter input**.
- Visually distinguish built-in from user Scenarios (e.g. badge or section separator).
- Each Scenario card shows **section indicators** — small icons that reveal which sections are included in that scenario at a glance, without opening it:

  | Section | Indicator icon example |
  |---|---|
  | Metrics | chart/bar icon |
  | Colors | color bucket / palette icon |
  | Camera | camera icon |
  | Filters | filter/funnel icon |
  | Labels & Folders | label/tag icon |

  This lets users instantly understand a scenario's scope before applying it.
- Per-Scenario actions:
  - **Apply** — opens checklist dialog to select which sections to apply
  - **Duplicate** — creates an editable copy (primary path for deriving from built-ins)
  - **Export** — downloads as `.ccscenario` file
  - **Delete** (user Scenarios only)
- Global panel actions: **Save current state** button (opens save dialog), **Import** button.

### 4. Save Flow

- "Save current state" opens a dialog with:
  - Name field (required)
  - Description field (optional)
  - Checkbox: "Bind to current map file" (makes it map-specific)
- Saves a full snapshot of all state sections.
- For update (overwrite), the user picks an existing Scenario from the list and confirms overwrite.

### 5. Apply Flow

- Clicking **Apply** on a Scenario opens a checklist dialog showing all state sections.
- User selects which sections to apply; unchecked sections are left unchanged.
- If a referenced metric is not available in the current map: show a warning listing unavailable metrics, then apply the remaining sections.
- No "active scenario" tracking — scenarios are stateless apply-and-forget.

### 6. Built-in Scenarios

- Ship a set of read-only built-in Scenarios; specific scenarios to be defined in a separate task.
- Built-ins are hard-coded in the app (not stored in IndexedDB).
- Users can **Duplicate** a built-in to create an editable user copy.

### 7. Migration

- Remove the Custom Config feature and its UI entry points.
- Provide an import path: the Import button accepts both `.ccscenario` and legacy Custom Config JSON.
- Add a one-time migration prompt on first load after the update: "Your Custom Configs can be imported as Scenarios."

---

## Phasing

Deliver incrementally; each phase is independently shippable:

| Phase | Scope |
|---|---|
| **1** | Data model + IndexedDB persistence + basic panel (list, save, apply all sections, delete) |
| **2** | Selective apply checklist dialog + missing-metric warning |
| **3** | Export / Import (`.ccscenario`) + migration from Custom Config |
| **4** | Map-specific binding + duplicate |
| **5** | Built-in Scenarios (content TBD) |

---

## Steps

- [ ] Phase 1: Data model, persistence, basic panel
- [ ] Phase 2: Selective apply dialog + missing metric handling
- [ ] Phase 3: Export/Import + Custom Config migration
- [ ] Phase 4: Map-specific binding + duplicate action
- [ ] Phase 5: Define and ship built-in Scenarios

---

## Out of Scope

- Server-side or cloud sync of Scenarios
- Version history / undo within a Scenario
- Conditional / rule-based auto-applying of Scenarios
- Scenario chaining or sequencing

---

## Notes

- Success is assessed **manually** (qualitative review, team walkthrough).
- The `.ccscenario` file format should reuse Custom Config JSON structure where feasible, adding a `schemaVersion` field.
- Built-in Scenario content (names, metric combinations) is a separate design task.
- The ribbon bar panel follows existing panel patterns (Color Settings, Height Settings) for implementation consistency.
