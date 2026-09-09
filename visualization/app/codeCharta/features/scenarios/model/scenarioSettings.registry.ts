import {
    BlacklistItem,
    CcState,
    ColorLabelOptions,
    ColorMode,
    ColorRange,
    LabelMode,
    MapColors,
    MarkedPackage,
    RecursivePartial
} from "../../../model/codeCharta.model"

export interface PlainPosition {
    readonly x: number
    readonly y: number
    readonly z: number
}

export interface ScenarioCamera {
    readonly position: PlainPosition
    readonly target: PlainPosition
}

export type ScenarioBandColors = Partial<Omit<MapColors, "outgoingEdge" | "incomingEdge">>

interface ScenarioEdgeColors {
    readonly outgoingEdge?: string
    readonly incomingEdge?: string
}

export interface ScenarioSettings {
    readonly areaMetric?: string
    readonly margin?: number
    readonly invertArea?: boolean
    readonly enableFloorLabels?: boolean
    readonly heightMetric?: string
    readonly heightScaling?: number
    readonly invertHeight?: boolean
    readonly colorMetric?: string
    readonly isColorMetricLinkedToHeightMetric?: boolean
    readonly colorRange?: ColorRange
    readonly colorMode?: ColorMode
    readonly mapColors?: ScenarioBandColors
    readonly markedPackages?: readonly MarkedPackage[]
    readonly edgeMetric?: string
    readonly isEdgeMetricVisible?: boolean
    readonly amountOfEdgePreviews?: number
    readonly edgeHeight?: number
    readonly showOutgoingEdges?: boolean
    readonly showIncomingEdges?: boolean
    readonly showOnlyBuildingsWithEdges?: boolean
    readonly edgeColors?: ScenarioEdgeColors
    readonly amountOfTopLabels?: number
    readonly labelsPerMap?: boolean
    readonly labelSize?: number
    readonly labelMode?: LabelMode
    readonly showMetricLabelNodeName?: boolean
    readonly showMetricLabelNameValue?: boolean
    readonly groupLabelCollisions?: boolean
    readonly colorLabels?: ColorLabelOptions
    readonly camera?: ScenarioCamera
    readonly blacklist?: readonly BlacklistItem[]
    readonly focusedNodePath?: readonly string[]
}

export type ScenarioSettingKey = keyof ScenarioSettings

export type ScenarioGroupKey = "area" | "height" | "color" | "edge" | "labels" | "camera" | "filters"

export interface ScenarioSettingsSource {
    readonly state: CcState
    readonly camera: ScenarioCamera
}

interface ScenarioSettingDefinition<Key extends ScenarioSettingKey> {
    readonly group: ScenarioGroupKey
    readonly label: string
    /** Names a metric, so it is left out when the current map does not have that metric. */
    readonly isMetricSelection?: boolean
    /**
     * Applied in the first of the two patches, ahead of the settings that effects derive from it:
     * a metric selection, or the link that makes an effect re-select the color metric — which in
     * turn re-derives the color range a scenario may carry.
     */
    readonly isAppliedFirst?: boolean
    readonly read: (source: ScenarioSettingsSource) => ScenarioSettings[Key]
    /** Absent for the camera, which the camera services move instead of the store. */
    readonly patch?: (settings: ScenarioSettings) => RecursivePartial<CcState>
}

type ScenarioSettingRegistry = { readonly [Key in ScenarioSettingKey]: ScenarioSettingDefinition<Key> }

/** The declaration order is the order the picker lists settings in. */
export const SCENARIO_SETTINGS: ScenarioSettingRegistry = {
    areaMetric: {
        group: "area",
        label: "Area metric",
        isMetricSelection: true,
        isAppliedFirst: true,
        read: source => source.state.mapState.areaMetric,
        patch: settings => ({ mapState: { areaMetric: settings.areaMetric } })
    },
    margin: {
        group: "area",
        label: "Margin",
        read: source => source.state.mapState.margin,
        patch: settings => ({ mapState: { margin: settings.margin } })
    },
    invertArea: {
        group: "area",
        label: "Invert area",
        read: source => source.state.mapState.invertArea,
        patch: settings => ({ mapState: { invertArea: settings.invertArea } })
    },
    enableFloorLabels: {
        group: "area",
        label: "Floor labels",
        read: source => source.state.mapState.enableFloorLabels,
        patch: settings => ({ mapState: { enableFloorLabels: settings.enableFloorLabels } })
    },
    heightMetric: {
        group: "height",
        label: "Height metric",
        isMetricSelection: true,
        isAppliedFirst: true,
        read: source => source.state.mapState.heightMetric,
        patch: settings => ({ mapState: { heightMetric: settings.heightMetric } })
    },
    heightScaling: {
        group: "height",
        label: "Height scaling",
        read: source => source.state.mapState.scaling.y,
        patch: settings => ({ mapState: { scaling: { y: settings.heightScaling } } })
    },
    invertHeight: {
        group: "height",
        label: "Invert height",
        read: source => source.state.mapState.invertHeight,
        patch: settings => ({ mapState: { invertHeight: settings.invertHeight } })
    },
    colorMetric: {
        group: "color",
        label: "Color metric",
        isMetricSelection: true,
        isAppliedFirst: true,
        read: source => source.state.mapState.colorMetric,
        patch: settings => ({ mapState: { colorMetric: settings.colorMetric } })
    },
    isColorMetricLinkedToHeightMetric: {
        group: "color",
        label: "Color follows height metric",
        isAppliedFirst: true,
        read: source => source.state.preferences.isColorMetricLinkedToHeightMetric,
        patch: settings => ({ preferences: { isColorMetricLinkedToHeightMetric: settings.isColorMetricLinkedToHeightMetric } })
    },
    colorRange: {
        group: "color",
        label: "Color range",
        read: source => ({ ...source.state.mapState.colorRange }),
        patch: settings => ({ mapState: { colorRange: settings.colorRange } })
    },
    colorMode: {
        group: "color",
        label: "Gradient mode",
        read: source => source.state.mapState.colorMode,
        patch: settings => ({ mapState: { colorMode: settings.colorMode } })
    },
    mapColors: {
        group: "color",
        label: "Colors",
        read: source => readBandColors(source.state.mapState.mapColors),
        patch: settings => ({ mapState: { mapColors: settings.mapColors } })
    },
    markedPackages: {
        group: "color",
        label: "Folder color overrides",
        read: source => [...source.state.sharedView.markedPackages],
        patch: settings => ({ sharedView: { markedPackages: [...settings.markedPackages] } })
    },
    edgeMetric: {
        group: "edge",
        label: "Edge metric",
        isMetricSelection: true,
        isAppliedFirst: true,
        read: source => source.state.mapState.edgeMetric,
        patch: settings => ({ mapState: { edgeMetric: settings.edgeMetric } })
    },
    isEdgeMetricVisible: {
        group: "edge",
        label: "Edge metric enabled",
        read: source => source.state.mapState.isEdgeMetricVisible,
        patch: settings => ({ mapState: { isEdgeMetricVisible: settings.isEdgeMetricVisible } })
    },
    amountOfEdgePreviews: {
        group: "edge",
        label: "Edge previews",
        read: source => source.state.mapState.amountOfEdgePreviews,
        patch: settings => ({ mapState: { amountOfEdgePreviews: settings.amountOfEdgePreviews } })
    },
    edgeHeight: {
        group: "edge",
        label: "Edge curve height",
        read: source => source.state.mapState.edgeHeight,
        patch: settings => ({ mapState: { edgeHeight: settings.edgeHeight } })
    },
    showOutgoingEdges: {
        group: "edge",
        label: "Show outgoing edges",
        read: source => source.state.mapState.showOutgoingEdges,
        patch: settings => ({ mapState: { showOutgoingEdges: settings.showOutgoingEdges } })
    },
    showIncomingEdges: {
        group: "edge",
        label: "Show incoming edges",
        read: source => source.state.mapState.showIncomingEdges,
        patch: settings => ({ mapState: { showIncomingEdges: settings.showIncomingEdges } })
    },
    showOnlyBuildingsWithEdges: {
        group: "edge",
        label: "Only nodes with edges",
        read: source => source.state.mapState.showOnlyBuildingsWithEdges,
        patch: settings => ({ mapState: { showOnlyBuildingsWithEdges: settings.showOnlyBuildingsWithEdges } })
    },
    edgeColors: {
        group: "edge",
        label: "Edge colors",
        read: source => ({
            outgoingEdge: source.state.mapState.mapColors.outgoingEdge,
            incomingEdge: source.state.mapState.mapColors.incomingEdge
        }),
        patch: settings => ({ mapState: { mapColors: { ...settings.edgeColors } } })
    },
    amountOfTopLabels: {
        group: "labels",
        label: "Top labels",
        read: source => source.state.mapState.amountOfTopLabels,
        patch: settings => ({ mapState: { amountOfTopLabels: settings.amountOfTopLabels } })
    },
    labelsPerMap: {
        group: "labels",
        label: "Top labels scope",
        read: source => source.state.mapState.labelsPerMap,
        patch: settings => ({ mapState: { labelsPerMap: settings.labelsPerMap } })
    },
    labelSize: {
        group: "labels",
        label: "Label size",
        read: source => source.state.mapState.labelSize,
        patch: settings => ({ mapState: { labelSize: settings.labelSize } })
    },
    labelMode: {
        group: "labels",
        label: "Label mode",
        read: source => source.state.mapState.labelMode,
        patch: settings => ({ mapState: { labelMode: settings.labelMode } })
    },
    showMetricLabelNodeName: {
        group: "labels",
        label: "Show node names",
        read: source => source.state.mapState.showMetricLabelNodeName,
        patch: settings => ({ mapState: { showMetricLabelNodeName: settings.showMetricLabelNodeName } })
    },
    showMetricLabelNameValue: {
        group: "labels",
        label: "Show metric values",
        read: source => source.state.mapState.showMetricLabelNameValue,
        patch: settings => ({ mapState: { showMetricLabelNameValue: settings.showMetricLabelNameValue } })
    },
    groupLabelCollisions: {
        group: "labels",
        label: "Group overlapping labels",
        read: source => source.state.mapState.groupLabelCollisions,
        patch: settings => ({ mapState: { groupLabelCollisions: settings.groupLabelCollisions } })
    },
    colorLabels: {
        group: "labels",
        label: "Labels by color metric",
        read: source => ({ ...source.state.mapState.colorLabels }),
        patch: settings => ({ mapState: { colorLabels: settings.colorLabels } })
    },
    camera: {
        group: "camera",
        label: "Position and zoom",
        read: source => ({ position: { ...source.camera.position }, target: { ...source.camera.target } })
    },
    blacklist: {
        group: "filters",
        label: "Excluded and hidden nodes",
        read: source => [...source.state.sharedView.blacklist],
        patch: settings => ({ sharedView: { blacklist: [...settings.blacklist] } })
    },
    focusedNodePath: {
        group: "filters",
        label: "Focused folder",
        read: source => [...source.state.sharedView.focusedNodePath],
        patch: settings => ({ sharedView: { focusedNodePath: [...settings.focusedNodePath] } })
    }
}

function readBandColors(mapColors: MapColors): ScenarioBandColors {
    const { outgoingEdge, incomingEdge, ...bandColors } = mapColors
    return bandColors
}

export const SCENARIO_SETTING_KEYS = Object.keys(SCENARIO_SETTINGS) as ScenarioSettingKey[]

/** Declaration order is display order, and the record's type keeps the groups exhaustive. */
export const SCENARIO_GROUP_LABELS: Record<ScenarioGroupKey, string> = {
    area: "Area",
    height: "Height",
    color: "Color",
    edge: "Edges",
    labels: "Labels",
    camera: "Camera",
    filters: "Filters"
}

export const SCENARIO_GROUP_KEYS = Object.keys(SCENARIO_GROUP_LABELS) as ScenarioGroupKey[]

export const SCENARIO_GROUP_ICONS: Record<ScenarioGroupKey, string> = {
    area: "fa-th-large",
    height: "fa-bar-chart",
    color: "fa-paint-brush",
    edge: "fa-share-alt",
    labels: "fa-tags",
    camera: "fa-video-camera",
    filters: "fa-filter"
}

export type ScenarioMetricSelectionKey = "areaMetric" | "heightMetric" | "colorMetric" | "edgeMetric"

export function isMetricSelectionKey(key: ScenarioSettingKey): key is ScenarioMetricSelectionKey {
    return Boolean(SCENARIO_SETTINGS[key].isMetricSelection)
}

export const METRIC_SELECTION_SETTING_KEYS = SCENARIO_SETTING_KEYS.filter(isMetricSelectionKey)

export function isAppliedFirst(key: ScenarioSettingKey): boolean {
    return Boolean(SCENARIO_SETTINGS[key].isAppliedFirst)
}

export function getSettingKeysOfGroup(group: ScenarioGroupKey): ScenarioSettingKey[] {
    return SCENARIO_SETTING_KEYS.filter(key => SCENARIO_SETTINGS[key].group === group)
}

export function pickScenarioSettings(settings: ScenarioSettings, keys: ReadonlySet<ScenarioSettingKey>): ScenarioSettings {
    return Object.fromEntries(Object.entries(settings).filter(([key]) => keys.has(key as ScenarioSettingKey))) as ScenarioSettings
}

export function readScenarioSettings(source: ScenarioSettingsSource, selectedKeys: ReadonlySet<ScenarioSettingKey>): ScenarioSettings {
    const settings: Record<string, unknown> = {}
    for (const key of SCENARIO_SETTING_KEYS) {
        if (!selectedKeys.has(key)) {
            continue
        }
        const value = SCENARIO_SETTINGS[key].read(source)
        if (value !== undefined) {
            settings[key] = value
        }
    }
    return settings as ScenarioSettings
}
