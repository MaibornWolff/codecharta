import { Vector3 } from "three"
import { RecursivePartial, CcState, MetricData } from "../../../codeCharta.model"
import { ColorsSection, FiltersSection, LabelsAndFoldersSection, ScenarioSectionKey, ScenarioSections } from "../model/scenario.model"

const NODE_METRIC_KEYS = ["areaMetric", "heightMetric", "colorMetric", "distributionMetric"] as const

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

    for (const key of NODE_METRIC_KEYS) {
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

function buildColorsPatch(colors: ColorsSection): RecursivePartial<CcState> {
    const dynamicSettings: RecursivePartial<CcState["dynamicSettings"]> = { colorRange: colors.colorRange }
    if (colors.colorMode !== undefined) {
        dynamicSettings.colorMode = colors.colorMode
    }
    const patch: RecursivePartial<CcState> = { dynamicSettings }
    if (colors.mapColors !== undefined) {
        patch.appSettings = { mapColors: colors.mapColors }
    }
    return patch
}

function buildFiltersPatch(filters: FiltersSection): RecursivePartial<CcState> {
    return {
        fileSettings: { blacklist: [...filters.blacklist] },
        dynamicSettings: { focusedNodePath: [...filters.focusedNodePath] }
    }
}

function buildLabelsAndFoldersPatch(labelsAndFolders: LabelsAndFoldersSection): RecursivePartial<CcState> {
    return {
        appSettings: {
            amountOfTopLabels: labelsAndFolders.amountOfTopLabels,
            showMetricLabelNameValue: labelsAndFolders.showMetricLabelNameValue,
            showMetricLabelNodeName: labelsAndFolders.showMetricLabelNodeName,
            enableFloorLabels: labelsAndFolders.enableFloorLabels,
            colorLabels: labelsAndFolders.colorLabels
        },
        fileSettings: { markedPackages: [...labelsAndFolders.markedPackages] }
    }
}

function mergePatches(a: RecursivePartial<CcState>, b: RecursivePartial<CcState>): RecursivePartial<CcState> {
    return {
        ...a,
        ...b,
        ...(a.appSettings || b.appSettings ? { appSettings: { ...a.appSettings, ...b.appSettings } } : {}),
        ...(a.dynamicSettings || b.dynamicSettings ? { dynamicSettings: { ...a.dynamicSettings, ...b.dynamicSettings } } : {}),
        ...(a.fileSettings || b.fileSettings ? { fileSettings: { ...a.fileSettings, ...b.fileSettings } } : {})
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
    if (selectedKeys.has("metrics") && sections.metrics) {
        patches.push(buildMetricsPatch(sections, metricData))
    }

    // Phase 2: Colors / thresholds (after metric effects have settled)
    if (selectedKeys.has("colors") && sections.colors) {
        patches.push(buildColorsPatch(sections.colors))
    }

    // Phase 3: Filters + Labels (merged into single patch)
    const phase3Parts: RecursivePartial<CcState>[] = []
    if (selectedKeys.has("filters") && sections.filters) {
        phase3Parts.push(buildFiltersPatch(sections.filters))
    }
    if (selectedKeys.has("labelsAndFolders") && sections.labelsAndFolders) {
        phase3Parts.push(buildLabelsAndFoldersPatch(sections.labelsAndFolders))
    }
    if (phase3Parts.length > 0) {
        patches.push(phase3Parts.reduce((a, b) => mergePatches(a, b), {} as RecursivePartial<CcState>))
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
