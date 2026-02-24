import { Vector3 } from "three"
import { RecursivePartial, CcState, MetricData } from "../../../codeCharta.model"
import { ScenarioSectionKey, ScenarioSections } from "../model/scenario.model"

export function getAvailableMetricNames(metricData: MetricData): { nodeMetrics: Set<string>; edgeMetrics: Set<string> } {
    return {
        nodeMetrics: new Set(metricData.nodeMetricData.map(m => m.name)),
        edgeMetrics: new Set(metricData.edgeMetricData.map(m => m.name))
    }
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
    if (selectedKeys.has("metrics")) {
        const patch: RecursivePartial<CcState> = {}
        const available = metricData ? getAvailableMetricNames(metricData) : undefined
        const metrics: Record<string, string | undefined> = {}

        if (!available || available.nodeMetrics.has(sections.metrics.areaMetric)) {
            metrics.areaMetric = sections.metrics.areaMetric
        }
        if (!available || available.nodeMetrics.has(sections.metrics.heightMetric)) {
            metrics.heightMetric = sections.metrics.heightMetric
        }
        if (!available || available.nodeMetrics.has(sections.metrics.colorMetric)) {
            metrics.colorMetric = sections.metrics.colorMetric
        }
        if (!available || available.nodeMetrics.has(sections.metrics.distributionMetric)) {
            metrics.distributionMetric = sections.metrics.distributionMetric
        }
        if (!available || !sections.metrics.edgeMetric || available.edgeMetrics.has(sections.metrics.edgeMetric)) {
            metrics.edgeMetric = sections.metrics.edgeMetric
        }

        if (Object.keys(metrics).length > 0) {
            patch.dynamicSettings = { ...metrics }
        }
        patch.appSettings = { isColorMetricLinkedToHeightMetric: sections.metrics.isColorMetricLinkedToHeightMetric }
        patches.push(patch)
    }

    // Phase 2: Colors / thresholds (after metric effects have settled)
    if (selectedKeys.has("colors")) {
        patches.push({
            dynamicSettings: {
                colorRange: sections.colors.colorRange,
                colorMode: sections.colors.colorMode
            },
            appSettings: {
                mapColors: sections.colors.mapColors
            }
        })
    }

    // Phase 3: Filters + Labels
    const phase3: RecursivePartial<CcState> = {}
    let hasPhase3 = false

    if (selectedKeys.has("filters")) {
        phase3.fileSettings = { blacklist: sections.filters.blacklist }
        phase3.dynamicSettings = { focusedNodePath: sections.filters.focusedNodePath }
        hasPhase3 = true
    }

    if (selectedKeys.has("labelsAndFolders")) {
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

export function getCameraVectors(sections: ScenarioSections): { position: Vector3; target: Vector3 } {
    const { position, target } = sections.camera
    return {
        position: new Vector3(position.x, position.y, position.z),
        target: new Vector3(target.x, target.y, target.z)
    }
}
