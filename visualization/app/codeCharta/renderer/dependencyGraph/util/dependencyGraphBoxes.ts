import { drawnItem, UNTRANSFORMED } from "./dependencyGraphElements"
import { ToPixels } from "./dependencyGraphScene"
import {
    CLOSED_FOLDER_FILL,
    CLOSED_FOLDER_STROKE,
    DECLARATION_STROKE,
    FILE_FILL,
    FILE_STROKE,
    FOLDER_STROKE,
    FOUND_OPACITY,
    folderFill,
    HOVERED_COLOR,
    LEVEL_SEPARATOR_COLOR,
    MISSED_BY_SEARCH_OPACITY,
    OPEN_FILE_FILL,
    QUIET_TEXT_COLOR,
    SELECTED_COLOR,
    seeThrough,
    TEXT_COLOR
} from "./dependencyGraphStyle"
import { Rectangle } from "./geometry"
import { describeLevelPath, LAYOUT_SPACING, LayoutBox, LevelBand } from "./levelizedLayout"
import { BandCutout, BandSeparator, bandSeparator } from "./overlaps"

export type BoxEmphasis = "selected" | "hovered" | "none"

export interface BoxLook {
    emphasis: BoxEmphasis
    isSeeThrough: boolean
    /** A search is on and the box holds nothing it found. */
    isMissedBySearch: boolean
}

const NOTHING_CUT_OUT: BandCutout = { hiddenSpans: [], isLabelHidden: false }

const LABEL_FONT_SIZE_PX = 12
const DECLARATION_FONT_SIZE_PX = 11
const QUIET_FONT_SIZE_PX = 10
/** What the toggle and the count each take from the name of a file that holds declarations. */
const FILE_MARK_WIDTH_PX = 16
const TOGGLE_HIT_PADDING_PX = 4
const TOGGLE_GLYPHS = { open: "▾", closed: "▸" }

/** What a click on a box's toggle carries, to tell it from a click on the box. */
export const TOGGLE_INFO = "toggle"
const LEVEL_FONT_SIZE_PX = 10
const LABEL_INSET_PX = 8
const MIN_LABEL_WIDTH_PX = 36
const CORNER_RADIUS_PX = 4
const LINE_WIDTH_PX = 1
const SELECTED_LINE_WIDTH_PX = 2.5
const HOVERED_LINE_WIDTH_PX = 2
const LEVEL_LABEL_LIFT_PX = 2
const SEPARATOR_DASH_PX = [4, 4]

export function drawBox(box: LayoutBox, { emphasis, isSeeThrough, isMissedBySearch }: BoxLook, toPixels: ToPixels) {
    const rect = pixelRectOf(box, toPixels)
    const style = boxStyle(box, emphasis)
    const fill = isSeeThrough ? seeThrough(style.fill) : style.fill
    const opacity = opacityOf(isMissedBySearch)
    const outline = { type: "rect", ...UNTRANSFORMED, shape: { ...rect, r: CORNER_RADIUS_PX }, style: { ...style, fill, opacity } }
    return drawnItem(box.isExpanded ? [outline] : [outline, ...drawName(box, rect, opacity)])
}

/** Drawn apart from the open box so the edges pass under it. */
export function drawFolderTitle(box: LayoutBox, { isMissedBySearch }: BoxLook, toPixels: ToPixels) {
    return drawnItem(drawName(box, pixelRectOf(box, toPixels), opacityOf(isMissedBySearch)))
}

function drawName(box: LayoutBox, rect: Rectangle, opacity: number): object[] {
    const marks = holdsDeclarations(box) ? [drawToggle(box, rect, opacity), ...drawDeclarationCount(box, rect, opacity)] : []
    const label = drawLabel(box, rect, opacity)
    return label ? [label, ...marks] : marks
}

function holdsDeclarations(box: LayoutBox): boolean {
    return box.kind === "file" && box.declarationCount > 0
}

function drawToggle(box: LayoutBox, rect: Rectangle, opacity: number) {
    return {
        type: "text",
        ...UNTRANSFORMED,
        info: TOGGLE_INFO,
        cursor: "pointer",
        style: {
            text: box.isExpanded ? TOGGLE_GLYPHS.open : TOGGLE_GLYPHS.closed,
            x: rect.x + LABEL_INSET_PX - TOGGLE_HIT_PADDING_PX,
            y: nameCentreY(box, rect),
            padding: TOGGLE_HIT_PADDING_PX,
            align: "left",
            verticalAlign: "middle",
            fontSize: QUIET_FONT_SIZE_PX,
            fill: QUIET_TEXT_COLOR,
            opacity
        }
    }
}

/** A closed file says how many declarations it holds once there is more than the one its name stands for. */
function drawDeclarationCount(box: LayoutBox, rect: Rectangle, opacity: number): object[] {
    if (box.isExpanded || box.declarationCount < 2) {
        return []
    }
    return [
        {
            type: "text",
            ...UNTRANSFORMED,
            silent: true,
            style: {
                text: String(box.declarationCount),
                x: rect.x + rect.width - LABEL_INSET_PX,
                y: nameCentreY(box, rect),
                align: "right",
                verticalAlign: "middle",
                fontSize: QUIET_FONT_SIZE_PX,
                fill: QUIET_TEXT_COLOR,
                opacity
            }
        }
    ]
}

function opacityOf(isMissedBySearch: boolean): number {
    return isMissedBySearch ? MISSED_BY_SEARCH_OPACITY : FOUND_OPACITY
}

export function drawLevelBand(band: LevelBand, toPixels: ToPixels, cutout: BandCutout = NOTHING_CUT_OUT) {
    const separator = bandSeparator(band)
    const label = cutout.isLabelHidden ? [] : [drawLevelLabel(band, separator, toPixels)]
    const separatorLines = band.isTopmost ? [] : drawSeparatorLines(separator, cutout.hiddenSpans, toPixels)
    return drawnItem([...label, ...separatorLines])
}

function drawLevelLabel(band: LevelBand, { left }: BandSeparator, toPixels: ToPixels) {
    const [labelX, labelY] = toPixels([left, band.y])
    return {
        type: "text",
        ...UNTRANSFORMED,
        silent: true,
        style: {
            text: `level ${describeLevelPath(band.levelPath)}`,
            x: labelX,
            y: labelY - LEVEL_LABEL_LIFT_PX,
            align: "left",
            verticalAlign: "bottom",
            fontSize: LEVEL_FONT_SIZE_PX,
            fill: LEVEL_SEPARATOR_COLOR
        }
    }
}

function drawSeparatorLines({ left, right, y }: BandSeparator, hiddenSpans: [number, number][], toPixels: ToPixels) {
    return visibleSpans([left, right], hiddenSpans).map(([from, to]) => {
        const [x1, y1] = toPixels([from, y])
        const [x2] = toPixels([to, y])
        return {
            type: "line",
            ...UNTRANSFORMED,
            silent: true,
            shape: { x1, y1, x2, y2: y1 },
            style: { stroke: LEVEL_SEPARATOR_COLOR, lineWidth: LINE_WIDTH_PX, lineDash: SEPARATOR_DASH_PX }
        }
    })
}

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

function pixelRectOf(box: LayoutBox, toPixels: ToPixels): Rectangle {
    const [left, top] = toPixels([box.x, box.y])
    const [right, bottom] = toPixels([box.x + box.width, box.y + box.height])
    return { x: left, y: top, width: right - left, height: bottom - top }
}

function boxStyle(box: LayoutBox, emphasis: BoxEmphasis) {
    const base = baseStyle(box)
    if (emphasis === "selected") {
        return { ...base, stroke: SELECTED_COLOR, lineWidth: SELECTED_LINE_WIDTH_PX }
    }
    if (emphasis === "hovered") {
        return { ...base, stroke: HOVERED_COLOR, lineWidth: HOVERED_LINE_WIDTH_PX }
    }
    return base
}

function baseStyle(box: LayoutBox) {
    switch (box.kind) {
        case "declaration":
            return { fill: FILE_FILL, stroke: DECLARATION_STROKE, lineWidth: LINE_WIDTH_PX }
        case "file":
            return { fill: box.isExpanded ? OPEN_FILE_FILL : FILE_FILL, stroke: FILE_STROKE, lineWidth: LINE_WIDTH_PX }
        default:
            return box.isExpanded
                ? { fill: folderFill(box.depth), stroke: FOLDER_STROKE, lineWidth: LINE_WIDTH_PX }
                : { fill: CLOSED_FOLDER_FILL, stroke: CLOSED_FOLDER_STROKE, lineWidth: LINE_WIDTH_PX }
    }
}

function drawLabel(box: LayoutBox, rect: Rectangle, opacity: number) {
    const marksWidth = holdsDeclarations(box) ? FILE_MARK_WIDTH_PX : 0
    const width = rect.width - 2 * (LABEL_INSET_PX + marksWidth)
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
            x: isHeader ? rect.x + LABEL_INSET_PX + marksWidth : rect.x + rect.width / 2,
            y: nameCentreY(box, rect),
            width,
            overflow: "truncate",
            align: isHeader ? "left" : "center",
            verticalAlign: "middle",
            fontSize: box.kind === "declaration" ? DECLARATION_FONT_SIZE_PX : LABEL_FONT_SIZE_PX,
            fontWeight: box.kind === "folder" ? "bold" : "normal",
            fill: TEXT_COLOR,
            opacity
        }
    }
}

/** An open box names itself in its header, a closed one across its middle. */
function nameCentreY(box: LayoutBox, rect: Rectangle): number {
    return box.isExpanded ? rect.y + headerHeightPx(box, rect) / 2 : rect.y + rect.height / 2
}

function headerHeightPx(box: LayoutBox, rect: Rectangle): number {
    return (rect.height * LAYOUT_SPACING.headerHeight) / box.height
}
