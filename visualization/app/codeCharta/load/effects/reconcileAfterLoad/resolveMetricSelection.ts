import { EdgeMetricData, MapState, NodeMetricData } from "../../../model/codeCharta.model"
import { getDefaultDistribution } from "../../../util/metric/getDefaultDistributionMetric"
import { defaultNMetrics, isAnyMetricAvailable, preselectCombination } from "../../../util/metric/metricHelper"
import { NO_URL_METRICS, UrlMetricSelection } from "../../../util/queryParameter/queryParameter"

export type MetricSelection = Pick<MapState, "areaMetric" | "heightMetric" | "colorMetric" | "edgeMetric" | "distributionMetric">

/**
 * Resolves the metric selection for freshly loaded files with precedence URL > current selection >
 * computed default. A candidate only wins if the metric it names exists in the loaded files;
 * an unavailable candidate is dropped silently — no dialog, no error.
 *
 * Returns null when the map carries no usable node metric at all — nothing should be dispatched then.
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
    const isAvailableNodeMetric = (name: string | null) => Boolean(name) && nodeMetricNames.has(name)
    const isAvailableEdgeMetric = (name: string | null) => Boolean(name) && edgeMetricNames.has(name)

    // Without ?file= the URL is never written back, so honoring its metrics would make the URL a one-way input.
    const applicableUrlMetrics = hasFileQueryParameter ? urlMetrics : NO_URL_METRICS

    // A "reset map" deliberately throws the previous selection away: the computed default must win over it
    // even though it might still be valid. The URL still beats the default.
    const baseSelection: MetricSelection = discardCurrentSelection
        ? { areaMetric: null, heightMetric: null, colorMetric: null, distributionMetric: null, edgeMetric: null }
        : current

    const nodeMetricSelection = resolveNodeMetricSelection(applicableUrlMetrics, baseSelection, nodeMetricData, isAvailableNodeMetric)
    if (nodeMetricSelection === null) {
        return null
    }

    let edgeMetric = baseSelection.edgeMetric
    if (isAvailableEdgeMetric(applicableUrlMetrics.edgeMetric)) {
        edgeMetric = applicableUrlMetrics.edgeMetric
    } else if (!isAvailableEdgeMetric(edgeMetric)) {
        edgeMetric = edgeMetricData[0]?.name
    }

    return { ...nodeMetricSelection, edgeMetric }
}

type NodeMetricSelection = Pick<MetricSelection, "areaMetric" | "heightMetric" | "colorMetric" | "distributionMetric">

/**
 * area/height/color resolve as an all-or-nothing combination, mirroring the semantics of
 * areChosenMetricsAvailableSelector: if the resolved combination is not fully available in the loaded
 * map, all three fall back to the computed default and valid URL metrics are re-applied on top.
 */
function resolveNodeMetricSelection(
    urlMetrics: UrlMetricSelection,
    baseSelection: MetricSelection,
    nodeMetricData: NodeMetricData[],
    isAvailableNodeMetric: (name: string | null) => boolean
): NodeMetricSelection | null {
    const areaMetric = isAvailableNodeMetric(urlMetrics.areaMetric) ? urlMetrics.areaMetric : baseSelection.areaMetric
    const heightMetric = isAvailableNodeMetric(urlMetrics.heightMetric) ? urlMetrics.heightMetric : baseSelection.heightMetric
    const colorMetric = isAvailableNodeMetric(urlMetrics.colorMetric) ? urlMetrics.colorMetric : baseSelection.colorMetric

    if (isAvailableNodeMetric(areaMetric) && isAvailableNodeMetric(heightMetric) && isAvailableNodeMetric(colorMetric)) {
        return { areaMetric, heightMetric, colorMetric, distributionMetric: baseSelection.distributionMetric }
    }

    if (!isAnyMetricAvailable(nodeMetricData)) {
        return null
    }

    const [defaultArea, defaultHeight, defaultColor] = computeDefaultCombination(nodeMetricData)
    return {
        areaMetric: isAvailableNodeMetric(urlMetrics.areaMetric) ? urlMetrics.areaMetric : defaultArea,
        heightMetric: isAvailableNodeMetric(urlMetrics.heightMetric) ? urlMetrics.heightMetric : defaultHeight,
        colorMetric: isAvailableNodeMetric(urlMetrics.colorMetric) ? urlMetrics.colorMetric : defaultColor,
        distributionMetric: getDefaultDistribution(nodeMetricData)
    }
}

function computeDefaultCombination(nodeMetricData: NodeMetricData[]): string[] {
    const combination = preselectCombination(nodeMetricData)
    const [areaMetric, heightMetric, colorMetric] = combination
    if (areaMetric && heightMetric && colorMetric) {
        return combination
    }
    return defaultNMetrics(nodeMetricData, 3)
}
