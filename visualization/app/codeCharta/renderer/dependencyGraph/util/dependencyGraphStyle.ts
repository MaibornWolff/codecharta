import { DEPENDENCY_EDGE_TYPES, DependencyEdgeColors, DependencyEdgeType, LineStyleMeaning } from "../../../model/dependencyGraph.model"
import { isDashedEdgeType } from "./lineStyle"

export const TEXT_COLOR = "#1f2937"
export const SELECTED_COLOR = "#1b9cfc"
export const HOVERED_COLOR = "#1f2937"

const FOLDER_FILLS_BY_DEPTH = ["#f4f6f9", "#e9edf2", "#dfe5ec", "#d5dce5"]
export const FOLDER_STROKE = "#b8c2cf"
export const CLOSED_FOLDER_FILL = "#dbe7f5"
export const CLOSED_FOLDER_STROKE = "#7a9cc6"
const PACKAGE_FILLS_BY_DEPTH = ["#f8f6fd", "#f0ecfa", "#e9e3f7", "#e1d9f3"]
export const PACKAGE_STROKE = "#c6bce2"
export const CLOSED_PACKAGE_FILL = "#e6e0f7"
export const CLOSED_PACKAGE_STROKE = "#8f7fc7"
export const FILE_FILL = "#ffffff"
export const DECLARATION_FILL = "#f7f9fc"
export const FILE_STROKE = "#9aa5b4"
export const OPEN_FILE_FILL = "#fbfcfe"
export const QUIET_TEXT_COLOR = "#6b7280"
export const QUIET_BADGE_COLOR = "#8a94a3"
export const LEVEL_SEPARATOR_COLOR = "#c3cbd6"

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
    /** The colour the reader gave the type, which is drawn only while nothing else tells the type apart. */
    ownColor: string
    isDashed: boolean
}

/** While the dashes tell the edge types apart, the upward edge that closes a cycle is the solid one in the colour
 * of the upward edges, as it always was. Once the dashes tell the kind of use, only a colour of its own can. */
export function edgeColorsAsDrawn(edgeColors: DependencyEdgeColors, lineStyleShows: LineStyleMeaning): DependencyEdgeColors {
    return lineStyleShows === "usage" ? edgeColors : { ...edgeColors, feedbackLeafLevel: edgeColors.feedbackContainerLevel }
}

export function edgeLegend(edgeColors: DependencyEdgeColors, lineStyleShows: LineStyleMeaning): EdgeLegendEntry[] {
    const drawn = edgeColorsAsDrawn(edgeColors, lineStyleShows)
    return DEPENDENCY_EDGE_TYPES.map(type => ({
        type,
        label: EDGE_TYPE_LABELS[type],
        color: drawn[type],
        ownColor: edgeColors[type],
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

export function packageFill(depth: number): string {
    return PACKAGE_FILLS_BY_DEPTH[Math.min(depth, PACKAGE_FILLS_BY_DEPTH.length - 1)]
}
