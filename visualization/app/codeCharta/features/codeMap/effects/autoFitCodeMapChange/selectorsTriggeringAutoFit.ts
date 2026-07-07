import { visibleFileStatesSelector } from "../../../../stores/fileStore/fileStore.facade"
import { focusedNodePathSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { layoutAlgorithmSelector } from "../../../globalSettings/facade"
import {
    enableFloorLabelsSelector,
    invertAreaSelector,
    areaMetricSelector,
    marginSelector
} from "../../../../stores/mapState/mapState.read.facade"
import { DefaultProjectorFn, MemoizedSelector } from "@ngrx/store"
import { isDeltaStateSelector } from "../../../../stores/fileStore/fileStore.facade"

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
