import { drawnItem, UNTRANSFORMED } from "./dependencyGraphElements"
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
    seeThrough,
    TEXT_COLOR
} from "./dependencyGraphStyle"
import { LAYOUT_SPACING, LayoutBox, LevelBand } from "./levelizedLayout"
import { BandCutout } from "./overlaps"

export type BoxEmphasis = "selected" | "hovered" | "none"

export interface BoxLook {
    emphasis: BoxEmphasis
    /** Lets whatever lies behind the box show through its fill. */
    isSeeThrough: boolean
}

const NOTHING_CUT_OUT: BandCutout = { hiddenSpans: [], isLabelHidden: false }

const LABEL_FONT_SIZE_PX = 12
const LEVEL_FONT_SIZE_PX = 10
const LABEL_INSET_PX = 8
const MIN_LABEL_WIDTH_PX = 36
const CORNER_RADIUS_PX = 4

interface PixelRect {
    x: number
    y: number
    width: number
    height: number
}

export function drawBox(box: LayoutBox, { emphasis, isSeeThrough }: BoxLook, toPixels: ToPixels) {
    const rect = pixelRectOf(box, toPixels)
    const style = boxStyle(box, emphasis)
    const fill = isSeeThrough ? seeThrough(style.fill) : style.fill
    const children: object[] = [{ type: "rect", ...UNTRANSFORMED, shape: { ...rect, r: CORNER_RADIUS_PX }, style: { ...style, fill } }]
    const label = drawLabel(box, rect)
    if (label) {
        children.push(label)
    }
    return drawnItem(children)
}

/** The band's label and separator, less whatever a box from outside its folder covers. */
export function drawLevelBand(band: LevelBand, toPixels: ToPixels, cutout: BandCutout = NOTHING_CUT_OUT) {
    const left = band.x + LAYOUT_SPACING.padding
    const right = band.x + band.width - LAYOUT_SPACING.padding
    const separatorY = band.y - LAYOUT_SPACING.gapBetweenLevels / 2
    const children: object[] = []
    if (!cutout.isLabelHidden) {
        const [labelX, labelY] = toPixels([left, band.y])
        children.push({
            type: "text",
            ...UNTRANSFORMED,
            silent: true,
            style: {
                text: `level ${band.level}`,
                x: labelX,
                y: labelY - 2,
                align: "left",
                verticalAlign: "bottom",
                fontSize: LEVEL_FONT_SIZE_PX,
                fill: LEVEL_SEPARATOR_COLOR
            }
        })
    }
    if (!band.isTopmost) {
        for (const [from, to] of visibleSpans([left, right], cutout.hiddenSpans)) {
            const [x1, y1] = toPixels([from, separatorY])
            const [x2] = toPixels([to, separatorY])
            children.push({
                type: "line",
                ...UNTRANSFORMED,
                silent: true,
                shape: { x1, y1, x2, y2: y1 },
                style: { stroke: LEVEL_SEPARATOR_COLOR, lineWidth: 1, lineDash: [4, 4] }
            })
        }
    }
    return drawnItem(children)
}

/** What remains of a span once the hidden stretches are taken out of it. */
function visibleSpans([start, end]: [number, number], hidden: [number, number][]): [number, number][] {
    const spans: [number, number][] = []
    let from = start
    for (const [hiddenFrom, hiddenTo] of [...hidden].sort(([fromA], [fromB]) => fromA - fromB)) {
        if (hiddenFrom > from) {
            spans.push([from, Math.min(hiddenFrom, end)])
        }
        from = Math.max(from, hiddenTo)
    }
    if (from < end) {
        spans.push([from, end])
    }
    return spans
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
function drawLabel(box: LayoutBox, rect: PixelRect) {
    const width = rect.width - 2 * LABEL_INSET_PX
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
            x: isHeader ? rect.x + LABEL_INSET_PX : rect.x + rect.width / 2,
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
