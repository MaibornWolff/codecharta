import { visibleFileStatesSelector } from "../../../../fileStore/store/visibleFileStates.selector"
import { focusedNodePathSelector } from "../../../../sharedView/sharedView.read.facade"
import { layoutAlgorithmSelector } from "../../../globalSettings/facade"
import { enableFloorLabelsSelector, invertAreaSelector, areaMetricSelector } from "../../../../mapState/mapState.read.facade"
import { marginSelector } from "../../../../mapState/store/margin/margin.selector"
import { DefaultProjectorFn, MemoizedSelector } from "@ngrx/store"
import { isDeltaStateSelector } from "../../../../fileStore/store/isDeltaState.selector"

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
