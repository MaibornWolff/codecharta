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
 * Order: metrics → colors → filters+labels → (camera handled separately)
 * Each patch is a separate dispatch so ngrx effects (e.g. resetColorRange)
 * triggered by earlier patches settle before subsequent ones override values.
 */
export function buildOrderedStatePatches(
    sections: ScenarioSections,
    selectedKeys: Set<ScenarioSectionKey>,
    metricData?: MetricData
): RecursivePartial<CcState>[] {
    return [
        selectedKeys.has("metrics") && sections.metrics ? buildMetricsPatch(sections, metricData) : undefined,
        selectedKeys.has("colors") && sections.colors ? buildColorsPatch(sections.colors) : undefined,
        buildFiltersAndLabelsPatch(sections, selectedKeys)
    ].filter((patch): patch is RecursivePartial<CcState> => patch !== undefined)
}

function buildFiltersAndLabelsPatch(
    sections: ScenarioSections,
    selectedKeys: Set<ScenarioSectionKey>
): RecursivePartial<CcState> | undefined {
    const filtersPatch = selectedKeys.has("filters") && sections.filters ? buildFiltersPatch(sections.filters) : undefined
    const labelsPatch =
        selectedKeys.has("labelsAndFolders") && sections.labelsAndFolders
            ? buildLabelsAndFoldersPatch(sections.labelsAndFolders)
            : undefined
    if (filtersPatch && labelsPatch) {
        return mergePatches(filtersPatch, labelsPatch)
    }
    return filtersPatch ?? labelsPatch
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
