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
    edgeMetric: string
    distributionMetric: string
    isColorMetricLinkedToHeightMetric: boolean
}

export interface ColorsSection {
    colorRange: ColorRange
    colorMode: ColorMode
    mapColors: MapColors
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
    metrics: MetricsSection
    colors: ColorsSection
    camera: CameraSection
    filters: FiltersSection
    labelsAndFolders: LabelsAndFoldersSection
}

export interface Scenario {
    id: string
    name: string
    description?: string
    mapFileNames?: string[]
    createdAt: number
    sections: ScenarioSections
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
