---
name: manual-qa-findings
issue: ""
state: complete
version: <next>
date: 2026-06-10
branch: fix/explorer-sort-dropdown-auto-close
topic: "Issues found during manual QA of the branch — triaged live: small ones fixed directly, larger ones tracked here"
tags: [plan, visualization, qa, bugfix]
---

# Manual QA findings (2026-06-10)

## Goal

Capture and work through issues found while manually testing the branch.
Small items are fixed and committed immediately (marked with the commit hash);
larger or ambiguous ones stay open here until decided/fixed.

## Findings

<!-- format:
- [ ] **Q<n>** <description> — <state: open | fixed <hash> | wontfix (reason)>
-->

- [x] **Q1** `axisCard.component.html` — split: `cc-axis-card-header` extracted, card content deduplicated via one shared template
- [x] **Q2** `metricMetaValue.component.html` — single `display` view model, one state switch
- [x] **Q3** `metricMetaValue.component.ts` — pure named functions (toMetricDisplay, formatMetricValue, toDeltaDisplay, deltaStyleClass), zero comments
- [x] **Q4** `filterMetricDataBySearchTerm.pipe.ts` — aliases live in a Map; guard and comment gone
- [x] **Q5** `metricSelectPopover.component.html` — option row extracted into `cc-metric-select-option`
- [x] **Q6** answered: the name component does use `node.isFlattened` (via `isFlattenedFile`, restricting strike-through to files); the flags are re-decorated on every blacklist change. Follow-up: explorer counts now read the flags directly instead of the redundant matcher round trip
- [x] **Q7** `sidebarExplorer.selectors.ts` — comment became `buildRuleEnginesMatchingNodeDecorator`
- [x] **Q8** `selectTopNByValue.ts` — comments replaced by rankNaNBelowEveryValue/collectTopWindow/smallestValueInWindow
- [x] **Q9** `parseNumberInput.ts` — comment-free, clamp extracted
- [x] **Q10** `codeMapHelper.ts` — blacklist machinery (transformPath, returnIgnore, matcher, isPathBlacklisted/HiddenOrExcluded) moved to `util/blacklist/blacklistMatcher.ts`; codeMapHelper is now 66 lines of node helpers
- [x] **Q11** `codeMapMesh.ts` — comments became invalidateDiffCacheWhenPresentationModeChanged / repaintFormerlySelectedWhenSelectionChanged

## Notes

