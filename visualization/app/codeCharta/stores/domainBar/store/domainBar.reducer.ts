import { combineReducers } from "@ngrx/store"
import { WordCloudSettings } from "../../../model/wordCloud.model"
import { defaultDrawOutOfBound, drawOutOfBound } from "./drawOutOfBound/drawOutOfBound.reducer"
import { defaultGridSize, gridSize } from "./gridSize/gridSize.reducer"
import { defaultRotationRange, rotationRange } from "./rotationRange/rotationRange.reducer"
import { defaultRotationStep, rotationStep } from "./rotationStep/rotationStep.reducer"
import { defaultShape, shape } from "./shape/shape.reducer"
import { defaultShrinkToFit, shrinkToFit } from "./shrinkToFit/shrinkToFit.reducer"
import { defaultSizeRange, sizeRange } from "./sizeRange/sizeRange.reducer"
import { defaultSizingMode, sizingMode } from "./sizingMode/sizingMode.reducer"
import { defaultTopN, topN } from "./topN/topN.reducer"

// The domain settings bar's persisted render controls for the word cloud. Per-setting slices mirror the
// mapState home so each control persists (via the whole-CcState indexedDBWriter) and resets independently.
export const domainBar = combineReducers({
    shape,
    sizeRange,
    rotationRange,
    rotationStep,
    gridSize,
    sizingMode,
    topN,
    shrinkToFit,
    drawOutOfBound
})

export const defaultDomainBar: WordCloudSettings = {
    shape: defaultShape,
    sizeRange: defaultSizeRange,
    rotationRange: defaultRotationRange,
    rotationStep: defaultRotationStep,
    gridSize: defaultGridSize,
    sizingMode: defaultSizingMode,
    topN: defaultTopN,
    shrinkToFit: defaultShrinkToFit,
    drawOutOfBound: defaultDrawOutOfBound
}
