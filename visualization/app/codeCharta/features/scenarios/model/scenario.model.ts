import { BlacklistItem, ColorMode, ColorRange, LabelMode, MapColors, MarkedPackage, ColorLabelOptions } from "../../../codeCharta.model"

export interface PlainPosition {
    readonly x: number
    readonly y: number
    readonly z: number
}

export interface MetricsSection {
    readonly areaMetric: string
    readonly heightMetric: string
    readonly colorMetric: string
    readonly edgeMetric?: string
    readonly distributionMetric?: string
    readonly isColorMetricLinkedToHeightMetric?: boolean
}

export interface ColorsSection {
    readonly colorRange: ColorRange
    readonly colorMode?: ColorMode
    readonly mapColors?: Partial<MapColors>
}

export interface CameraSection {
    readonly position: PlainPosition
    readonly target: PlainPosition
}

export interface FiltersSection {
    readonly blacklist: readonly BlacklistItem[]
    readonly focusedNodePath: readonly string[]
}

export interface LabelsAndFoldersSection {
    readonly amountOfTopLabels: number
    readonly showMetricLabelNameValue: boolean
    readonly showMetricLabelNodeName: boolean
    readonly enableFloorLabels: boolean
    readonly colorLabels: ColorLabelOptions
    readonly labelMode: LabelMode
    readonly groupLabelCollisions: boolean
    readonly markedPackages: readonly MarkedPackage[]
}

export type ScenarioSectionKey = "metrics" | "colors" | "camera" | "filters" | "labelsAndFolders"

export interface ScenarioSections {
    readonly metrics?: MetricsSection
    readonly colors?: ColorsSection
    readonly camera?: CameraSection
    readonly filters?: FiltersSection
    readonly labelsAndFolders?: LabelsAndFoldersSection
}

export interface Scenario {
    readonly id: string
    readonly name: string
    readonly description?: string
    readonly mapFileNames?: readonly string[]
    readonly createdAt: number
    readonly isBuiltIn?: boolean
    readonly sections: ScenarioSections
}

export function getAvailableSectionKeys(scenario: Scenario): ScenarioSectionKey[] {
    const allKeys: ScenarioSectionKey[] = ["metrics", "colors", "camera", "filters", "labelsAndFolders"]
    return allKeys.filter(key => scenario.sections[key] !== undefined)
}

export const SCENARIO_SECTION_LABELS: Record<ScenarioSectionKey, string> = {
    metrics: "Metrics",
    colors: "Colors",
    camera: "Camera",
    filters: "Filters",
    labelsAndFolders: "Labels & Folders"
}

export const SCENARIO_SECTION_ICONS: Record<ScenarioSectionKey, string> = {
    metrics: "fa-bar-chart",
    colors: "fa-paint-brush",
    camera: "fa-video-camera",
    filters: "fa-filter",
    labelsAndFolders: "fa-tags"
}

export const CCSCENARIO_EXTENSION = ".ccscenario"

export interface ScenarioFile {
    readonly schemaVersion: 1
    readonly name: string
    readonly description?: string
    readonly mapFileNames?: readonly string[]
    readonly sections: ScenarioSections
}

export function toScenarioFile(scenario: Scenario): ScenarioFile {
    return {
        schemaVersion: 1,
        name: scenario.name,
        ...(scenario.description ? { description: scenario.description } : {}),
        ...(scenario.mapFileNames?.length > 0 ? { mapFileNames: scenario.mapFileNames } : {}),
        sections: scenario.sections
    }
}

export function fromScenarioFile(file: ScenarioFile): Scenario {
    return {
        id: crypto.randomUUID(),
        name: file.name,
        description: file.description,
        mapFileNames: file.mapFileNames,
        createdAt: Date.now(),
        sections: file.sections
    }
}
