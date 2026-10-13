import { declarationKindLookOf, KIND_ICON_COLORS } from "./declarationKinds"
import { CLICKABLE, UNTRANSFORMED } from "./dependencyGraphElements"
import { CYCLE_MARK_COLOR, FILE_FILL, QUIET_BADGE_COLOR } from "./dependencyGraphStyle"
import { Rectangle } from "./geometry"
import { inkCentreShiftOf, MARK_FONT_FAMILY } from "./inkCentre"
import { LayoutBox } from "./layoutModel"

export interface CycleLook {
    /** The cycles that stay within single files a closed box hides; none draws no badge. */
    insideFilesCount: number
    /** The cycles between different files that run through the box; none draws no badge. */
    betweenFilesCount: number
    isInCycle: boolean
}

export interface MarkLook {
    opacity: number
    scale: number
}

const KIND_ICON = { radiusPx: 7, centreInsetPx: 14, fontSizePx: 10, lineWidthPx: 0.8 }
/** What the icon takes from the room for a declaration's name. */
export const KIND_ICON_WIDTH_PX = 18
const COUNT_BADGE = { radiusPx: 7, centreInsetPx: 14, fontSizePx: 10, outlinePx: 1 }
/** One declaration is what the file's name stands for already. */
const FEWEST_COUNTED_DECLARATIONS = 2
const CYCLE_BADGE = {
    heightPx: 15,
    overhangPx: 6,
    risePx: 9,
    outlinePx: 1.2,
    fontSizePx: 10,
    numberLeftPx: 17,
    numberRoomPx: 5,
    digitWidthPx: 6,
    gapPx: 3
}

interface CycleMarkColors {
    fill: string
    line: string
}

const CYCLE_BADGE_CONTRAST_COLOR = "#ffffff"
const MARK_FONT_WEIGHT = "bold"
const MOST_COUNTED = 99
/** Drawn around its own centre. */
export const CYCLE_GLYPH = { arc: "M2.9 1.7A3.4 3.4 0 1 1 1.7-2.9", head: "M4.1-1.5L2.8-5.1L.3-1.2z", lineWidthPx: 1.5 }
const CYCLE_RING = { radiusPx: 3.5, lineWidthPx: 2, insetPx: 1 }

export type CycleMarkKind = "insideFiles" | "betweenFiles" | "declaration"

/** Filled for the cycles between files, outlined for those within a file: a cycle across files is the wider
 * tangle, so wherever the two are told together it comes first. */
export const CYCLE_MARK_COLORS: Record<CycleMarkKind, CycleMarkColors> = {
    insideFiles: { fill: CYCLE_BADGE_CONTRAST_COLOR, line: CYCLE_MARK_COLOR },
    betweenFiles: { fill: CYCLE_MARK_COLOR, line: CYCLE_BADGE_CONTRAST_COLOR },
    declaration: { fill: FILE_FILL, line: CYCLE_MARK_COLOR }
}

const SAMPLE_COUNT = "2"

/** The sizes the marks are drawn in, for a sample of one outside the graph. */
export const CYCLE_MARK_SAMPLE = {
    count: SAMPLE_COUNT,
    widthPx: CYCLE_BADGE.numberLeftPx + SAMPLE_COUNT.length * CYCLE_BADGE.digitWidthPx + CYCLE_BADGE.numberRoomPx,
    heightPx: CYCLE_BADGE.heightPx,
    outlinePx: CYCLE_BADGE.outlinePx,
    numberLeftPx: CYCLE_BADGE.numberLeftPx,
    fontSizePx: CYCLE_BADGE.fontSizePx,
    fontWeight: MARK_FONT_WEIGHT,
    fontFamily: MARK_FONT_FAMILY,
    ringRadiusPx: CYCLE_RING.radiusPx,
    ringLineWidthPx: CYCLE_RING.lineWidthPx
}

export const CYCLE_MARK_LEGEND: readonly { mark: CycleMarkKind; label: string }[] = [
    { mark: "betweenFiles", label: "Cycles between files" },
    { mark: "insideFiles", label: "Cycles inside a file" },
    { mark: "declaration", label: "Declaration in a cycle" }
]

/** What a click on a box's cycle badge carries, to tell it from a click on the box. */
export const CYCLE_BADGE_INFO = "cycleBadge"

export function drawKindIcon(box: LayoutBox, rect: Rectangle, { opacity, scale }: MarkLook): object[] {
    const { letter, tint } = declarationKindLookOf(box.declarationKind)
    const centre = { cx: rect.x + KIND_ICON.centreInsetPx * scale, cy: rect.y + rect.height / 2 }
    const disc = { fill: tint, stroke: KIND_ICON_COLORS.stroke, lineWidth: KIND_ICON.lineWidthPx, opacity }
    return [
        { type: "circle", ...UNTRANSFORMED, silent: true, shape: { ...centre, r: KIND_ICON.radiusPx * scale }, style: disc },
        centredText(letter, centre, { fontSize: KIND_ICON.fontSizePx * scale, fill: KIND_ICON_COLORS.letter, opacity })
    ]
}

/** A closed file says how many declarations it holds once there is more than the one its name stands for. */
export function drawDeclarationCount(box: LayoutBox, rect: Rectangle, { opacity, scale }: MarkLook): object[] {
    if (box.isExpanded || box.declarationCount < FEWEST_COUNTED_DECLARATIONS) {
        return []
    }
    const centre = { cx: rect.x + rect.width - COUNT_BADGE.centreInsetPx * scale, cy: rect.y + rect.height / 2 }
    const disc = { fill: FILE_FILL, stroke: QUIET_BADGE_COLOR, lineWidth: COUNT_BADGE.outlinePx, opacity }
    return [
        { type: "circle", ...UNTRANSFORMED, silent: true, shape: { ...centre, r: COUNT_BADGE.radiusPx * scale }, style: disc },
        centredText(String(box.declarationCount), centre, { fontSize: COUNT_BADGE.fontSizePx * scale, fill: QUIET_BADGE_COLOR, opacity })
    ]
}

export interface CycleMarkLook {
    opacity: number
    zoom: number
}

/** A cycle mark leads the reader to a cycle from far out, so it shrinks with the graph only this far. */
const SMALLEST_CYCLE_MARK_SCALE = 0.7

export function drawCycleMark(
    box: LayoutBox,
    rect: Rectangle,
    { insideFilesCount, betweenFilesCount, isInCycle }: CycleLook,
    { opacity, zoom }: CycleMarkLook
): object[] {
    const mark = { opacity, scale: Math.max(SMALLEST_CYCLE_MARK_SCALE, Math.min(1, zoom)) }
    if (box.kind === "declaration") {
        return isInCycle ? [drawCycleRing(rect, mark)] : []
    }
    return drawCycleBadges(rect, { insideFilesCount, betweenFilesCount }, mark)
}

function drawCycleRing(rect: Rectangle, { opacity, scale }: MarkLook): object {
    const centre = { cx: rect.x + rect.width - CYCLE_RING.insetPx, cy: rect.y + CYCLE_RING.insetPx }
    const { fill, line } = CYCLE_MARK_COLORS.declaration
    const style = { fill, stroke: line, lineWidth: CYCLE_RING.lineWidthPx * scale, opacity }
    return { type: "circle", ...UNTRANSFORMED, silent: true, shape: { ...centre, r: CYCLE_RING.radiusPx * scale }, style }
}

function drawCycleBadges(rect: Rectangle, counts: Pick<CycleLook, "insideFilesCount" | "betweenFilesCount">, mark: MarkLook): object[] {
    const corner = { right: rect.x + rect.width + CYCLE_BADGE.overhangPx * mark.scale, top: rect.y - CYCLE_BADGE.risePx * mark.scale }
    const insideFiles = drawCycleBadge(corner, counts.insideFilesCount, CYCLE_MARK_COLORS.insideFiles, mark)
    const cornerOfNextBadge = { ...corner, right: insideFiles.rightOfNextBadge }
    const betweenFiles = drawCycleBadge(cornerOfNextBadge, counts.betweenFilesCount, CYCLE_MARK_COLORS.betweenFiles, mark)
    return [...betweenFiles.elements, ...insideFiles.elements]
}

interface BadgeCorner {
    right: number
    top: number
}

interface DrawnBadge {
    rightOfNextBadge: number
    elements: object[]
}

function drawCycleBadge({ right, top }: BadgeCorner, count: number, colors: CycleMarkColors, mark: MarkLook): DrawnBadge {
    if (count === 0) {
        return { rightOfNextBadge: right, elements: [] }
    }
    const { opacity, scale } = mark
    const text = count > MOST_COUNTED ? `${MOST_COUNTED}+` : String(count)
    const height = CYCLE_BADGE.heightPx * scale
    const numberLeft = CYCLE_BADGE.numberLeftPx * scale
    const width = numberLeft + (text.length * CYCLE_BADGE.digitWidthPx + CYCLE_BADGE.numberRoomPx) * scale
    const left = right - width
    const pill = { x: left, y: top, width, height, r: height / 2 }
    const pillStyle = { fill: colors.fill, stroke: colors.line, lineWidth: CYCLE_BADGE.outlinePx, opacity }
    const middle = top + height / 2
    const elements = [
        { type: "rect", ...UNTRANSFORMED, ...CYCLE_BADGE_PART, shape: pill, style: pillStyle },
        ...cycleGlyph({ x: left + height / 2, y: middle }, colors.line, mark),
        cycleCount(text, { x: left + numberLeft, y: middle }, colors.line, mark)
    ]
    return { rightOfNextBadge: left - CYCLE_BADGE.gapPx * scale, elements }
}

const CYCLE_BADGE_PART = { info: CYCLE_BADGE_INFO, ...CLICKABLE }

function cycleGlyph(centre: { x: number; y: number }, color: string, { opacity, scale }: MarkLook): object[] {
    const placed = { ...UNTRANSFORMED, ...centre, scaleX: scale, scaleY: scale, silent: true }
    const line = { fill: null, stroke: color, lineWidth: CYCLE_GLYPH.lineWidthPx, lineCap: "round", opacity }
    return [
        { type: "path", ...placed, shape: { pathData: CYCLE_GLYPH.arc }, style: line },
        { type: "path", ...placed, shape: { pathData: CYCLE_GLYPH.head }, style: { fill: color, stroke: null, opacity } }
    ]
}

function cycleCount(text: string, leftMiddle: { x: number; y: number }, color: string, { opacity, scale }: MarkLook) {
    const fontSize = CYCLE_BADGE.fontSizePx * scale
    const [, shiftY] = inkCentreShiftOf(text, MARK_FONT_WEIGHT, fontSize)
    const look = { align: "left", verticalAlign: "middle", fontSize, fontWeight: MARK_FONT_WEIGHT, fontFamily: MARK_FONT_FAMILY }
    return {
        type: "text",
        ...UNTRANSFORMED,
        ...CYCLE_BADGE_PART,
        style: { text, x: leftMiddle.x, y: leftMiddle.y + shiftY, ...look, fill: color, opacity }
    }
}

interface TextLook {
    fontSize: number
    fill: string
    opacity: number
}

function centredText(text: string, { cx, cy }: { cx: number; cy: number }, look: TextLook) {
    const [shiftX, shiftY] = inkCentreShiftOf(text, MARK_FONT_WEIGHT, look.fontSize)
    const font = { fontWeight: MARK_FONT_WEIGHT, fontFamily: MARK_FONT_FAMILY }
    return {
        type: "text",
        ...UNTRANSFORMED,
        silent: true,
        style: { text, x: cx + shiftX, y: cy + shiftY, align: "center", verticalAlign: "middle", ...font, ...look }
    }
}
