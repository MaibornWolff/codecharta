---
name: update-threejs-to-0.182
state: complete
---

## Goal

Update Three.js from 0.168 to 0.182 and remove unused `three-orbit-controls` dependency.

## Tasks

### 1. Update dependencies
- Update `three` to `^0.182.0` in package.json
- Update `@types/three` to `^0.182.0` in devDependencies
- Remove `three-orbit-controls` from dependencies
- Remove `three-orbit-controls` from angular.json allowedCommonJsDependencies

### 2. Fix type changes
- `Texture.image` changed from `any` to `unknown` — cast to `HTMLCanvasElement` where `.width` is accessed

### 3. Update snapshots
- Three.js geometry internals changed vertex ordering — update 9 snapshots in 3 test suites

## Steps

- [x] Update package.json versions and remove three-orbit-controls
- [x] Remove three-orbit-controls from angular.json
- [x] Run npm install
- [x] Fix TypeScript compilation errors (Texture.image type change)
- [x] Run unit tests and update snapshots
- [x] Run e2e tests

## Notes

- No breaking API changes affect this codebase (WebGL-only, no WebGPU/TSL usage)
- Only type-level change: `Texture.image` is now `unknown` instead of `any`
- 9 snapshot updates due to internal vertex ordering changes in BoxGeometry
