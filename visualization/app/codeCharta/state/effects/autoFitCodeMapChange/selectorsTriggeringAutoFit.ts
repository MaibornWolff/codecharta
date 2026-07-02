import { visibleFileStatesSelector } from "../../../fileStore/store/visibleFileStates.selector"
import { focusedNodePathSelector } from "../../../sharedView/sharedView.facade"
import { layoutAlgorithmSelector } from "../../../features/globalSettings/facade"
import { enableFloorLabelsSelector, invertAreaSelector, areaMetricSelector } from "../../../mapState/mapState.facade"
import { marginSelector } from "../../../mapState/store/margin/margin.selector"
import { DefaultProjectorFn, MemoizedSelector } from "@ngrx/store"
import { isDeltaStateSelector } from "../../selectors/isDeltaState.selector"

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
