import { UpdateAmountOfEdgePreviewsEffect } from "./amountOfEdgePreviews/updateAmountOfEdgePreviews.effect"
import { LinkColorMetricToHeightMetricEffect } from "./linkColorMetricToHeightMetric/linkColorMetricToHeightMetric.effect"
import { ResetColorRangeEffect } from "./resetColorRange/resetColorRange.effect"
import { UpdateEdgePreviewsEffect } from "./updateEdgePreviews/updateEdgePreviews.effect"
import { UpdateMapColorsEffect } from "./updateMapColors/updateMapColors.effect"

/**
 * The metricsBar feature's ngrx effects (edge previews + the user-driven metric reactions).
 * Registration order is behaviourally irrelevant.
 *
 * The metric SELECTION resets that used to live here (ResetChosenMetricsEffect,
 * ResetSelectedEdgeMetricWhenItDoesntExistAnymoreEffect, and ResetColorRangeEffect's file-driven
 * half) are owned by the post-load reconciliation sequence — see load/effects/reconcileAfterLoad.
 * What is left here reacts to what the USER does, not to what was loaded.
 */
export const metricsBarEffects = [
    ResetColorRangeEffect,
    UpdateMapColorsEffect,
    LinkColorMetricToHeightMetricEffect,
    UpdateEdgePreviewsEffect,
    UpdateAmountOfEdgePreviewsEffect
]
