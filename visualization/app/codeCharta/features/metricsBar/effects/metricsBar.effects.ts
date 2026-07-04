import { ResetChosenMetricsEffect } from "./resetChosenMetrics/resetChosenMetrics.effect"
import { ResetColorRangeEffect } from "./resetColorRange/resetColorRange.effect"
import { UpdateMapColorsEffect } from "./updateMapColors/updateMapColors.effect"
import { LinkColorMetricToHeightMetricEffect } from "./linkColorMetricToHeightMetric/linkColorMetricToHeightMetric.effect"
import { UpdateEdgePreviewsEffect } from "./updateEdgePreviews/updateEdgePreviews.effect"
import { UpdateAmountOfEdgePreviewsEffect } from "./amountOfEdgePreviews/updateAmountOfEdgePreviews.effect"
import { ResetSelectedEdgeMetricWhenItDoesntExistAnymoreEffect } from "./resetSelectedEdgeMetricWhenItDoesntExistAnymore/resetSelectedEdgeMetricWhenItDoesntExistAnymore.effect"

/**
 * The metricsBar feature's ngrx effects (metric-reactive resets + edge previews), registered by the
 * app composition root via this bundle (Slice 15c). Registration order is behaviourally irrelevant.
 */
export const metricsBarEffects = [
    ResetChosenMetricsEffect,
    ResetColorRangeEffect,
    UpdateMapColorsEffect,
    LinkColorMetricToHeightMetricEffect,
    UpdateEdgePreviewsEffect,
    UpdateAmountOfEdgePreviewsEffect,
    ResetSelectedEdgeMetricWhenItDoesntExistAnymoreEffect
]
