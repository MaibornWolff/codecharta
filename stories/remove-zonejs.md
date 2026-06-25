# Go Zoneless (Remove zone.js)

**As a** developer of the visualization
**I want** to remove zone.js and run the Angular app fully zoneless
**So that** change detection is explicit and signal-driven, the bundle is smaller, and runtime performance improves

## Acceptance Criteria
- [ ] zone.js is removed as a dependency and dropped from the polyfills/build config
- [ ] The app bootstraps with zoneless change detection enabled
- [ ] Components rely on signals / OnPush and explicit change detection instead of zone-triggered cycles
- [ ] All async sources that previously depended on zone patching (events, timers, RxJS, Three.js callbacks) still update the UI correctly
- [ ] Unit and e2e tests pass without zone.js, and zone-specific test setup is removed
- [ ] No regressions in map rendering, interactions, or state updates
