import { DefaultProjectorFn, MemoizedSelector } from "@ngrx/store"
import { isDeltaStateSelector, visibleFileStatesSelector } from "../../../../stores/fileStore/fileStore.facade"
import {
    areaMetricSelector,
    enableFloorLabelsSelector,
    invertAreaSelector,
    layoutAlgorithmSelector,
    marginSelector
} from "../../../../stores/mapState/mapState.read.facade"
import { focusedNodePathSelector } from "../../../../stores/sharedView/sharedView.read.facade"

export const selectorsTriggeringAutoFit: MemoizedSelector<any, any, DefaultProjectorFn<any>>[] = [
    visibleFileStatesSelector,
    focusedNodePathSelector,
    layoutAlgorithmSelector,
    invertAreaSelector,
    marginSelector,
    enableFloorLabelsSelector,
    areaMetricSelector,
    isDeltaStateSelector
]
