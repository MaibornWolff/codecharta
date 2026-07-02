import { visibleFileStatesSelector } from "../../../fileStore/store/visibleFileStates.selector"
import { focusedNodePathSelector } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.selector"
import { layoutAlgorithmSelector } from "../../../features/globalSettings/facade"
import { enableFloorLabelsSelector, invertAreaSelector } from "../../../mapState/mapState.facade"
import { marginSelector } from "../../store/dynamicSettings/margin/margin.selector"
import { DefaultProjectorFn, MemoizedSelector } from "@ngrx/store"
import { areaMetricSelector } from "../../store/dynamicSettings/areaMetric/areaMetric.selector"
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
