---

id: PRD-4175
name: Dynamic Distribution Bar on Hover
version: 0.5.0
status: Accepted
lastReviewed: 2025-10-02
linkedADRs: []
repo: https://github.com/MaibornWolff/codecharta.git

---

# Product Requirements Document (PRD) — Dynamic Distribution Bar on Hover

> **Purpose:** Enable auditors to quickly understand file extension distribution within subfolders by dynamically updating the distribution bar when hovering over folders or files.

## 1) Summary (one paragraph)

Auditors currently cannot quickly see file extension distribution within specific subfolders. When hovering over a folder or file in the map or file explorer, the distribution bar should dynamically update to show the file extension distribution for that specific area based on the selected area metric (e.g., RLoC). Success means auditors can quickly identify composition of code in subfolders without additional clicks or navigation, improving code analysis efficiency.

## 2) Goals & Non‑Goals

## **Goals (what we want):**

* Enable dynamic distribution bar updates when hovering over folders
* Show file extension distribution based on the current area metric
* Persist distribution state when clicking on a folder (keep showing that folder's distribution)
* Return to global distribution only when clicking elsewhere or hovering over a different node
* Provide quick visual feedback without jumping back and forth between states

## **Non‑Goals (what we do not deliver now):**

* Hover-triggered distribution for individual files (files should not update the distribution bar)
* Persistent distribution view for multiple folders simultaneously
* Custom grouping of file extensions beyond default categorization
* Historical distribution tracking

## 3) Users & Personas

Who benefits? Briefly list the primary user(s) and any internal operators (e.g., support agents).

* Primary user: Code auditors analyzing codebase composition
* Secondary user: Developers exploring project structure and file distribution

## 4) Scope

## **In Scope:**

* Hover detection on folders in the 3D code map
* Hover detection on folders in the file explorer panel
* Hover detection on individual files
* Dynamic calculation of file extension distribution for hovered folder
* Update distribution bar UI to reflect hovered folder's distribution
* Use current area metric (e.g., RLoC, lines of code) for distribution calculation

## **Out of Scope:**

* Click-based selection for distribution (see issue #4178)
* Multi-folder comparison
* Custom metric aggregation beyond existing area metrics
* Performance optimization for very large folders (>10,000 files)

## 5) Acceptance Criteria (testable)

Write clear, testable rules. Prefer **Given/When/Then**. Each criterion should be easy to convert into a scenario test.

**Examples:**

* **AC‑1:** *Given* an "RLoC" area metric is selected and a folder contains 900 RLoC in `.cs` files and 100 RLoC in `.html` files, *when* I hover over that folder in the code map, *then* the distribution bar shows 90% `.cs` and 10% `.html`.
* **AC‑2:** *Given* I hover over a folder in the file explorer, *when* the folder contains files with multiple extensions, *then* the distribution bar updates to show the distribution for that folder.
* **AC‑3:** *Given* I hover over an individual file with extension `.ts`, *when* the hover is active, *then* the distribution bar shows the global distribution (files do not trigger distribution updates).
* **AC‑4:** *Given* I click on a folder, *when* the folder is selected, *then* the distribution bar persists showing that folder's distribution until I hover over or click on a different node.
* **AC‑5:** *Given* I am hovering over different folders, *when* I move my mouse between folders, *then* the distribution bar updates smoothly without jumping back to global distribution between hovers.
* **AC‑6:** *Given* I have both a selected node and a hovered node, *when* the distribution bar is calculated, *then* it should prioritize in this order: hovered node > selected node > global distribution.
* **AC‑7:** *Given* the distribution bar is showing a hovered or selected folder's distribution, *when* I exclude or flatten a file extension via the context menu, *then* the operation should apply to the currently displayed folder (hovered or selected) rather than the global distribution.

**Scenario table (optional):**

| ID   | Scenario                        | Input                              | Expected                                   |
| ---- | ------------------------------- | ---------------------------------- | ------------------------------------------ |
| AC‑1 | Hover folder with mixed code    | Folder: 90% .cs, 10% .html         | Bar shows 90% .cs, 10% .html               |
| AC‑2 | Hover folder in file tree       | File explorer folder hover         | Distribution updates dynamically           |
| AC‑3 | Hover individual file           | File with .ts extension            | Bar shows global distribution (no change)  |
| AC‑4 | Click on folder                 | User clicks folder                 | Bar persists folder's distribution         |
| AC‑5 | Hover between folders           | Mouse moves between folders        | Bar updates smoothly, no global jumps      |
| AC‑6 | Hovered and selected both exist | Both hovered and selected nodes    | Hovered node takes priority over selected  |
| AC‑7 | Exclude/flatten from folder view | Context menu on extension segment | Operation applies to displayed folder      |

## 6) Non‑Functional Requirements (NFRs)

State the measurable qualities. Keep them short and verifiable.

* **Availability:** Feature works consistently across all supported browsers (Chrome, Firefox, Safari, Edge).
* **UX:** Hover state should not interfere with existing interactions (selection, panning, zooming).
* **Observability:** Add telemetry for hover events on folders/files to track feature usage.

## 7) Constraints & Dependencies

* **Tech constraints:**
  - Must integrate with existing NgRx state management
  - Must work with Three.js hover detection in ThreeViewerService
  - Backward compatible with existing distribution bar component
* **Data constraints:**
  - Distribution calculations must use existing node attribute data
  - Must respect current area metric setting from dynamicSettings state
* **Dependencies:**
  - Existing distribution bar component
  - HoveredNodeId state in appStatus store
  - File tree structure from files state
  - Area metric from dynamicSettings state

## 8) Risks & Mitigations

List the top risks and how you will reduce them.

* Risk: Performance degradation with very large folders (10,000+ files)
  * Mitigation: Implement debouncing for hover events; cache distribution calculations; show loading indicator for large folders
* Risk: Confusion when distribution bar changes rapidly during fast mouse movement
  * Mitigation: Add small delay (100ms) before updating distribution; ensure smooth transitions
* Risk: Breaking existing distribution bar behavior
  * Mitigation: Add comprehensive unit and e2e tests; feature flag for gradual rollout

## 9) Roll‑out Plan

* **Phasing:** dev → staging → beta testers → full release
* **Feature flag:** `dynamicDistributionBar` (default off initially)
* **Rollback:** Feature flag can be disabled; no data persistence changes required for rollback

## 10) Analytics & Success Metrics

Choose 2–3 metrics with targets.

* Primary: User engagement with distribution bar increases by **50%** (measured by hover events) within 30 days
* Secondary: Average time to analyze subfolder composition decreases by **30%** for auditors
* Guardrail: No performance regression for hover interactions; p95 latency ≤ **100 ms**

## 11) Links & Traceability

* **MRs:** TBD
* **ADRs:** None currently
* **Tickets:** [GitHub Issue #4175](https://github.com/maibornwolff/codecharta/issues/4175)
* **Related Issues:** [GitHub Issue #4178](https://github.com/maibornwolff/codecharta/issues/4178) (distribution for selected folders)
* **Runbooks:** None required

## 12) AI Considerations (Agentic Coding)

* **Autonomy:** Allow up to **Level 3** by default (Level 4 requires approval).
* **Provenance:** Commits MUST mark AI involvement with footer including **Co-Authored-By: Claude <noreply@anthropic.com>**.
* **Context to provide:** Link PRD-4175 v0.1.0, relevant state management patterns from CLAUDE.md, distribution bar component code, hover detection logic in ThreeViewerService.
* **Testing:** Create unit tests for distribution calculation logic; add e2e tests for hover interactions on folders and files.

## 13) Deliverables

* Code modules/files to change or add:
  - Distribution bar component (update to accept dynamic input)
  - New effect or selector for calculating hovered node distribution
  - Update to hover event handling in ThreeViewerService
  - State updates in appStatus or new state slice for dynamic distribution
* Tests:
  - Unit tests for distribution calculation logic
  - Unit tests for hover state management
  - E2e tests for hover interactions on folders and files
* Docs to update:
  - User documentation explaining dynamic distribution feature
  - CHANGELOG.md entry

## 14) Open Questions

* Should the distribution bar show a visual indicator (e.g., tooltip) that it's in "hover mode" vs. "global mode"?
* What should happen when hovering over an empty folder?
* Should there be a minimum hover duration before updating the distribution to avoid flickering?

## 15) Change Log

* v0.5.0 — Implemented AC-7: Exclude and flatten operations now apply to currently displayed folder (hovered or selected). Updated [blackListExtension.service.ts](app/codeCharta/ui/fileExtensionBar/blackListExtension.service.ts:88-115) to scope blacklist patterns to folder paths when a folder is hovered or selected.
* v0.4.0 — Added AC-7: Exclude and flatten operations should apply to currently displayed folder (hovered or selected).
* v0.3.0 — Added AC-6: Explicit priority order requirement (hovered > selected > global distribution).
* v0.2.0 — Updated requirements: Files should not trigger distribution updates; clicking folders should persist distribution; no jumping back to global between hovers.
* v0.1.0 — Initial draft based on GitHub issue #4175.

---

### Appendix A — Prompt Starter (optional)

A tiny, agent‑ready prompt that cites this PRD by **ID + version** and includes the most relevant snippets.

```
OBJECTIVE:
- Implement dynamic distribution bar on hover as per PRD‑4175 v0.1.0 (AC‑1..AC‑4)

CONSTRAINTS:
- Follow CLAUDE.md architecture patterns (NgRx state management, standalone components)
- Update distribution calculation within ≤ 100 ms for folders with up to 1,000 files
- Add unit and e2e tests
- Use feature flag `dynamicDistributionBar`

CONTEXT:
- Distribution bar component location and current implementation
- HoveredNodeId state in appStatus store
- File tree structure from files state
- Area metric from dynamicSettings state
- ThreeViewerService hover detection logic

OUTPUT:
- Updated distribution bar component
- New selector/effect for hovered node distribution calculation
- Test files for unit and e2e scenarios
- Short note: assumptions and follow-ups
```
