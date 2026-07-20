/**
 * WRITE surface of the domainBar state home — the per-setting actions the domain settings bar dispatches.
 * Kept separate from the read facade so a read-only consumer physically cannot dispatch; external access
 * only via this facade (mirrors the mapState home split).
 */

export { setDomainBarGridSize } from "./store/gridSize/gridSize.actions"
export { setDomainBarRotationRange } from "./store/rotationRange/rotationRange.actions"
export { setDomainBarRotationStep } from "./store/rotationStep/rotationStep.actions"
export { setDomainBarShape } from "./store/shape/shape.actions"
export { setDomainBarShrinkToFit } from "./store/shrinkToFit/shrinkToFit.actions"
export { setDomainBarSizeRange } from "./store/sizeRange/sizeRange.actions"
export { setDomainBarSizingMode } from "./store/sizingMode/sizingMode.actions"
export { setDomainBarTopN } from "./store/topN/topN.actions"
