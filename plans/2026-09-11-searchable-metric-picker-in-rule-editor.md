---
name: Searchable metric picker in the flatten/exclude-by-metric editor
issue: -
state: complete
version: 2.3.2
---

## Goal

The "Flatten by metric" / "Exclude by metric" editor picks its metric from the same searchable popover
the metric bar uses (search, scroll, keyboard, description and max value per metric) instead of a
native `<select>`.

## Tasks

### 1. Move the metric bar's picker into the shared UI kit (structural)
- Move the popover, its option component and the search pipe to `features/shared/`; data comes in
  through inputs (`options`, `descriptors`) instead of injected stores
- Keep a thin metricsBar container that feeds node/edge metrics and descriptors, so the metric bar,
  its test ids and its page object stay unchanged

### 2. Use the shared picker in the metric rule editor (behavioral)
- Port `ExplorerMetricRules` also offers the attribute descriptors; the metrics view adapter reads them
  from the metrics lens
- Replace the `<select>` with a trigger button that opens the shared picker, nested in the editor
  popover; options are the rule's metrics with their max value
- Check the picker's position next to the editor in the running app

### 3. Tests, e2e, changelog
- Rework the editor spec and `clearRules.e2e.ts` for the picker
- One "Changed" entry in `visualization/CHANGELOG.md`

## Steps

- [x] Complete Task 1: shared picker + metricsBar container, metricsBar specs green
- [x] Complete Task 2: rule editor uses the shared picker
- [x] Complete Task 3: specs, e2e, changelog; format, test, lint, tsc green

## Notes

- Max value per metric is computed with a loop, not `Math.max(...values)` (large maps overflow the stack)
- Playwright check: opening upward (the shell's fixed `top span-right`) squeezed the picker between the
  top nav and the editor, so the shell got a `positionArea` input; the editor opens its picker below
