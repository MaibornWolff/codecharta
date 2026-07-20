import { createSelector } from "@ngrx/store"
import { WordCloudSettings } from "../../../model/wordCloud.model"
import { domainBarSelector } from "./domainBar.selector"

/** The domain bar's controls composed into the WordCloudSettings the renderer consumes. */
export const wordCloudSettingsSelector = createSelector(
    domainBarSelector,
    (domainBar): WordCloudSettings => ({
        shape: domainBar.shape,
        sizeRange: domainBar.sizeRange,
        rotationRange: domainBar.rotationRange,
        rotationStep: domainBar.rotationStep,
        gridSize: domainBar.gridSize,
        sizingMode: domainBar.sizingMode,
        topN: domainBar.topN,
        shrinkToFit: domainBar.shrinkToFit
    })
)
