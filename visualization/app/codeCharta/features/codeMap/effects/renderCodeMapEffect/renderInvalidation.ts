import { Action } from "@ngrx/store"
import {
    invertColorRange,
    invertDeltaColors,
    setAmountOfEdgePreviews,
    setAmountOfTopLabels,
    setColorLabels,
    setColorMetric,
    setColorMode,
    setColorRange,
    setEdgeHeight,
    setEdgeMetric,
    setEnableFloorLabels,
    setGroupLabelCollisions,
    setIsWhiteBackground,
    setLabelMode,
    setLabelSize,
    setLabelsPerMap,
    setMapColors,
    setScaling,
    setShowIncomingEdges,
    setShowMetricLabelNameValue,
    setShowMetricLabelNodeName,
    setShowOutgoingEdges
} from "../../../../stores/mapState/mapState.write.facade"
import { markPackages, setMarkedPackages, unmarkPackage } from "../../../../stores/sharedView/sharedView.write.facade"

/**
 * Which stages of the render pipeline an action makes stale. Anything not listed in
 * `partialInvalidationByActionType` invalidates everything, so an unmapped action is slow rather
 * than wrong.
 */
export interface RenderInvalidation {
    /** Re-run the layout and refresh the building mesh. Node heights and footprints come from the
     *  layout, so every transform change needs it. */
    geometry: boolean
    /** Recompute building colours. Cheaper than `geometry`: it walks the nodes the last layout
     *  produced instead of laying them out again. */
    colors: boolean
    labels: boolean
    arrows: boolean
}

export const FULL_INVALIDATION: RenderInvalidation = Object.freeze({
    geometry: true,
    colors: true,
    labels: true,
    arrows: true
})

const partialInvalidationByActionType = new Map<string, Partial<RenderInvalidation>>([
    [setAmountOfTopLabels.type, { labels: true }],
    [setLabelSize.type, { labels: true }],
    [setLabelMode.type, { labels: true }],
    [setLabelsPerMap.type, { labels: true }],
    [setShowMetricLabelNodeName.type, { labels: true }],
    [setShowMetricLabelNameValue.type, { labels: true }],
    [setEnableFloorLabels.type, { labels: true }],
    [setGroupLabelCollisions.type, { labels: true }],

    [setEdgeMetric.type, { arrows: true }],
    [setEdgeHeight.type, { arrows: true }],
    [setAmountOfEdgePreviews.type, { arrows: true }],
    [setShowIncomingEdges.type, { arrows: true }],
    [setShowOutgoingEdges.type, { arrows: true }],

    [setColorMetric.type, { colors: true }],
    [setColorMode.type, { colors: true }],
    [setColorRange.type, { colors: true }],
    [setMapColors.type, { colors: true }],
    [invertColorRange.type, { colors: true }],
    [invertDeltaColors.type, { colors: true }],
    [setColorLabels.type, { colors: true }],
    [setIsWhiteBackground.type, { colors: true }],
    [setMarkedPackages.type, { colors: true }],
    [markPackages.type, { colors: true }],
    [unmarkPackage.type, { colors: true }],

    // The map is scaled as a whole group, so the buildings' own buffers stay valid.
    [setScaling.type, { labels: true, arrows: true }]
])

export function invalidationForAction(action: Action): RenderInvalidation {
    const partial = partialInvalidationByActionType.get(action.type)
    return partial ? propagate(partial) : { ...FULL_INVALIDATION }
}

/**
 * Labels sit on building tops and arrows join building positions, so anything that moves a building
 * makes both stale. Colour labels are picked per colour category, so a recolour makes labels stale
 * too.
 */
export function propagate(invalidation: Partial<RenderInvalidation>): RenderInvalidation {
    const geometry = invalidation.geometry === true
    const colors = geometry || invalidation.colors === true
    return {
        geometry,
        colors,
        labels: colors || invalidation.labels === true,
        arrows: geometry || invalidation.arrows === true
    }
}

export function mergeInvalidations(invalidations: RenderInvalidation[]): RenderInvalidation {
    return propagate({
        geometry: invalidations.some(({ geometry }) => geometry),
        colors: invalidations.some(({ colors }) => colors),
        labels: invalidations.some(({ labels }) => labels),
        arrows: invalidations.some(({ arrows }) => arrows)
    })
}
