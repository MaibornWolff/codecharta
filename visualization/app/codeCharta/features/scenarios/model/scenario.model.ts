import { BlacklistItem, ColorMode, ColorRange, MapColors, MarkedPackage, ColorLabelOptions } from "../../../codeCharta.model"

export interface PlainPosition {
    x: number
    y: number
    z: number
}

export interface MetricsSection {
    areaMetric: string
    heightMetric: string
    colorMetric: string
    edgeMetric?: string
    distributionMetric?: string
    isColorMetricLinkedToHeightMetric?: boolean
}

export interface ColorsSection {
    colorRange: ColorRange
    colorMode?: ColorMode
    mapColors?: Partial<MapColors>
}

export interface CameraSection {
    position: PlainPosition
    target: PlainPosition
}

export interface FiltersSection {
    blacklist: BlacklistItem[]
    focusedNodePath: string[]
}

export interface LabelsAndFoldersSection {
    amountOfTopLabels: number
    showMetricLabelNameValue: boolean
    showMetricLabelNodeName: boolean
    enableFloorLabels: boolean
    colorLabels: ColorLabelOptions
    markedPackages: MarkedPackage[]
}

export type ScenarioSectionKey = "metrics" | "colors" | "camera" | "filters" | "labelsAndFolders"

export interface ScenarioSections {
    metrics?: MetricsSection
    colors?: ColorsSection
    camera?: CameraSection
    filters?: FiltersSection
    labelsAndFolders?: LabelsAndFoldersSection
}

export interface Scenario {
    id: string
    name: string
    description?: string
    mapFileNames?: string[]
    createdAt: number
    isBuiltIn?: boolean
    sections: ScenarioSections
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
    schemaVersion: 1
    name: string
    description?: string
    mapFileNames?: string[]
    sections: ScenarioSections
}

export function toScenarioFile(scenario: Scenario): ScenarioFile {
    const file: ScenarioFile = {
        schemaVersion: 1,
        name: scenario.name,
        sections: scenario.sections
    }
    if (scenario.description) {
        file.description = scenario.description
    }
    if (scenario.mapFileNames?.length) {
        file.mapFileNames = scenario.mapFileNames
    }
    return file
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
