import { DEPENDENCY_EDGE_TYPES, DependencyEdgeColors, DependencyEdgeType, LineStyleMeaning } from "../../../model/dependencyGraph.model"
import { isDashedEdgeType } from "./lineStyle"

export const TEXT_COLOR = "#1f2937"
export const SELECTED_COLOR = "#1b9cfc"
export const HOVERED_COLOR = "#1f2937"

const FOLDER_FILLS_BY_DEPTH = ["#f4f6f9", "#e9edf2", "#dfe5ec", "#d5dce5"]
export const FOLDER_STROKE = "#b8c2cf"
export const CLOSED_FOLDER_FILL = "#dbe7f5"
export const CLOSED_FOLDER_STROKE = "#7a9cc6"
export const FILE_FILL = "#ffffff"
export const FILE_STROKE = "#9aa5b4"
export const OPEN_FILE_FILL = "#fbfcfe"
export const DECLARATION_STROKE = "#b9c1cc"
export const QUIET_TEXT_COLOR = "#6b7280"
export const LEVEL_SEPARATOR_COLOR = "#c3cbd6"

/** Grey follows the architecture, blue closes a cycle but still points down, red points upward — the
 * colours DependaCharta users already read, unless the reader picks others. */
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

export function edgeLegend(edgeColors: DependencyEdgeColors, lineStyleShows: LineStyleMeaning): EdgeLegendEntry[] {
    return DEPENDENCY_EDGE_TYPES.map(type => ({
        type,
        label: EDGE_TYPE_LABELS[type],
        color: edgeColors[type],
        isDashed: isDashedEdgeType(type, lineStyleShows)
    }))
}

export const DIMMED_OPACITY = 0.12
export const MISSED_BY_SEARCH_OPACITY = 0.3
export const FOUND_OPACITY = 1

/** How much of a see-through folder's fill remains, so what lies behind it stays readable. */
const SEE_THROUGH_OPACITY = 0.65
const RGB_OFFSETS_IN_HEX_COLOR = [1, 3, 5]
const HEX_DIGITS_PER_CHANNEL = 2
const HEX_RADIX = 16

export function seeThrough(hexColor: string): string {
    const [red, green, blue] = RGB_OFFSETS_IN_HEX_COLOR.map(start =>
        Number.parseInt(hexColor.slice(start, start + HEX_DIGITS_PER_CHANNEL), HEX_RADIX)
    )
    return `rgba(${red}, ${green}, ${blue}, ${SEE_THROUGH_OPACITY})`
}

export function folderFill(depth: number): string {
    return FOLDER_FILLS_BY_DEPTH[Math.min(depth, FOLDER_FILLS_BY_DEPTH.length - 1)]
}
