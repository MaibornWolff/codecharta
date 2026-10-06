import { DeclarationKindMark } from "../../../model/dependencyGraph.model"
import { DeclarationShape, declarationKindLookOf } from "./declarationKinds"
import { drawnItem, UNTRANSFORMED } from "./dependencyGraphElements"
import { ToPixels } from "./dependencyGraphScene"
import {
    CLOSED_FOLDER_FILL,
    CLOSED_FOLDER_STROKE,
    CLOSED_PACKAGE_FILL,
    CLOSED_PACKAGE_STROKE,
    DECLARATION_STROKE,
    FILE_FILL,
    FILE_STROKE,
    FOLDER_STROKE,
    FOUND_OPACITY,
    folderFill,
    HOVERED_COLOR,
    LEVEL_SEPARATOR_COLOR,
    MISSED_BY_SEARCH_OPACITY,
    MOVED_COLOR,
    OPEN_FILE_FILL,
    PACKAGE_STROKE,
    packageFill,
    QUIET_TEXT_COLOR,
    SELECTED_COLOR,
    seeThrough,
    TEXT_COLOR
} from "./dependencyGraphStyle"
import { Rectangle } from "./geometry"
import { describeLevelPath, isContainerKind, LAYOUT_SPACING, LayoutBox, LevelBand } from "./levelizedLayout"
import { BandCutout, BandSeparator, bandSeparator } from "./overlaps"

export type BoxEmphasis = "selected" | "hovered" | "none"

export interface BoxLook {
    emphasis: BoxEmphasis
    isSeeThrough: boolean
    /** A search is on and the box holds nothing it found. */
    isMissedBySearch: boolean
    /** How a declaration tells what it is. */
    kindMark: DeclarationKindMark
    cycle: CycleLook
    /** Sits elsewhere in the other hierarchy, or holds something that does. */
    isMoved: boolean
}

export interface CycleLook {
    /** The cyclic dependencies a closed box hides; none draws no badge. */
    hiddenEdgeCount: number
    /** A declaration taking part in a cycle. */
    isInCycle: boolean
    color: string
}

export const NO_CYCLE: CycleLook = { hiddenEdgeCount: 0, isInCycle: false, color: "" }

const NOTHING_CUT_OUT: BandCutout = { hiddenSpans: [], isLabelHidden: false }

const LABEL_FONT_SIZE_PX = 12
const DECLARATION_FONT_SIZE_PX = 11
const QUIET_FONT_SIZE_PX = 10
/** What the toggle and the count each take from the name of a file that holds declarations. */
const FILE_MARK_WIDTH_PX = 16
const TOGGLE_HIT_PADDING_PX = 4
const TOGGLE_GLYPHS = { open: "▾", closed: "▸" }

const KIND_ICON = { sizePx: 14, cornerRadiusPx: 3, fontSizePx: 9, gapPx: 4, letterColor: "#ffffff" }
/** How far the pointed and slanted shapes cut into the box at its left and right. */
const SHAPE_CUT_SHARE_OF_HEIGHT = 0.35

const CYCLE_BADGE = { radiusPx: 8, fontSizePx: 9, textColor: "#ffffff", mostCounted: 99 }
const CYCLE_RING = { radiusPx: 4, lineWidthPx: 2 }

/** What a click on a part of a box carries, to tell it from a click on the box. */
export const TOGGLE_INFO = "toggle"
export const CYCLE_BADGE_INFO = "cycleBadge"
const LEVEL_FONT_SIZE_PX = 10
const LABEL_INSET_PX = 8
const MIN_LABEL_WIDTH_PX = 36
const CORNER_RADIUS_PX = 4
const LINE_WIDTH_PX = 1
const SELECTED_LINE_WIDTH_PX = 2.5
const HOVERED_LINE_WIDTH_PX = 2
const MOVED_OUTLINE = { lineWidth: 2, lineDash: [4, 3] }
const LEVEL_LABEL_LIFT_PX = 2
const SEPARATOR_DASH_PX = [4, 4]

export function drawBox(box: LayoutBox, look: BoxLook, toPixels: ToPixels) {
    const rect = pixelRectOf(box, toPixels)
    const outline = drawOutline(box, rect, look)
    const cycleMark = drawCycleMark(box, rect, look.cycle, opacityOf(look.isMissedBySearch))
    return drawnItem(box.isExpanded ? [outline] : [outline, ...drawName(box, rect, look), ...cycleMark])
}

/** Drawn apart from the open box so the edges pass under it. */
export function drawFolderTitle(box: LayoutBox, look: BoxLook, toPixels: ToPixels) {
    return drawnItem(drawName(box, pixelRectOf(box, toPixels), look))
}

function drawOutline(box: LayoutBox, rect: Rectangle, { emphasis, isSeeThrough, isMissedBySearch, kindMark, isMoved }: BoxLook) {
    const style = boxStyle(box, emphasis, isMoved)
    const kindLook = box.kind === "declaration" ? declarationKindLookOf(box.declarationKind) : null
    const ownFill = kindLook && kindMark === "tint" ? kindLook.tint : style.fill
    const fill = isSeeThrough ? seeThrough(ownFill) : ownFill
    const shape = kindLook && kindMark === "shape" ? kindLook.shape : "rectangle"
    return { ...UNTRANSFORMED, ...outlineOf(rect, shape), style: { ...style, fill, opacity: opacityOf(isMissedBySearch) } }
}

function outlineOf(rect: Rectangle, shape: DeclarationShape) {
    const cut = rect.height * SHAPE_CUT_SHARE_OF_HEIGHT
    const { x: left, y: top } = rect
    const right = left + rect.width
    const bottom = top + rect.height
    switch (shape) {
        case "pill":
            return { type: "rect", shape: { ...rect, r: rect.height / 2 } }
        case "sharp":
            return { type: "rect", shape: { ...rect, r: 0 } }
        case "hexagon": {
            const middle = top + rect.height / 2
            const points = [
                [left + cut, top],
                [right - cut, top],
                [right, middle],
                [right - cut, bottom],
                [left + cut, bottom],
                [left, middle]
            ]
            return { type: "polygon", shape: { points } }
        }
        case "slanted":
            return {
                type: "polygon",
                shape: {
                    points: [
                        [left + cut, top],
                        [right, top],
                        [right - cut, bottom],
                        [left, bottom]
                    ]
                }
            }
        default:
            return { type: "rect", shape: { ...rect, r: CORNER_RADIUS_PX } }
    }
}

function drawName(box: LayoutBox, rect: Rectangle, { isMissedBySearch, kindMark }: BoxLook): object[] {
    const opacity = opacityOf(isMissedBySearch)
    const hasKindIcon = box.kind === "declaration" && kindMark === "icon"
    const marks = [...drawFileMarks(box, rect, opacity), ...(hasKindIcon ? drawKindIcon(box, rect, opacity) : [])]
    const label = drawLabel(box, rect, { opacity, hasKindIcon })
    return label ? [label, ...marks] : marks
}

/** Both sit on the box's upper right corner: the badge of a closed box, the ring of a declaration. */
function drawCycleMark(box: LayoutBox, rect: Rectangle, { hiddenEdgeCount, isInCycle, color }: CycleLook, opacity: number): object[] {
    const centre = { cx: rect.x + rect.width, cy: rect.y }
    if (box.kind === "declaration") {
        const style = { fill: FILE_FILL, stroke: color, lineWidth: CYCLE_RING.lineWidthPx, opacity }
        return isInCycle ? [{ type: "circle", ...UNTRANSFORMED, silent: true, shape: { ...centre, r: CYCLE_RING.radiusPx }, style }] : []
    }
    if (box.isExpanded || hiddenEdgeCount === 0) {
        return []
    }
    const text = hiddenEdgeCount > CYCLE_BADGE.mostCounted ? `${CYCLE_BADGE.mostCounted}+` : String(hiddenEdgeCount)
    const badge = { ...UNTRANSFORMED, info: CYCLE_BADGE_INFO, cursor: "pointer" }
    return [
        { type: "circle", ...badge, shape: { ...centre, r: CYCLE_BADGE.radiusPx }, style: { fill: color, opacity } },
        {
            type: "text",
            ...badge,
            style: {
                text,
                x: centre.cx,
                y: centre.cy,
                align: "center",
                verticalAlign: "middle",
                fontSize: CYCLE_BADGE.fontSizePx,
                fontWeight: "bold",
                fill: CYCLE_BADGE.textColor,
                opacity
            }
        }
    ]
}

function drawFileMarks(box: LayoutBox, rect: Rectangle, opacity: number): object[] {
    return holdsDeclarations(box) ? [drawToggle(box, rect, opacity), ...drawDeclarationCount(box, rect, opacity)] : []
}

function drawKindIcon(box: LayoutBox, rect: Rectangle, opacity: number): object[] {
    const { letter, color } = declarationKindLookOf(box.declarationKind)
    const left = rect.x + LABEL_INSET_PX
    const centreY = rect.y + rect.height / 2
    const square = {
        x: left,
        y: centreY - KIND_ICON.sizePx / 2,
        width: KIND_ICON.sizePx,
        height: KIND_ICON.sizePx,
        r: KIND_ICON.cornerRadiusPx
    }
    return [
        { type: "rect", ...UNTRANSFORMED, silent: true, shape: square, style: { fill: color, opacity } },
        {
            type: "text",
            ...UNTRANSFORMED,
            silent: true,
            style: {
                text: letter,
                x: left + KIND_ICON.sizePx / 2,
                y: centreY,
                align: "center",
                verticalAlign: "middle",
                fontSize: KIND_ICON.fontSizePx,
                fontWeight: "bold",
                fill: KIND_ICON.letterColor,
                opacity
            }
        }
    ]
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

function boxStyle(box: LayoutBox, emphasis: BoxEmphasis, isMoved: boolean) {
    // The dash is stated for every box: ECharts keeps on a reused element whatever the next style leaves out.
    const base = isMoved ? { ...baseStyle(box), stroke: MOVED_COLOR, ...MOVED_OUTLINE } : { ...baseStyle(box), lineDash: null }
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
        case "package":
            return box.isExpanded
                ? { fill: packageFill(box.depth), stroke: PACKAGE_STROKE, lineWidth: LINE_WIDTH_PX }
                : { fill: CLOSED_PACKAGE_FILL, stroke: CLOSED_PACKAGE_STROKE, lineWidth: LINE_WIDTH_PX }
        default:
            return box.isExpanded
                ? { fill: folderFill(box.depth), stroke: FOLDER_STROKE, lineWidth: LINE_WIDTH_PX }
                : { fill: CLOSED_FOLDER_FILL, stroke: CLOSED_FOLDER_STROKE, lineWidth: LINE_WIDTH_PX }
    }
}

interface LabelLook {
    opacity: number
    hasKindIcon: boolean
}

function drawLabel(box: LayoutBox, rect: Rectangle, { opacity, hasKindIcon }: LabelLook) {
    const marksWidth = holdsDeclarations(box) ? FILE_MARK_WIDTH_PX : 0
    const iconWidth = hasKindIcon ? KIND_ICON.sizePx + KIND_ICON.gapPx : 0
    const width = rect.width - 2 * (LABEL_INSET_PX + marksWidth) - iconWidth
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
            x: isHeader ? rect.x + LABEL_INSET_PX + marksWidth : rect.x + (rect.width + iconWidth) / 2,
            y: nameCentreY(box, rect),
            width,
            overflow: "truncate",
            align: isHeader ? "left" : "center",
            verticalAlign: "middle",
            fontSize: box.kind === "declaration" ? DECLARATION_FONT_SIZE_PX : LABEL_FONT_SIZE_PX,
            fontWeight: isContainerKind(box.kind) ? "bold" : "normal",
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
