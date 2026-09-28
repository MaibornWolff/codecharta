import { ToPixels } from "./dependencyGraphScene"
import {
    CLOSED_FOLDER_FILL,
    CLOSED_FOLDER_STROKE,
    FILE_FILL,
    FILE_STROKE,
    FOLDER_STROKE,
    folderFill,
    HOVERED_COLOR,
    LEVEL_SEPARATOR_COLOR,
    SELECTED_COLOR,
    TEXT_COLOR
} from "./dependencyGraphStyle"
import { LAYOUT_SPACING, LayoutBox, LevelBand } from "./levelizedLayout"

/** Carried by the open/close glyph, so a click on it toggles the folder instead of selecting it. */
export const TOGGLE_INFO = "toggle"

export type BoxEmphasis = "selected" | "hovered" | "none"

const LABEL_FONT_SIZE_PX = 12
const LEVEL_FONT_SIZE_PX = 10
const LABEL_INSET_PX = 8
const MIN_LABEL_WIDTH_PX = 36
const TOGGLE_SIZE_PX = 16
/** Below this width a folder's name matters more than its glyph; it still opens on a double click. */
const MIN_TOGGLE_BOX_WIDTH_PX = 100
const CORNER_RADIUS_PX = 4
// ECharts reuses an element by its position among the drawn ones and keeps whatever an option leaves out,
// so every element states its transform.
const UNTRANSFORMED = { x: 0, y: 0, rotation: 0 }

interface PixelRect {
    x: number
    y: number
    width: number
    height: number
}

export function drawBox(box: LayoutBox, emphasis: BoxEmphasis, toPixels: ToPixels) {
    const rect = pixelRectOf(box, toPixels)
    const children: object[] = [{ type: "rect", ...UNTRANSFORMED, shape: { ...rect, r: CORNER_RADIUS_PX }, style: boxStyle(box, emphasis) }]
    const hasToggle = box.isFolder && rect.width >= MIN_TOGGLE_BOX_WIDTH_PX
    const label = drawLabel(box, rect, hasToggle)
    if (label) {
        children.push(label)
    }
    if (hasToggle) {
        children.push(...drawToggle(box, rect))
    }
    return { type: "group", ...UNTRANSFORMED, children }
}

export function drawLevelBand(band: LevelBand, toPixels: ToPixels) {
    const [left, top] = toPixels([band.x + LAYOUT_SPACING.padding, band.y])
    const [right] = toPixels([band.x + band.width - LAYOUT_SPACING.padding, band.y])
    const [, separatorY] = toPixels([band.x, band.y - LAYOUT_SPACING.gapBetweenLevels / 2])
    const children: object[] = [
        {
            type: "text",
            ...UNTRANSFORMED,
            silent: true,
            style: {
                text: `level ${band.level}`,
                x: left,
                y: top - 2,
                align: "left",
                verticalAlign: "bottom",
                fontSize: LEVEL_FONT_SIZE_PX,
                fill: LEVEL_SEPARATOR_COLOR
            }
        }
    ]
    if (!band.isTopmost) {
        children.push({
            type: "line",
            ...UNTRANSFORMED,
            silent: true,
            shape: { x1: left, y1: separatorY, x2: right, y2: separatorY },
            style: { stroke: LEVEL_SEPARATOR_COLOR, lineWidth: 1, lineDash: [4, 4] }
        })
    }
    return { type: "group", ...UNTRANSFORMED, children }
}

function pixelRectOf(box: LayoutBox, toPixels: ToPixels): PixelRect {
    const [left, top] = toPixels([box.x, box.y])
    const [right, bottom] = toPixels([box.x + box.width, box.y + box.height])
    return { x: left, y: top, width: right - left, height: bottom - top }
}

function boxStyle(box: LayoutBox, emphasis: BoxEmphasis) {
    const base = baseStyle(box)
    if (emphasis === "selected") {
        return { ...base, stroke: SELECTED_COLOR, lineWidth: 2.5 }
    }
    if (emphasis === "hovered") {
        return { ...base, stroke: HOVERED_COLOR, lineWidth: 2 }
    }
    return base
}

function baseStyle(box: LayoutBox) {
    if (!box.isFolder) {
        return { fill: FILE_FILL, stroke: FILE_STROKE, lineWidth: 1 }
    }
    return box.isExpanded
        ? { fill: folderFill(box.depth), stroke: FOLDER_STROKE, lineWidth: 1 }
        : { fill: CLOSED_FOLDER_FILL, stroke: CLOSED_FOLDER_STROKE, lineWidth: 1 }
}

/** An open folder names itself in its header strip; a file or a closed folder in its middle. */
function drawLabel(box: LayoutBox, rect: PixelRect, hasToggle: boolean) {
    const reservedForToggle = hasToggle ? TOGGLE_SIZE_PX + LABEL_INSET_PX : 0
    const width = rect.width - 2 * LABEL_INSET_PX - reservedForToggle
    if (width < MIN_LABEL_WIDTH_PX) {
        return null
    }
    const isHeader = box.isExpanded
    return {
        type: "text",
        ...UNTRANSFORMED,
        silent: true,
        style: {
            text: box.name,
            x: isHeader ? rect.x + LABEL_INSET_PX : rect.x + (rect.width - reservedForToggle) / 2,
            y: isHeader ? rect.y + headerHeightPx(box, rect) / 2 : rect.y + rect.height / 2,
            width,
            overflow: "truncate",
            align: isHeader ? "left" : "center",
            verticalAlign: "middle",
            fontSize: LABEL_FONT_SIZE_PX,
            fontWeight: box.isFolder ? "bold" : "normal",
            fill: TEXT_COLOR
        }
    }
}

function headerHeightPx(box: LayoutBox, rect: PixelRect): number {
    return (rect.height * LAYOUT_SPACING.headerHeight) / box.height
}

function drawToggle(box: LayoutBox, rect: PixelRect) {
    const centreY = box.isExpanded ? rect.y + headerHeightPx(box, rect) / 2 : rect.y + rect.height / 2
    const left = rect.x + rect.width - LABEL_INSET_PX - TOGGLE_SIZE_PX
    const top = centreY - TOGGLE_SIZE_PX / 2
    return [
        {
            type: "rect",
            ...UNTRANSFORMED,
            info: TOGGLE_INFO,
            cursor: "pointer",
            shape: { x: left, y: top, width: TOGGLE_SIZE_PX, height: TOGGLE_SIZE_PX, r: 3 },
            style: { fill: FILE_FILL, stroke: CLOSED_FOLDER_STROKE, lineWidth: 1 }
        },
        {
            type: "text",
            ...UNTRANSFORMED,
            silent: true,
            style: {
                text: box.isExpanded ? "−" : "+",
                x: left + TOGGLE_SIZE_PX / 2,
                y: centreY,
                align: "center",
                verticalAlign: "middle",
                fontSize: LABEL_FONT_SIZE_PX,
                fontWeight: "bold",
                fill: TEXT_COLOR
            }
        }
    ]
}
