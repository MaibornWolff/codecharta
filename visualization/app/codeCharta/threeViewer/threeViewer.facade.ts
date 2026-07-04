// Public surface of the shared 3D viewer layer (Slice 16c). The Three.js scene/renderer/controls/camera
// infra, the building tooltip + id↔building lookup, and the code-map mesh/building render primitives were
// extracted out of features/codeMap into this top-level layer so sibling features (viewCube, labelSettings,
// sidebarInspector, scenarios, …) consume them WITHOUT a bidirectional feature cycle through codeMap.
export { ThreeSceneService } from "./threeSceneService"
export { ThreeRendererService } from "./threeRenderer.service"
export { ThreeMapControlsService } from "./threeMapControls.service"
export { ThreeCameraService } from "./threeCamera.service"
export { CodeMapTooltipService } from "./codeMap.tooltip.service"
export { IdToBuildingService } from "./idToBuilding.service"
export { CodeMapBuilding } from "./rendering/codeMapBuilding"
export { CodeMapMesh } from "./rendering/codeMapMesh"
export { indicesPerNode } from "./rendering/geometryGenerationHelper"
export { CursorType, changeCursorIndicator } from "./cursorIndicator"
