import { DefaultProjectorFn, MemoizedSelector } from "@ngrx/store"
import {
    areaMetricSelector,
    enableFloorLabelsSelector,
    invertAreaSelector,
    layoutAlgorithmSelector,
    marginSelector
} from "../../../../stores/mapState/mapState.read.facade"
import { focusedNodePathSelector } from "../../../../stores/sharedView/sharedView.read.facade"

/**
 * View changes that alter the extent of the map and therefore need a refit. The file selectors
 * (visibleFileStates, isDeltaState) are deliberately NOT here: a file-set change is a reconciliation
 * trigger in its own right, and listing it twice would fit the camera twice per load.
 */
export const viewSelectorsTriggeringAutoFit: MemoizedSelector<any, any, DefaultProjectorFn<any>>[] = [
    focusedNodePathSelector,
    layoutAlgorithmSelector,
    invertAreaSelector,
    marginSelector,
    enableFloorLabelsSelector,
    areaMetricSelector
]
