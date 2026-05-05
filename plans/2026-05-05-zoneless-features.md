---
name: Make features/ components zoneless
issue:
state: todo
version: 1
---

## Goal

Bring every component under `visualization/app/codeCharta/features/` in line with the zoneless baseline (`ChangeDetectionStrategy.OnPush` + signals/async pipe, no Zone.js reliance), and add a guardrail so new feature components cannot regress. Legacy `ui/` is out of scope and remains zoned for now.

## Background

Audit on 2026-05-05 of `visualization/app/codeCharta/features/`:

- 57 components total, 30 with `OnPush`, **27 missing OnPush**.
- No code under `features/` imports `NgZone` or calls `runOutsideAngular` (good).
- App is still bootstrapped with `provideZoneChangeDetection()` in `app/main.ts`; flipping to `provideZonelessChangeDetection()` is a separate later step that depends on `ui/` also being safe.

### Components missing OnPush

**features/3dPrint (9)**
- `export3DMapButton`
- `export3DMapDialog`
- `export3DMapDialog/exportActions`
- `export3DMapDialog/frontTextInput`
- `export3DMapDialog/logoUpload`
- `export3DMapDialog/printerPresetSelection`
- `export3DMapDialog/qrCodeSettings`
- `export3DMapDialog/scaleSlider`
- `export3DMapDialog/secondRowTextInput`

**features/changelog (2)**
- `changelogButton`
- `changelogDialog`

**features/globalSettings (7)**
- `globalConfigurationButton`
- `globalConfigurationDialog`
- `globalConfigurationDialog/displayQualitySelection`
- `globalConfigurationDialog/externalLinks`
- `globalConfigurationDialog/mapLayoutSelection`
- `globalConfigurationDialog/resetSettingsButton`
- `globalConfigurationDialog/settingToggle`

**features/scenarios (8)**
- `applyScenarioDialog`
- `saveScenarioDialog`
- `scenarioListDialog/deleteConfirmDialog`
- `scenarioListDialog/importFeedbackDialog`
- `scenarioListDialog/scenarioItem`
- `scenarioListDialog/scenarioItem/scenarioItemActions`
- `scenarioListDialog/scenarioItem/scenarioItemBadges`
- `scenariosPanel`

**features/viewCubeToolbox (1)**
- `confirmResetMapDialog`

## Tasks

### 1. Add an ESLint guardrail (do this first)

- Add an `overrides` block in the visualization ESLint config scoped to `app/codeCharta/features/**/*.component.ts`.
- Enable `@angular-eslint/prefer-on-push-component-change-detection` as `error` for that scope.
- Run lint, confirm it flags exactly the 27 components above. This becomes the working backlog and prevents new feature components from landing without OnPush.
- Optional companion in `.dependency-cruiser.js`: forbid `from: ^app/codeCharta/features/` `to: @angular/core` named `NgZone` — useful belt-and-braces, but ESLint already covers the core regression.

### 2. Backfill OnPush — easy buttons & static panels

Single-line decorator changes; no template work expected. Run the relevant component test after each.

- `features/3dPrint/components/export3DMapButton`
- `features/changelog/components/changelogButton`
- `features/globalSettings/components/globalConfigurationButton`
- `features/globalSettings/components/globalConfigurationDialog/externalLinks`
- `features/globalSettings/components/globalConfigurationDialog/resetSettingsButton`
- `features/scenarios/components/scenariosPanel`
- `features/scenarios/components/scenarioListDialog/scenarioItem/scenarioItemBadges`
- `features/viewCubeToolbox/components/confirmResetMapDialog`

### 3. Backfill OnPush — dialogs with form/local state

Need a quick check that each mutable field is a signal, an `@Input`, or driven by `FormControl`/`ngModel`. Where a callback mutates a plain field, either lift it to a signal or call `cdr.markForCheck()`.

- `features/3dPrint/components/export3DMapDialog` (and its child inputs: `frontTextInput`, `secondRowTextInput`, `logoUpload`, `qrCodeSettings`, `scaleSlider`, `printerPresetSelection`, `exportActions`)
- `features/changelog/components/changelogDialog`
- `features/globalSettings/components/globalConfigurationDialog` (and `displayQualitySelection`, `mapLayoutSelection`, `settingToggle`)
- `features/scenarios/components/applyScenarioDialog`
- `features/scenarios/components/saveScenarioDialog`
- `features/scenarios/components/scenarioListDialog/deleteConfirmDialog`
- `features/scenarios/components/scenarioListDialog/importFeedbackDialog`
- `features/scenarios/components/scenarioListDialog/scenarioItem`
- `features/scenarios/components/scenarioListDialog/scenarioItem/scenarioItemActions`

### 4. Verify behaviour

- `npm test` green for all touched components.
- `npm run e2e` green for the affected feature flows: 3D export dialog, changelog dialog, global configuration dialog, scenarios apply/save/list, view-cube reset confirm.
- Manual smoke in `npm run dev`: open each dialog, change a setting, confirm UI updates.

### 5. (Out of scope, follow-up) Flip the app to zoneless

Once `ui/` is also safe, swap `provideZoneChangeDetection()` for `provideZonelessChangeDetection()` in `app/main.ts`, drop the two `zone.js` imports (`app/main.ts`, `app/polyfills.ts`), remove the `polyfills` entries in `angular.json`, and uninstall the `zone.js` dependency. Track in a separate plan.

## Steps

- [ ] Complete Task 1: Add ESLint guardrail (and optional dep-cruiser rule)
- [ ] Complete Task 2: Backfill OnPush on easy buttons & static panels (8 components)
- [ ] Complete Task 3: Backfill OnPush on dialogs with form/local state (19 components)
- [ ] Complete Task 4: Verify with unit tests, e2e, and manual smoke

## Notes

- "Zoneless" here means the *component* is OnPush + signal/async-driven; the app-wide zoneless flip stays out of scope until `ui/` is also safe.
- Audit numbers reflect the repo state on 2026-05-05; rerun the count before starting work in case the picture has shifted.
- Counting command used: `find app/codeCharta/features -name "*.component.ts" -not -name "*.spec.ts"` cross-referenced with `grep -l "ChangeDetectionStrategy.OnPush"`.
