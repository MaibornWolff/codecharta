---
name: align-metric-settings-popover-style
issue: ""
state: progress
version: <next>
date: 2026-05-12
git_commit: 7708617904d4310f0896fc9b9f666235d6eab2f6
branch: fix/explorer-sort-dropdown-auto-close
topic: "Align metric settings popovers with labels settings panel design"
tags: [plan, visualization, metricsBar, labelSettings, daisyui, restyle]
---

# Align metric settings popovers with labels settings panel design

## Goal

The four metric-settings popovers (Area, Height, Color, Edge) feel visually different from the labels-settings popover even though they reuse the same DaisyUI primitives. Two concrete deltas are responsible: (1) the reset button still uses a legacy icon-link look (`<button>` with a 40×40 round-on-hover icon) while labels uses a full DaisyUI error-outline button, and (2) the popover containers use `p-3 ... gap-3` while the labels panel uses `gap-2.5 py-2 px-5`.

We bring the metric popovers in line by restyling `cc-reset-settings-button` once (all 5 usages get the new look at no extra cost) and by swapping the popover-container utility classes.

## Current State Analysis

- `app/codeCharta/ui/resetSettingsButton/resetSettingsButton.component.html` renders a bare `<button>` with `.fa.fa-undo` + optional label, styled via `resetSettingsButton.component.scss` (icon as a 40×40 circle, hover ring, no border, primary color). Used in:
  - `features/metricsBar/components/areaSettingsPopover/areaSettingsPopover.component.html:50`
  - `features/metricsBar/components/heightSettingsPopover/heightSettingsPopover.component.html:44`
  - `features/metricsBar/components/colorSettingsPopover/colorSettingsPopover.component.html:21` (Reset thresholds)
  - `features/metricsBar/components/colorSettingsPopover/colorSettingsPopover.component.html:72` (Reset colors)
  - `features/metricsBar/components/edgeSettingsPopover/edgeSettingsPopover.component.html:96`
- A near-duplicate component already exists at `features/globalSettings/components/globalConfigurationDialog/resetSettingsButton/resetSettingsButton.component.{ts,html}` and renders the exact target template `<button class="btn btn-outline btn-error gap-2">…</button>`. That separate component is **not** consolidated by this plan — it stays as-is. Only the `/ui/resetSettingsButton/` component is updated.
- The existing spec `ui/resetSettingsButton/resetSettingsButton.component.spec.ts` asserts behavior only (`setState` dispatch + callback) via `screen.getByRole("button")` — agnostic to the new markup.
- The four popovers each declare `<div class="dropdown p-3 rounded-box bg-base-100 shadow-lg w-XX flex flex-col gap-3" popover …>` as the only popover root.
- The reference labels panel composition:
  - Outer popover (inside `labelsSegment.component.html`): `dropdown p-2 rounded-box bg-base-100 shadow-lg w-80`.
  - Inner `cc-label-settings-panel` host class: `flex flex-col gap-2.5 py-2 px-5`.
  - Reset button at the end uses `<button class="btn btn-outline btn-error gap-2"><i class="fa fa-undo"></i><span>Reset label settings</span></button>` (inline, normal DaisyUI size, no `btn-sm`).

## Desired End State

- `cc-reset-settings-button` renders `<button class="btn btn-outline btn-error gap-2" …>` with `<i class="fa fa-undo"></i>` and (when `label` is set) `<span>{{ label }}</span>`. No SCSS file is loaded; the legacy `resetSettingsButton.component.scss` is removed and its reference in the `@Component` decorator drops.
- Each of the four metric settings popovers (`areaSettingsPopover`, `heightSettingsPopover`, `colorSettingsPopover`, `edgeSettingsPopover`) uses a single root element with classes `dropdown rounded-box bg-base-100 shadow-lg w-XX flex flex-col gap-2.5 py-2 px-5` (per-popover width preserved: w-72, w-72, w-[640px], w-80). No nested padding wrapper.
- The metric-select (search) popover is **not** changed.
- The labels popover (`features/labelSettings/...`) is **not** changed in this plan.
- All Jest specs pass; visual check matches the labels popover in spacing, button affordance, and overall density.

## What We're NOT Doing

- Not consolidating the duplicate `cc-reset-settings-button` in `features/globalSettings/components/globalConfigurationDialog/resetSettingsButton/` with the `/ui/` one. They share a selector but live in disjoint imports; deduplication is out of scope.
- Not touching the metric-select (search) popover (`metricSelectPopover.component.html`). Per chosen scope, only the cog-icon settings popovers are restyled.
- Not modifying `cc-label-settings-panel` or `labelsSegment.component.html`. The label popover stays as the visual reference.
- Not adding a `size`/`variant` input to `cc-reset-settings-button`. All five usages adopt the same normal-sized DaisyUI button. The Color popover layout is wide enough (`w-[640px]`) to accommodate two normal-sized buttons.
- Not changing the reset-button behavior (dispatches `setState` via `getPartialDefaultState`, fires optional `callback`). Only the template + SCSS.
- Not converting the labels panel's inline reset button to use `cc-reset-settings-button`. They use different reset mechanisms (`stateAccessStore.resetSettings(...)` vs `setState(...)`) and behavior parity isn't verified.
- Not introducing new selectors, animation, or accessibility changes beyond what the new button markup already provides.

## UI Mockups

### Reset button — before / after

```
BEFORE (cc-reset-settings-button, ui/resetSettingsButton)
┌────────────────────────────────┐
│ ⟲  Reset area metric settings  │   ← bare button, FA icon ⟲ in
└────────────────────────────────┘    a 40×40 circle on hover,
                                       text in primary color

AFTER
┌────────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ ⟲  Reset area metric set.. ┃ │   ← btn btn-outline btn-error
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │      gap-2, red border, full
└────────────────────────────────┘      DaisyUI button
```

### Popover container — before / after (Area shown; same shape for Height, Color, Edge)

```
BEFORE (areaSettingsPopover.component.html line 1)
┌── dropdown p-3 ... gap-3 (w-72) ──────────┐
│  Margin                                     │
│  [─────────●─────] [ 12 ]                  │  ← gap-3 between rows
│                                             │
│  ☑ Enable Floor Labels                      │
│                                             │
│  ☐ Invert Area                              │
│                                             │
│  ⟲ Reset area metric settings              │  ← legacy icon link
└─────────────────────────────────────────────┘

AFTER
┌── dropdown ... gap-2.5 py-2 px-5 (w-72) ──┐
│ Margin                                      │
│ [─────────●─────] [ 12 ]                   │  ← tighter gap-2.5,
│ ☑ Enable Floor Labels                      │     px-5 inner padding
│ ☐ Invert Area                              │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ ⟲ Reset area metric settings           ┃ │  ← DaisyUI error btn
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└─────────────────────────────────────────────┘
```

### Color popover — buttons stay normal-size

```
[───────── slider ──────────]
┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ⟲ Reset thresholds      ┃   ← btn btn-outline btn-error (normal)
┗━━━━━━━━━━━━━━━━━━━━━━━━┛
[─── range diagram ─────]
[ Gradient Mode  ▾ ]
┌ positive ─┐ ┌ neutral ─┐ ┌ negative ─┐  ← color pickers
└ selected ─┘
┏━━━━━━━━━━━━━━━━━━━━━━━━┓  ┌─────────────┐
┃ ⟲ Reset colors          ┃  │ ☐ Invert    │  ← buttons + checkbox row
┗━━━━━━━━━━━━━━━━━━━━━━━━┛  └─────────────┘
```

(The horizontal row keeps `flex items-center justify-between gap-2`; the button sits at the start, the Invert Colors label at the end. With a normal DaisyUI button the row is taller than today but still fits w-[640px].)

## Architecture and Code Reuse

The change is purely presentational. There is exactly one shared component to update (`cc-reset-settings-button`) and four popover templates to touch. No new files, no new abstractions.

```
visualization/app/codeCharta/
├── ui/resetSettingsButton/
│   ├── resetSettingsButton.component.html       ← MODIFY (DaisyUI btn markup)
│   ├── resetSettingsButton.component.ts         ← MODIFY (drop styleUrls)
│   └── resetSettingsButton.component.scss       ← DELETE
└── features/metricsBar/components/
    ├── areaSettingsPopover/
    │   └── areaSettingsPopover.component.html   ← MODIFY (root classes)
    ├── heightSettingsPopover/
    │   └── heightSettingsPopover.component.html ← MODIFY (root classes)
    ├── colorSettingsPopover/
    │   └── colorSettingsPopover.component.html  ← MODIFY (root classes)
    └── edgeSettingsPopover/
        └── edgeSettingsPopover.component.html   ← MODIFY (root classes)
```

Reference template for the restyled reset button (taken verbatim from `features/globalSettings/components/globalConfigurationDialog/resetSettingsButton/resetSettingsButton.component.html`):

```html
<button class="btn btn-outline btn-error gap-2" (click)="applyDefaultSettings()" [title]="tooltip">
    <i class="fa fa-undo"></i>
    @if (label) {
        <span>{{ label }}</span>
    }
</button>
```

Reference root-container classes (matches `cc-label-settings-panel`'s host class minus the `host:` wrapping, with width preserved per popover):

```html
<div
    class="dropdown rounded-box bg-base-100 shadow-lg w-72 flex flex-col gap-2.5 py-2 px-5"
    popover
    [id]="popoverId()"
    [style.position-anchor]="'--' + anchorName()"
    [style.position-area]="'top span-right'"
>
```

Per-popover width table (do not change):

| Popover | Width class |
| --- | --- |
| Area | `w-72` |
| Height | `w-72` |
| Color | `w-[640px] max-w-[95vw]` |
| Edge | `w-80` |

## Performance Considerations

None. Template-only edits; no extra signals, services, or DOM nodes added.

## Migration Notes

- The `cc-reset-settings-button` selector, inputs (`settingsKeys`, `tooltip`, `label`, `callback`), and `applyDefaultSettings()` behavior are unchanged. All five call sites work without edits.
- The component decorator's `styleUrls: ["./resetSettingsButton.component.scss"]` line is removed in tandem with the SCSS deletion so Angular doesn't warn about a missing stylesheet.
- No persisted state, no router/URL change, no API surface change.

---

## Phase 1: Restyle `cc-reset-settings-button`

Bring the shared reset button up to the DaisyUI error-outline look so all five usages adopt the new style at once.

**Tasks**:
- [x] Replace the body of `app/codeCharta/ui/resetSettingsButton/resetSettingsButton.component.html` with:
  ```html
  <button class="btn btn-outline btn-error gap-2" (click)="applyDefaultSettings()" [title]="tooltip">
      <i class="fa fa-undo"></i>
      @if (label) {
          <span>{{ label }}</span>
      }
  </button>
  ```
  (Drop the trailing space inside `{{ label }}` from the old template; the DaisyUI `gap-2` handles spacing between icon and span.)
- [x] Remove `styleUrls: ["./resetSettingsButton.component.scss"]` from `app/codeCharta/ui/resetSettingsButton/resetSettingsButton.component.ts` (leave `standalone: true` and all other metadata untouched). The SCSS is only referenced from the component decorator — no entry in `angular.json`/`tsconfig*.json` and no global SCSS imports reference it (verified at plan time: `grep -rn "reset-settings-button" visualization/app --include="*.scss" --include="*.css"` returns empty), so deletion is safe.
- [x] Delete `app/codeCharta/ui/resetSettingsButton/resetSettingsButton.component.scss`.
- [x] Sanity-check: re-run `grep -rn "reset-settings-button" visualization/app --include="*.scss" --include="*.css"` after deletion — must remain empty.

**Automated Verification**:
- [x] `ui/resetSettingsButton/resetSettingsButton.component.spec.ts` — both existing tests (`should reset given appSetting`, `should execute callback`) still pass; they rely on `screen.getByRole("button")` and a click handler, both of which the new markup preserves.
- [x] `npm test` (from `visualization/`) passes.
- [x] `npm run build` (from `visualization/`) succeeds; no warning about a missing `resetSettingsButton.component.scss`. (Dev server `bun --watch` rebuild confirmed clean after deletion.)
- [x] `npm run format:check` (from repo root) passes.

**Notes**:
- Added `host: { class: "contents" }` to the component decorator so the host element drops out of layout. This lets the inner `btn` behave as a direct child of the popover's flex column — stretching to full width like the labels-panel reset button — while still sitting naturally inside the Color popover's horizontal "Reset colors + Invert Colors" row.

---

## Phase 2: Restyle the four metric settings popovers

Dependencies: **Phase 1** (so the inline reset button already looks DaisyUI-correct when we eyeball the popovers).

Swap the popover root element classes in each of the four templates. No other content changes.

**Tasks**:
- [x] `app/codeCharta/features/metricsBar/components/areaSettingsPopover/areaSettingsPopover.component.html` line 2: replace
      `class="dropdown p-3 rounded-box bg-base-100 shadow-lg w-72 flex flex-col gap-3"`
      with
      `class="dropdown rounded-box bg-base-100 shadow-lg w-72 flex flex-col gap-2.5 py-2 px-5"`.
- [x] `app/codeCharta/features/metricsBar/components/heightSettingsPopover/heightSettingsPopover.component.html` line 2: replace
      `class="dropdown p-3 rounded-box bg-base-100 shadow-lg w-72 flex flex-col gap-3"`
      with
      `class="dropdown rounded-box bg-base-100 shadow-lg w-72 flex flex-col gap-2.5 py-2 px-5"`.
- [x] `app/codeCharta/features/metricsBar/components/colorSettingsPopover/colorSettingsPopover.component.html` line 2: replace
      `class="dropdown p-3 rounded-box bg-base-100 shadow-lg w-[640px] max-w-[95vw] flex flex-col gap-3"`
      with
      `class="dropdown rounded-box bg-base-100 shadow-lg w-[640px] max-w-[95vw] flex flex-col gap-2.5 py-2 px-5"`.
- [x] `app/codeCharta/features/metricsBar/components/edgeSettingsPopover/edgeSettingsPopover.component.html` line 2: replace
      `class="dropdown p-3 rounded-box bg-base-100 shadow-lg w-80 flex flex-col gap-3"`
      with
      `class="dropdown rounded-box bg-base-100 shadow-lg w-80 flex flex-col gap-2.5 py-2 px-5"`.

**Automated Verification**:
- [x] `npm test` (from `visualization/`) passes — no template-snapshot tests target these popovers; existing specs (e.g. `metricsBar.component.spec.ts`) keep passing.
- [x] `npm run build` (from `visualization/`) succeeds. (Dev server bundle rebuild confirmed clean after each template edit.)
- [x] `npm run format:check` (from repo root) passes. (Also reformatted two pre-existing unrelated files — `edgeSettingsPopover.component.ts` and `metricsBar.component.ts` — to satisfy the gate.)

---

## Phase 3: Verify visually and update the changelog

Dependencies: **Phase 1**, **Phase 2**.

**Tasks**:
- [x] Add a `Changed` entry to `visualization/CHANGELOG.md` under `[unreleased]`, e.g.:
      `- **Metric settings popovers**: Restyled the Area, Height, Color, and Edge settings popovers to match the Label settings panel — same DaisyUI spacing (\`gap-2.5 py-2 px-5\`) and a full \`btn btn-outline btn-error\` reset button.`

**Automated Verification**:
- [x] `npm test`, `npm run build`, `npm run format:check` all pass (final pass after both phases).

**Manual Verification** (`npm run dev` from `visualization/`):
- [ ] Click the Area cog → popover shows Margin slider, two checkboxes, and a full-width red-outline "Reset area metric settings" button. Spacing visually matches the Labels popover (open Labels segment side-by-side to compare).
- [ ] Click the Height cog → popover shows Height slider, Invert Height (when not in delta state), red-outline "Reset height metric settings" button.
- [ ] Click the Color cog → popover shows range slider, "Reset thresholds" red-outline button, diagram, Gradient Mode select, color pickers, and a row containing "Reset colors" (red-outline button) + "Invert Colors" checkbox. The two buttons and the checkbox align cleanly within the `w-[640px]` width.
- [ ] In delta mode (load two files in delta mode), the Color popover shows positiveDelta/negativeDelta pickers, the "Reset colors" button, and the "Invert Colors" checkbox bound to `areDeltaColorsInverted`.
- [ ] Click the Edge cog (with a file that has edges) → popover shows Preview/Height sliders, outgoing/incoming edge color rows, "Only show nodes with edges" toggle, edge metric toggle, red-outline "Reset edge metric settings" button.
- [ ] Each reset button still actually resets the underlying settings (e.g. drag the Margin slider, click Reset, confirm Margin returns to default).
- [ ] No console errors or layout regressions on a 1440×900 viewport.

---

## References

- Reference DaisyUI button template (already used elsewhere): `app/codeCharta/features/globalSettings/components/globalConfigurationDialog/resetSettingsButton/resetSettingsButton.component.html:1`
- Reference labels panel host spacing: `app/codeCharta/features/labelSettings/components/labelSettingsPanel/labelSettingsPanel.component.ts:21` (`host: { class: "flex flex-col gap-2.5 py-2 px-5" }`)
- Reference labels reset button inline markup: `app/codeCharta/features/labelSettings/components/labelSettingsPanel/labelSettingsPanel.component.html:92`
- Affected popovers:
  - `app/codeCharta/features/metricsBar/components/areaSettingsPopover/areaSettingsPopover.component.html`
  - `app/codeCharta/features/metricsBar/components/heightSettingsPopover/heightSettingsPopover.component.html`
  - `app/codeCharta/features/metricsBar/components/colorSettingsPopover/colorSettingsPopover.component.html`
  - `app/codeCharta/features/metricsBar/components/edgeSettingsPopover/edgeSettingsPopover.component.html`
- Shared button being restyled: `app/codeCharta/ui/resetSettingsButton/resetSettingsButton.component.{ts,html,scss,spec.ts}`
- Earlier related plan that introduced this feature: `plans/2026-05-07-floating-metrics-bar.md`
