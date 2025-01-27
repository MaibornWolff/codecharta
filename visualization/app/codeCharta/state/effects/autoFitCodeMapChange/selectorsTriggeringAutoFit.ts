import { visibleFileStatesSelector } from "../../selectors/visibleFileStates/visibleFileStates.selector"
import { focusedNodePathSelector } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.selector"
import { layoutAlgorithmSelector } from "../../store/appSettings/layoutAlgorithm/layoutAlgorithm.selector"
import { invertAreaSelector } from "../../store/appSettings/invertArea/invertArea.selector"
import { marginSelector } from "../../store/dynamicSettings/margin/margin.selector"
import { DefaultProjectorFn, MemoizedSelector } from "@ngrx/store"
import { enableFloorLabelsSelector } from "../../store/appSettings/enableFloorLabels/enableFloorLabels.selector"
import { invertHeightSelector } from "../../store/appSettings/invertHeight/invertHeight.selector"
import { edgeHeightSelector } from "../../store/appSettings/edgeHeight/edgeHeight.selector"
import { scalingSelector } from "../../store/appSettings/scaling/scaling.selector"
import { areaMetricSelector } from "../../store/dynamicSettings/areaMetric/areaMetric.selector"
import { heightMetricSelector } from "../../store/dynamicSettings/heightMetric/heightMetric.selector"

export const selectorsTriggeringAutoFit: MemoizedSelector<any, any, DefaultProjectorFn<any>>[] = [
    visibleFileStatesSelector,
    focusedNodePathSelector,
    layoutAlgorithmSelector,
    invertAreaSelector,
    marginSelector,
    enableFloorLabelsSelector,
    invertHeightSelector,
    edgeHeightSelector,
    scalingSelector,
    areaMetricSelector,
    heightMetricSelector
    //TODO: update this list with all selectors that should trigger autoFit
]
