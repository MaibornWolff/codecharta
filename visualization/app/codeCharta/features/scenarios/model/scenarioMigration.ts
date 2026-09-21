import {
    ColorLabelOptions,
    ColorMode,
    ColorRange,
    ExcludedNode,
    LabelMode,
    MapColors,
    MarkedPackage
} from "../../../model/codeCharta.model"
import { SCENARIO_SCHEMA_VERSION, Scenario, ScenarioFile } from "./scenario.model"
import { PlainPosition, ScenarioSettings } from "./scenarioSettings.registry"

/**
 * Scenarios written before schema version 2 grouped their settings into five sections. They are
 * translated into the flat, per-setting shape when read from IndexedDB or imported from a file.
 * `distributionMetric` is dropped: no control sets it, so no reader could opt out of it.
 */
interface LegacyScenarioSections {
    readonly metrics?: {
        readonly areaMetric?: string
        readonly heightMetric?: string
        readonly colorMetric?: string
        readonly edgeMetric?: string
        readonly isColorMetricLinkedToHeightMetric?: boolean
    }
    readonly colors?: {
        readonly colorRange?: ColorRange
        readonly colorMode?: ColorMode
        readonly mapColors?: Partial<MapColors>
    }
    readonly camera?: {
        readonly position: PlainPosition
        readonly target: PlainPosition
    }
    readonly filters?: {
        readonly blacklist?: readonly (ExcludedNode & { type?: string })[]
        readonly focusedNodePath?: readonly string[]
    }
    readonly labelsAndFolders?: {
        readonly amountOfTopLabels?: number
        readonly labelSize?: number
        readonly showMetricLabelNameValue?: boolean
        readonly showMetricLabelNodeName?: boolean
        readonly enableFloorLabels?: boolean
        readonly colorLabels?: ColorLabelOptions
        readonly labelMode?: LabelMode
        readonly groupLabelCollisions?: boolean
        readonly markedPackages?: readonly MarkedPackage[]
    }
}

interface LegacyScenario extends Omit<Scenario, "settings"> {
    readonly sections?: LegacyScenarioSections
    readonly settings?: ScenarioSettings
}

interface LegacyScenarioFile extends Omit<ScenarioFile, "schemaVersion" | "settings"> {
    readonly schemaVersion: number
    readonly sections?: LegacyScenarioSections
    readonly settings?: ScenarioSettings
}

function toScenarioSettings(stored: { sections?: LegacyScenarioSections; settings?: ScenarioSettings }): ScenarioSettings {
    return stored.settings ? splitStoredNodeRules(stored.settings) : migrateLegacySections(stored.sections ?? {})
}

/**
 * A scenario written at schema 2 kept one `blacklist`, whose entries said what they did. Schema 3
 * keeps the two lists apart, so a stored one is split on the way in — dropping it would silently
 * lose the exclusions a saved scenario carries.
 */
function splitStoredNodeRules(settings: ScenarioSettings): ScenarioSettings {
    const stored = settings as ScenarioSettings & { blacklist?: readonly (ExcludedNode & { type?: string })[] }
    if (!stored.blacklist) {
        return settings
    }
    const { blacklist, ...withoutBlacklist } = stored
    return withoutAbsentSettings({
        ...withoutBlacklist,
        excludedNodes: blacklist.filter(rule => rule.type !== "flatten").map(({ path }) => ({ path })),
        flattenedNodes: blacklist.filter(rule => rule.type === "flatten").map(({ path }) => ({ path }))
    })
}

export function fromStoredScenario(stored: LegacyScenario): Scenario {
    const { sections, ...scenario } = stored
    return { ...scenario, settings: toScenarioSettings(stored) }
}

/** Every schema this build can still read, migrating it forward as it goes. */
const ACCEPTED_SCHEMA_VERSIONS = new Set([1, 2, SCENARIO_SCHEMA_VERSION])

export function parseScenarioFile(raw: unknown): ScenarioFile | undefined {
    const file = raw as LegacyScenarioFile
    if (!file?.name || !ACCEPTED_SCHEMA_VERSIONS.has(file.schemaVersion)) {
        return undefined
    }
    if (!file.sections && !file.settings) {
        return undefined
    }
    return {
        schemaVersion: SCENARIO_SCHEMA_VERSION,
        name: file.name,
        description: file.description,
        mapFileNames: file.mapFileNames,
        settings: toScenarioSettings(file)
    }
}

function migrateLegacySections(sections: LegacyScenarioSections): ScenarioSettings {
    const { metrics, colors, camera, filters, labelsAndFolders } = sections
    const { outgoingEdge, incomingEdge, ...bandColors } = colors?.mapColors ?? {}
    const hasEdgeColors = outgoingEdge !== undefined || incomingEdge !== undefined

    return withoutAbsentSettings({
        areaMetric: metrics?.areaMetric,
        enableFloorLabels: labelsAndFolders?.enableFloorLabels,
        heightMetric: metrics?.heightMetric,
        colorMetric: metrics?.colorMetric,
        isColorMetricLinkedToHeightMetric: metrics?.isColorMetricLinkedToHeightMetric,
        colorRange: colors?.colorRange,
        colorMode: colors?.colorMode,
        mapColors: Object.keys(bandColors).length > 0 ? bandColors : undefined,
        markedPackages: labelsAndFolders?.markedPackages,
        edgeMetric: metrics?.edgeMetric,
        edgeColors: hasEdgeColors ? { outgoingEdge, incomingEdge } : undefined,
        amountOfTopLabels: labelsAndFolders?.amountOfTopLabels,
        labelSize: labelsAndFolders?.labelSize,
        labelMode: labelsAndFolders?.labelMode,
        showMetricLabelNodeName: labelsAndFolders?.showMetricLabelNodeName,
        showMetricLabelNameValue: labelsAndFolders?.showMetricLabelNameValue,
        groupLabelCollisions: labelsAndFolders?.groupLabelCollisions,
        colorLabels: labelsAndFolders?.colorLabels,
        camera,
        excludedNodes: filters?.blacklist?.filter(rule => rule.type !== "flatten"),
        flattenedNodes: filters?.blacklist?.filter(rule => rule.type === "flatten"),
        focusedNodePath: filters?.focusedNodePath
    })
}

function withoutAbsentSettings(settings: ScenarioSettings): ScenarioSettings {
    return Object.fromEntries(Object.entries(settings).filter(([, value]) => value !== undefined)) as ScenarioSettings
}
