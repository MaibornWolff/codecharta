import { createSelector } from "@ngrx/store"
import { WordCloudSettings } from "../../../model/wordCloud.model"
import { domainStateSelector } from "./domainState.selector"

export const wordCloudSettingsSelector = createSelector(
    domainStateSelector,
    (domainState): WordCloudSettings => ({
        shape: domainState.shape,
        sizeRange: domainState.sizeRange,
        rotationRange: domainState.rotationRange,
        rotationStep: domainState.rotationStep,
        gridSize: domainState.gridSize,
        sizingMode: domainState.sizingMode,
        topN: domainState.topN,
        shrinkToFit: domainState.shrinkToFit,
        drawOutOfBound: domainState.drawOutOfBound
    })
)
