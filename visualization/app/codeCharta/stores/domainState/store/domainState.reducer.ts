import { combineReducers } from "@ngrx/store"
import { DomainState } from "../../../model/codeCharta.model"
import { defaultDrawOutOfBound, drawOutOfBound } from "./drawOutOfBound/drawOutOfBound.reducer"
import { defaultGridSize, gridSize } from "./gridSize/gridSize.reducer"
import { defaultRotationRange, rotationRange } from "./rotationRange/rotationRange.reducer"
import { defaultRotationStep, rotationStep } from "./rotationStep/rotationStep.reducer"
import { defaultShape, shape } from "./shape/shape.reducer"
import { defaultShrinkToFit, shrinkToFit } from "./shrinkToFit/shrinkToFit.reducer"
import { defaultSizeRange, sizeRange } from "./sizeRange/sizeRange.reducer"
import { defaultSizingMode, sizingMode } from "./sizingMode/sizingMode.reducer"
import { defaultSortingOrder, sortingOrder } from "./sortingOrder/sortingOrder.reducer"
import { defaultSortingOrderAscending, sortingOrderAscending } from "./sortingOrderAscending/sortingOrderAscending.reducer"
import { defaultTopN, topN } from "./topN/topN.reducer"

// The domain view's persisted settings: the word-cloud render controls plus the explorer sort the domain
// view remembers on its own. Per-setting slices mirror the mapState home so each persists (via the
// whole-CcState indexedDBWriter) and resets independently.
export const domainState = combineReducers({
    shape,
    sizeRange,
    rotationRange,
    rotationStep,
    gridSize,
    sizingMode,
    topN,
    shrinkToFit,
    drawOutOfBound,
    sortingOrder,
    sortingOrderAscending
})

export const defaultDomainState: DomainState = {
    shape: defaultShape,
    sizeRange: defaultSizeRange,
    rotationRange: defaultRotationRange,
    rotationStep: defaultRotationStep,
    gridSize: defaultGridSize,
    sizingMode: defaultSizingMode,
    topN: defaultTopN,
    shrinkToFit: defaultShrinkToFit,
    drawOutOfBound: defaultDrawOutOfBound,
    sortingOrder: defaultSortingOrder,
    sortingOrderAscending: defaultSortingOrderAscending
}
