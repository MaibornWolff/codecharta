// Public surface of the shared 3D viewer layer (Slice 16c). The Three.js scene/renderer/controls/camera
// infra, the building tooltip + id↔building lookup, and the code-map mesh/building render primitives were
// extracted out of features/codeMap into this top-level layer so sibling features (viewCube, labelSettings,
// sidebarInspector, scenarios, …) consume them WITHOUT a bidirectional feature cycle through codeMap.

export { StreetLayoutGenerator } from "./algorithm/streetLayout/streetLayoutGenerator"
export { createTreemapNodes } from "./algorithm/treeMapLayout/treeMapGenerator"
export { treeMapSize } from "./algorithm/treeMapLayout/treeMapHelper"
export { CodeMapTooltipService } from "./codeMap.tooltip.service"
export { CursorType, changeCursorIndicator } from "./cursorIndicator"
export { IdToBuildingService } from "./idToBuilding.service"
export { CodeMapBuilding } from "./rendering/codeMapBuilding"
export { CodeMapMesh } from "./rendering/codeMapMesh"
export { indicesPerNode } from "./rendering/geometryGenerationHelper"
export { ColorCategoryCountsStore } from "./stores/colorCategoryCounts.store"
export { ThreeCameraService } from "./threeCamera.service"
export { ThreeMapControlsService } from "./threeMapControls.service"
export { ThreeRendererService } from "./threeRenderer.service"
export { ThreeSceneService } from "./threeSceneService"
export { ThreeStatsService } from "./threeStats.service"
export { ThreeViewerService } from "./threeViewer.service"
