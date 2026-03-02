import { Vector3 } from "three"
import { RecursivePartial, CcState, MetricData } from "../../../codeCharta.model"
import { ScenarioSectionKey, ScenarioSections } from "../model/scenario.model"

export function getAvailableMetricNames(metricData: MetricData): { nodeMetrics: Set<string>; edgeMetrics: Set<string> } {
    return {
        nodeMetrics: new Set(metricData.nodeMetricData.map(m => m.name)),
        edgeMetrics: new Set(metricData.edgeMetricData.map(m => m.name))
    }
}

function buildMetricsPatch(sections: ScenarioSections, metricData?: MetricData): RecursivePartial<CcState> {
    if (!sections.metrics) {
        return {}
    }

    const availableMetricNames = metricData ? getAvailableMetricNames(metricData) : undefined
    const metricOverrides: Record<string, string | undefined> = {}

    const nodeMetricKeys = ["areaMetric", "heightMetric", "colorMetric", "distributionMetric"] as const
    for (const key of nodeMetricKeys) {
        const value = sections.metrics[key]
        if (value !== undefined && (!availableMetricNames || availableMetricNames.nodeMetrics.has(value))) {
            metricOverrides[key] = value
        }
    }

    const edgeMetric = sections.metrics.edgeMetric
    if (edgeMetric !== undefined && (!availableMetricNames || !edgeMetric || availableMetricNames.edgeMetrics.has(edgeMetric))) {
        metricOverrides.edgeMetric = edgeMetric
    }

    const hasMetricOverrides = Object.keys(metricOverrides).length > 0
    if (!hasMetricOverrides && sections.metrics.isColorMetricLinkedToHeightMetric === undefined) {
        return {}
    }

    const patch: RecursivePartial<CcState> = {}
    if (hasMetricOverrides) {
        patch.dynamicSettings = { ...metricOverrides }
        if (sections.metrics.isColorMetricLinkedToHeightMetric !== undefined) {
            patch.appSettings = { isColorMetricLinkedToHeightMetric: sections.metrics.isColorMetricLinkedToHeightMetric }
        }
    }
    return patch
}

/**
 * Builds ordered state patches to dispatch sequentially.
 * Order: metrics → colors/thresholds → filters + labels → (camera handled separately)
 * This ensures effects triggered by metric changes (e.g. resetColorRange, updateMapColors)
 * settle before we apply the desired thresholds and colors.
 */
export function buildOrderedStatePatches(
    sections: ScenarioSections,
    selectedKeys: Set<ScenarioSectionKey>,
    metricData?: MetricData
): RecursivePartial<CcState>[] {
    const patches: RecursivePartial<CcState>[] = []

    // Phase 1: Metrics
    if (selectedKeys.has("metrics") && sections.metrics) {
        patches.push(buildMetricsPatch(sections, metricData))
    }

    // Phase 2: Colors / thresholds (after metric effects have settled)
    if (selectedKeys.has("colors") && sections.colors) {
        const dynamicSettings: RecursivePartial<CcState["dynamicSettings"]> = { colorRange: sections.colors.colorRange }
        if (sections.colors.colorMode !== undefined) {
            dynamicSettings.colorMode = sections.colors.colorMode
        }
        const colorPatch: RecursivePartial<CcState> = { dynamicSettings }
        if (sections.colors.mapColors !== undefined) {
            colorPatch.appSettings = { mapColors: sections.colors.mapColors }
        }
        patches.push(colorPatch)
    }

    // Phase 3: Filters + Labels
    const filtersAndLabelsPatch: RecursivePartial<CcState> = {}
    let hasFiltersOrLabels = false

    if (selectedKeys.has("filters") && sections.filters) {
        filtersAndLabelsPatch.fileSettings = { blacklist: [...sections.filters.blacklist] }
        filtersAndLabelsPatch.dynamicSettings = { focusedNodePath: [...sections.filters.focusedNodePath] }
        hasFiltersOrLabels = true
    }

    if (selectedKeys.has("labelsAndFolders") && sections.labelsAndFolders) {
        filtersAndLabelsPatch.appSettings = {
            amountOfTopLabels: sections.labelsAndFolders.amountOfTopLabels,
            showMetricLabelNameValue: sections.labelsAndFolders.showMetricLabelNameValue,
            showMetricLabelNodeName: sections.labelsAndFolders.showMetricLabelNodeName,
            enableFloorLabels: sections.labelsAndFolders.enableFloorLabels,
            colorLabels: sections.labelsAndFolders.colorLabels
        }
        filtersAndLabelsPatch.fileSettings = {
            ...filtersAndLabelsPatch.fileSettings,
            markedPackages: [...sections.labelsAndFolders.markedPackages]
        }
        hasFiltersOrLabels = true
    }

    if (hasFiltersOrLabels) {
        patches.push(filtersAndLabelsPatch)
    }

    return patches
}

export function getCameraVectors(sections: ScenarioSections): { position: Vector3; target: Vector3 } | undefined {
    if (!sections.camera) {
        return undefined
    }
    const { position, target } = sections.camera
    return {
        position: new Vector3(position.x, position.y, position.z),
        target: new Vector3(target.x, target.y, target.z)
    }
}
