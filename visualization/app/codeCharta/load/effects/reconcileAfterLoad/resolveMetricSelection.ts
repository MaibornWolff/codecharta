import { EdgeMetricData, MapState, NodeMetricData } from "../../../model/codeCharta.model"
import { getDefaultDistribution } from "../../../util/metric/getDefaultDistributionMetric"
import { defaultNMetrics, isAnyMetricAvailable, preselectCombination } from "../../../util/metric/metricHelper"
import { NO_URL_METRICS, UrlMetricSelection } from "../../../util/queryParameter/queryParameter"

export type MetricSelection = Pick<MapState, "areaMetric" | "heightMetric" | "colorMetric" | "edgeMetric" | "distributionMetric">

/**
 * PRECEDENCE: URL > persisted (the current selection) > computed default.
 *
 * A candidate only wins if the metric it names actually EXISTS in the metric data derived from the
 * files that were just loaded. A URL metric naming a metric that the loaded files do not have is
 * dropped silently — no dialog, no error — and the next candidate in the chain wins.
 *
 * URL metrics are only honored when a ?file= parameter is present: without it the URL is not
 * written back either, so honoring ?area= on an IndexedDB boot would make the URL a one-way input.
 *
 * area/height/color resolve as a COMBINATION, not independently: if the resulting triple is not
 * fully available in the loaded map, the whole triple falls back to the computed default combination
 * and any valid URL name is then re-applied on top. This mirrors the all-or-nothing semantics of
 * areChosenMetricsAvailableSelector. edgeMetric resolves independently.
 *
 * `discardCurrentSelection` drops the middle candidate: a "reset map" deliberately throws the previous
 * selection away, so the computed default must win even though the old selection would still be valid.
 * The URL still beats the default.
 *
 * Returns null when the map carries no usable metric at all — nothing should be dispatched then.
 */
export function resolveMetricSelection(
    urlMetrics: UrlMetricSelection,
    current: MetricSelection,
    nodeMetricData: NodeMetricData[],
    edgeMetricData: EdgeMetricData[],
    hasFileQueryParameter: boolean,
    discardCurrentSelection = false
): MetricSelection | null {
    const nodeMetricNames = new Set(nodeMetricData.map(metric => metric.name))
    const edgeMetricNames = new Set(edgeMetricData.map(metric => metric.name))
    const isNodeMetric = (name: string | null) => Boolean(name) && nodeMetricNames.has(name)
    const isEdgeMetric = (name: string | null) => Boolean(name) && edgeMetricNames.has(name)

    const url = hasFileQueryParameter ? urlMetrics : NO_URL_METRICS

    // 1) The URL wins where it is valid; otherwise the persisted selection stands — unless this load
    //    discards it, in which case only the URL and the computed default remain.
    const persisted: MetricSelection = discardCurrentSelection
        ? { areaMetric: null, heightMetric: null, colorMetric: null, distributionMetric: null, edgeMetric: null }
        : current

    let areaMetric = isNodeMetric(url.areaMetric) ? url.areaMetric : persisted.areaMetric
    let heightMetric = isNodeMetric(url.heightMetric) ? url.heightMetric : persisted.heightMetric
    let colorMetric = isNodeMetric(url.colorMetric) ? url.colorMetric : persisted.colorMetric
    let distributionMetric = persisted.distributionMetric

    // 2) If that triple is not fully available in this map, fall back to the computed default
    //    combination — and let a valid url metric win over the computed value again.
    if (!(isNodeMetric(areaMetric) && isNodeMetric(heightMetric) && isNodeMetric(colorMetric))) {
        if (!isAnyMetricAvailable(nodeMetricData)) {
            return null
        }

        const [defaultArea, defaultHeight, defaultColor] = computeDefaultCombination(nodeMetricData)
        areaMetric = isNodeMetric(url.areaMetric) ? url.areaMetric : defaultArea
        heightMetric = isNodeMetric(url.heightMetric) ? url.heightMetric : defaultHeight
        colorMetric = isNodeMetric(url.colorMetric) ? url.colorMetric : defaultColor
        distributionMetric = getDefaultDistribution(nodeMetricData)
    }

    // 3) The edge metric, independently. It becomes undefined when the map has no edge metrics.
    let edgeMetric = persisted.edgeMetric
    if (isEdgeMetric(url.edgeMetric)) {
        edgeMetric = url.edgeMetric
    } else if (!isEdgeMetric(edgeMetric)) {
        edgeMetric = edgeMetricData[0]?.name
    }

    return { areaMetric, heightMetric, colorMetric, distributionMetric, edgeMetric }
}

function computeDefaultCombination(nodeMetricData: NodeMetricData[]): string[] {
    const combination = preselectCombination(nodeMetricData)
    const [areaMetric, heightMetric, colorMetric] = combination
    if (areaMetric && heightMetric && colorMetric) {
        return combination
    }
    return defaultNMetrics(nodeMetricData, 3)
}
