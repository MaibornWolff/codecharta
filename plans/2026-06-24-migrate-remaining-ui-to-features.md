---
name: Migrate remaining ui/ to the feature architecture
issue:
state: complete
version: 1
---

## Goal

Migrate the 7 remaining `app/codeCharta/ui/` folders into the feature-slice + facade architecture, convert their SCSS to Tailwind/daisyUI, route all cross-feature access through facades, then delete `ui/` and tighten the dependency-cruiser rules. Story: `stories/migrate-ui-feature-architecture.md` (#2).

## Decisions (agreed 2026-06-24)

- Migrate **all** remaining `ui/`, **one slice per PR**, in dependency order.
- Target allocation (from `plans/2026-06-12-finish-feature-architecture-migration.md`, which this consolidates):
  - `codeMap` → `features/codeMap` (new facade exposing render/three services).
  - `viewCube` (cube + `zoomSlider`) → `features/viewCube`; existing `features/viewCubeToolbox` stays and composes it via facade.
  - `fileExtensionBar` → `features/fileExtensionBar`.
  - `actionIcon`, `dialogs/errorDialog`, `loadingFileProgressSpinner`, `resetSettingsButton` → `features/shared/components`.
  - Pure store helper `resetSettingsButton/getPartialDefaultState.ts` → `state/store/util/`.
- Components are already OnPush + signal-driven (handled by `stories/remove-zonejs.md` / `plans/2026-06-24-go-zoneless.md`), so each PR is a structural move + styling + facade wiring, not a behavior change.

## Background (audit 2026-06-24)

- 13 feature slices exist, all with `facade.ts`; Material fully removed; 0 SCSS in `features/`.
- Remaining in `ui/`: `actionIcon`, `codeMap`, `dialogs`, `fileExtensionBar`, `loadingFileProgressSpinner`, `resetSettingsButton`, `viewCube` (7 SCSS files total).
- Dep-cruiser already enforces (as `error`): `feature-no-external-access-to-internals`, `feature-cross-feature-only-via-public-api`, `feature-only-stores-can-import-ngrx-store`, `features-no-scss-files`, `no-angular-material`. `no-circular` is `warn`.
- Established slice layout (e.g. `globalSettings`): `facade.ts` + `components/`, `services/`, `stores/`, `selectors/`. Facade exports public components + selected selectors/services only.

## Tasks (each is one PR)

### PR 1 — shared leaf components → `features/shared`
- Move `actionIcon`, `dialogs/errorDialog`, `loadingFileProgressSpinner`, `resetSettingsButton` into `features/shared/components`; SCSS → Tailwind.
- Move `getPartialDefaultState.ts` to `state/store/util/`; update its importers (`globalSettings`, `labelSettings` stores).
- Update all importers to the new paths; build + dep-cruiser + tests green.

### PR 2 — `fileExtensionBar` → `features/fileExtensionBar`
- Move component(s) + services + selectors into the slice layout; convert 3 SCSS files to Tailwind.
- Expose the public component (+ any needed selector) via `facade.ts`; update importers.

### PR 3 — `codeMap` → `features/codeMap` (largest)
- Move the component + the ~9 three.js/render/tooltip/mouseEvent services.
- Create `facade.ts` exposing `codeMapRenderService`, `threeSceneService`, `threeRendererService`, `threeMapControlsService`, `threeCameraService`, tooltip + mouseEvent services.
- Repoint the 14+ feature importers (incl. effects) to the facade; convert `codeMap.component.scss` to Tailwind.

### PR 4 — `viewCube` → `features/viewCube`
- Move cube component + `meshGenerator`/materials/mouseEvents service + `zoomSlider` into the slice.
- Access map controls via the `features/codeMap` facade (PR 3); keep `features/viewCubeToolbox` composing it via facade. Convert 2 SCSS files to Tailwind.

### PR 5 — teardown + tighten rules
- Confirm `ui/` is empty and delete it.
- Extend `features-no-scss-files` / `no-angular-material` app-wide (drop any `ui/` exemptions).
- Raise `no-circular` from `warn` to `error` once the move clears remaining cycles.

## Steps

- [x] PR 1: shared leaf components → `features/shared` (+ getPartialDefaultState to state util) — `daea1faa7`
- [x] PR 2: `fileExtensionBar` → `features/fileExtensionBar` — `72b48b33e` (also moved `FileExtensionCalculator` to `util/` to avoid a cycle)
- [x] PR 3: `codeMap` → `features/codeMap` (with facade) — `55e335b74` (full ngrx stores refactor; cycle rule → `warn`)
- [x] PR 4: `viewCube` → `features/viewCube` — `4094ee6d6` (+ fixed a build regression: removed `.po` from the codeMap facade)
- [x] PR 5: delete `ui/`, tighten dep-cruiser rules — `056ebe7fb`

## Notes

- Order matters: PR 3 (codeMap facade) before PR 4 (viewCube needs it). Shared/fileExtensionBar (PRs 1–2) are independent leaves and can land first.
- `ui/viewCube` is NOT dead code — it's imported by `codeMap.component` (invisible to a plain selector grep).
- Each PR keeps behavior identical; rely on existing tests + dep-cruiser `error` rules to prove isolation. Add/move specs alongside each slice.
- After this, `stories/map-layout-switcher.md` (#3) builds on `features/codeMap`.

## Follow-up (deferred, agreed 2026-06-24)

- Making codeMap a feature surfaced **real bidirectional cycles** in the rendering cluster: `codeMap ↔ viewCube` (the cube renders into the map's interaction layer; the map renders the cube), `codeMap ↔ labelSettings` (mouse/render events call `LabelSettingsFacade`; labels draw into the 3D scene), `codeMap ↔ sidebarInspector` (`codeMap.component` ↔ `InspectorVisibilityService`), and `viewCube → viewCubeToolbox → codeMap`.
- `feature-no-circular-dependencies-between-features` is kept at **`error`** but made cross-feature-only (intra-feature cycles fall to the app-wide `no-circular` warn) and **grandfathers the codeMap/viewCube pair** via `pathNot` — every current cross-feature cycle edge touches one of those two, so the rest of the feature graph is still enforced (verified: a `legend ↔ metricsBar` cycle errors). Follow-up: break the cluster cycles via dependency inversion (events/callbacks) in a dedicated story, then drop the codeMap/viewCube exemption.
