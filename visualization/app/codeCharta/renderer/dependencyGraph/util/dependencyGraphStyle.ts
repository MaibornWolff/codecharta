import { DependencyEdgeType } from "../../../lenses/dependency/dependencyLens.facade"

export const TEXT_COLOR = "#1f2937"
export const SELECTED_COLOR = "#1b9cfc"
export const HOVERED_COLOR = "#1f2937"

const FOLDER_FILLS_BY_DEPTH = ["#f4f6f9", "#e9edf2", "#dfe5ec", "#d5dce5"]
export const FOLDER_STROKE = "#b8c2cf"
export const CLOSED_FOLDER_FILL = "#dbe7f5"
export const CLOSED_FOLDER_STROKE = "#7a9cc6"
export const FILE_FILL = "#ffffff"
export const FILE_STROKE = "#9aa5b4"
export const LEVEL_SEPARATOR_COLOR = "#c3cbd6"

/** Grey follows the architecture, blue closes a cycle but still points down, red points upward — the
 * colours DependaCharta users already read. A dashed red edge is a violation between folders only. */
const EDGE_COLORS: Record<DependencyEdgeType, string> = {
    regular: "#8c96a3",
    cyclic: "#2563eb",
    feedbackContainerLevel: "#dc2626",
    feedbackLeafLevel: "#dc2626"
}
const DASHED = [5, 4]

export const EDGE_TYPE_LABELS: Record<DependencyEdgeType, string> = {
    regular: "Dependency",
    cyclic: "In a cycle",
    feedbackContainerLevel: "Points upward",
    feedbackLeafLevel: "Points upward and closes a cycle"
}

export interface EdgeLegendEntry {
    type: DependencyEdgeType
    label: string
    color: string
    isDashed: boolean
}

export const EDGE_LEGEND: EdgeLegendEntry[] = (Object.keys(EDGE_TYPE_LABELS) as DependencyEdgeType[]).map(type => ({
    type,
    label: EDGE_TYPE_LABELS[type],
    color: EDGE_COLORS[type],
    isDashed: type === "feedbackContainerLevel"
}))

export const DIMMED_OPACITY = 0.12

const BASE_EDGE_WIDTH_PX = 1.2
const MAX_EXTRA_EDGE_WIDTH_PX = 2.5
const EXTRA_WIDTH_PER_DOUBLING_PX = 0.5

/** How much of a see-through folder's fill remains, so what lies behind it stays readable. */
const SEE_THROUGH_OPACITY = 0.65

export function seeThrough(hexColor: string): string {
    const [red, green, blue] = [1, 3, 5].map(start => Number.parseInt(hexColor.slice(start, start + 2), 16))
    return `rgba(${red}, ${green}, ${blue}, ${SEE_THROUGH_OPACITY})`
}

export function folderFill(depth: number): string {
    return FOLDER_FILLS_BY_DEPTH[Math.min(depth, FOLDER_FILLS_BY_DEPTH.length - 1)]
}

export function edgeColor(type: DependencyEdgeType): string {
    return EDGE_COLORS[type]
}

export function edgeDash(type: DependencyEdgeType): number[] | null {
    return EDGE_LEGEND.find(entry => entry.type === type).isDashed ? DASHED : null
}

/** Grows with the number of dependencies an edge stands for, but slowly, so one heavy edge does not
 * drown the rest. */
export function edgeWidthPx(weight: number): number {
    return BASE_EDGE_WIDTH_PX + Math.min(MAX_EXTRA_EDGE_WIDTH_PX, Math.log2(weight) * EXTRA_WIDTH_PER_DOUBLING_PX)
}
