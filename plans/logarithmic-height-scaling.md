---
name: height-scale-modes
issue: n/a
state: complete
version: 2
---

## Goal

Replace `isLogScaleHeight` boolean with `HeightScaleMode` enum offering 6 modes: Linear, Logarithmic, Square Root, Power, Hybrid Linear-Log, Percentile.

## Steps

- [x] Add `HeightScaleMode` enum to model, replace `isLogScaleHeight` with `heightScaleMode` + `heightScalePowerExponent`
- [x] Create heightScaleMode and heightScalePowerExponent state files
- [x] Implement `applyHeightScaling()` with all 6 modes in treeMapHelper
- [x] Update generators to remove maxHeight transform, add percentile value collection
- [x] Update height settings panel UI (dropdown + conditional power slider)
- [x] Update all registrations (reducers, mocks, loadInitialFile, customConfigBuilder, actionsRequiringRerender)
- [x] Delete old isLogScaleHeight directory
- [x] Update and verify all tests (34 suites, 189 tests passing)
