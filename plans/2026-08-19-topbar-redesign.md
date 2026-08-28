---
name: topbar-redesign
issue: <none>
state: complete
version: 1
---

## Goal

Restructure the top bar into three zones: the existing file controls on the left, a centered
`Metric` / `Domain` tab pair with a primary-colored active underline, and only `Settings` on the
right. Hovering a tab drops a floating mode row over the map — `Explore | Compare | 3D Print` for
Metric, `Explore` for Domain (see `plans/topbar/image.png`).

## Tasks

### 1. Center tab bar (`viewSwitcher`)

- Move `cc-view-switcher` from `navbar-start` into a `navbar-center` zone; labels become `Metric`
  and `Domain`.
- Tabs are styled exactly like the settings button (`btn btn-ghost btn-sm`) so color and font
  match; the active one adds `font-bold` and a 2px `bg-primary` underline.
- Domain tab is hidden entirely when the loaded file has no domain data. It stays visible in
  compare mode: picking it leaves compare mode instead of being bounced back
  (`RedirectAwayFromDomainViewEffect` now toggles the mode for a navigation to the domain route
  and only redirects for a file set without domain data). The disabled placeholder variant and its
  page-object helper go away.
- The component owns a `previewedView` signal driven by pointer enter/leave and focus. Closing
  runs on a short delay so the pointer can cross the seam into the floating row, and any pick
  inside the switcher closes it right away — otherwise a resting pointer keeps the row covering
  the view below.

### 2. Floating mode row (`viewModeBar`)

- New component rendered by the view switcher, absolutely positioned below the nav bar so it
  overlays the map and never changes `--cc-bars-height`.
- Metric: reuse `cc-mode-toggle` (Explore/Compare) plus `cc-print-3d-button`. The export dialog
  itself moved to the always-mounted nav bar, driven by `Export3DMapDialogStore` — hosted in the
  button it would be destroyed with the mode bar the moment the pointer leaves.
- Domain: a single `Explore` link to the domain route, active while that view is shown.
- Mode items navigate to their own view: picking Explore/Compare from the Metric row while the
  domain view is open switches to the metrics view as well.
- 3D Print is only selectable while the metrics view is already open; otherwise it renders
  disabled with a hint.

### 3. Nav bar cleanup

- `navbar-end` keeps only `cc-settings-button`; the trailing dividers and the per-view control set
  (`viewNavBarControls.ts`) are no longer needed and get deleted.

### 4. Tests

- Update `navBar`, `viewSwitcher`, `modeToggle` specs; add a `viewModeBar` spec.
- Update the playwright page object and the domain-view e2e that asserted the old right-hand
  controls.

## Steps

- [x] Complete Task 1: Center tab bar
- [x] Complete Task 2: Floating mode row
- [x] Complete Task 3: Nav bar cleanup
- [x] Complete Task 4: Tests

## Notes

- Decisions confirmed with the user: floating overlay (no reserved height), tabs navigate on
  click, 3D Print only selectable on the metrics view, Domain tab hidden when unavailable.
- `data-theme="codecharta"` in index.html is not a theme daisyUI knows, so daisy's default palette
  wins over the `@theme` colors in tailwind.css: `primary` renders as daisy's purple, not
  `#1b9cfc`. That is the color the mockup shows. Registering a real daisyUI theme would recolor
  the whole app and is out of scope here.
- The word cloud used to re-run its layout on every return to the domain view: detaching the view
  measures the container as 0x0 and returning measures it back, which re-triggered the render
  effect. It now skips a render whose inputs are unchanged and reports the view ready right away,
  so the spinner still clears.
- `RedirectAwayFromDomainViewEffect` needs both handlers to stay disjoint: the reason stream now
  records the route as of the state change, so a reason that only turns true *as* the user
  navigates onto the domain view is answered by the arrival handler alone. Without that, a
  restore landing on the domain view in compare mode both dropped compare mode and redirected.
- Verified: unit suite (394 files), full playwright suite (57 tests) and a manual pass over the
  built app (hover, travel into the row, pick a mode, 3D Print disabled on the domain view).
