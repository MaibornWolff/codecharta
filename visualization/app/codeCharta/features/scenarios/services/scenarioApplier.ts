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

    const available = metricData ? getAvailableMetricNames(metricData) : undefined
    const metrics: Record<string, string | undefined> = {}

    const nodeMetricKeys = ["areaMetric", "heightMetric", "colorMetric", "distributionMetric"] as const
    for (const key of nodeMetricKeys) {
        const value = sections.metrics[key]
        if (value !== undefined && (!available || available.nodeMetrics.has(value))) {
            metrics[key] = value
        }
    }

    const edgeMetric = sections.metrics.edgeMetric
    if (edgeMetric !== undefined && (!available || !edgeMetric || available.edgeMetrics.has(edgeMetric))) {
        metrics.edgeMetric = edgeMetric
    }

    const patch: RecursivePartial<CcState> = {}
    if (Object.keys(metrics).length > 0) {
        patch.dynamicSettings = { ...metrics }
    }
    if (sections.metrics.isColorMetricLinkedToHeightMetric !== undefined) {
        patch.appSettings = { isColorMetricLinkedToHeightMetric: sections.metrics.isColorMetricLinkedToHeightMetric }
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
    const phase3: RecursivePartial<CcState> = {}
    let hasPhase3 = false

    if (selectedKeys.has("filters") && sections.filters) {
        phase3.fileSettings = { blacklist: sections.filters.blacklist }
        phase3.dynamicSettings = { focusedNodePath: sections.filters.focusedNodePath }
        hasPhase3 = true
    }

    if (selectedKeys.has("labelsAndFolders") && sections.labelsAndFolders) {
        phase3.appSettings = {
            amountOfTopLabels: sections.labelsAndFolders.amountOfTopLabels,
            showMetricLabelNameValue: sections.labelsAndFolders.showMetricLabelNameValue,
            showMetricLabelNodeName: sections.labelsAndFolders.showMetricLabelNodeName,
            enableFloorLabels: sections.labelsAndFolders.enableFloorLabels,
            colorLabels: sections.labelsAndFolders.colorLabels
        }
        phase3.fileSettings = { ...phase3.fileSettings, markedPackages: sections.labelsAndFolders.markedPackages }
        hasPhase3 = true
    }

    if (hasPhase3) {
        patches.push(phase3)
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
