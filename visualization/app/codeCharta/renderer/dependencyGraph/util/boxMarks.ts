import { DependencyBoxBadge, DependencyEdgeColors, LineStyleMeaning } from "../../../model/dependencyGraph.model"
import { declarationKindLookOf, KIND_ICON_COLORS } from "./declarationKinds"
import { CLICKABLE, UNTRANSFORMED } from "./dependencyGraphElements"
import { CYCLE_MARK_COLOR, FILE_FILL, QUIET_BADGE_COLOR } from "./dependencyGraphStyle"
import { Rectangle } from "./geometry"
import { inkCentreShiftOf, MARK_FONT_FAMILY } from "./inkCentre"
import { LayoutBox } from "./layoutModel"
import { isDashedEdgeType } from "./lineStyle"

export interface BadgeLook {
    /** The cycles that stay within single files a closed box hides; none draws no badge. */
    insideFilesCount: number
    /** The cycles between different files that run through the box; none draws no badge. */
    betweenFilesCount: number
    isInCycle: boolean
    /** The upward dependencies a box hides; none draws no badge. */
    upwardCount: number
    upwardLine: UpwardLine
}

/** The upward badge is outlined as the upward edges are drawn: in their colour, and dashed while they are. */
export interface UpwardLine {
    color: string
    isDashed: boolean
}

export function upwardLineOf(edgeColors: DependencyEdgeColors, lineStyleShows: LineStyleMeaning): UpwardLine {
    return { color: edgeColors.feedbackContainerLevel, isDashed: isDashedEdgeType("feedbackContainerLevel", lineStyleShows) }
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
const BADGE_PILL = {
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

interface BadgeColors {
    fill: string
    line: string
}

interface BadgeGlyph {
    line: string
    head: string
    lineWidthPx: number
}

export interface PillLook {
    colors: BadgeColors
    glyph: BadgeGlyph
    lineDash: number[] | null
}

interface BadgeDesign extends PillLook {
    info: string
}

const BADGE_CONTRAST_COLOR = "#ffffff"
const MARK_FONT_WEIGHT = "bold"
const MOST_COUNTED = 99
/** Drawn around its own centre, as is the arrow up. */
const CYCLE_GLYPH: BadgeGlyph = { line: "M2.9 1.7A3.4 3.4 0 1 1 1.7-2.9", head: "M4.1-1.5L2.8-5.1L.3-1.2z", lineWidthPx: 1.5 }
const UPWARD_GLYPH: BadgeGlyph = { line: "M0 4.4V-1.2", head: "M-3.3-.6L0-4.7L3.3-.6z", lineWidthPx: 1.5 }
/** Shorter than the dashes of an upward edge, so the short outline of a badge still reads as dashed. */
const BADGE_DASH = [3, 2]
const CYCLE_RING = { radiusPx: 3.5, lineWidthPx: 2, insetPx: 1 }

export type CycleMarkKind = Exclude<DependencyBoxBadge, "upward">

export const CYCLE_MARK_KINDS: readonly CycleMarkKind[] = ["betweenFiles", "insideFiles", "declaration"]

type PillKind = Exclude<DependencyBoxBadge, "declaration">

/** Filled for the cycles between files, outlined for those within a file: a cycle across files is the wider
 * tangle, so wherever the two are told together it comes first. */
export const CYCLE_MARK_COLORS: Record<CycleMarkKind, BadgeColors> = {
    insideFiles: { fill: BADGE_CONTRAST_COLOR, line: CYCLE_MARK_COLOR },
    betweenFiles: { fill: CYCLE_MARK_COLOR, line: BADGE_CONTRAST_COLOR },
    declaration: { fill: FILE_FILL, line: CYCLE_MARK_COLOR }
}

const SAMPLE_COUNT = "2"

/** The sizes the marks are drawn in, for a sample of one outside the graph. */
export const BOX_BADGE_SAMPLE = {
    count: SAMPLE_COUNT,
    widthPx: BADGE_PILL.numberLeftPx + SAMPLE_COUNT.length * BADGE_PILL.digitWidthPx + BADGE_PILL.numberRoomPx,
    heightPx: BADGE_PILL.heightPx,
    outlinePx: BADGE_PILL.outlinePx,
    numberLeftPx: BADGE_PILL.numberLeftPx,
    fontSizePx: BADGE_PILL.fontSizePx,
    fontWeight: MARK_FONT_WEIGHT,
    fontFamily: MARK_FONT_FAMILY,
    ringRadiusPx: CYCLE_RING.radiusPx,
    ringLineWidthPx: CYCLE_RING.lineWidthPx
}

export const BOX_BADGE_LEGEND: readonly { mark: DependencyBoxBadge; label: string }[] = [
    { mark: "betweenFiles", label: "Cycles between files" },
    { mark: "insideFiles", label: "Cycles inside a file" },
    { mark: "declaration", label: "Declaration in a cycle" },
    { mark: "upward", label: "Upward dependencies inside" }
]

/** What a click on a box's badge carries, to tell it from a click on the box. */
export const CYCLE_BADGE_INFO = "cycleBadge"
export const UPWARD_BADGE_INFO = "upwardBadge"

export function pillLookOf(mark: PillKind, { color, isDashed }: UpwardLine): PillLook {
    if (mark === "upward") {
        return { colors: { fill: BADGE_CONTRAST_COLOR, line: color }, glyph: UPWARD_GLYPH, lineDash: isDashed ? BADGE_DASH : null }
    }
    return { colors: CYCLE_MARK_COLORS[mark], glyph: CYCLE_GLYPH, lineDash: null }
}

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

export interface BadgeMarkLook {
    opacity: number
    zoom: number
}

/** A cycle mark leads the reader to a cycle from far out, so it shrinks with the graph only this far. */
const SMALLEST_BADGE_SCALE = 0.7

export function drawBadges(box: LayoutBox, rect: Rectangle, badges: BadgeLook, { opacity, zoom }: BadgeMarkLook): object[] {
    const mark = { opacity, scale: Math.max(SMALLEST_BADGE_SCALE, Math.min(1, zoom)) }
    if (box.kind === "declaration") {
        return badges.isInCycle ? [drawCycleRing(rect, mark)] : []
    }
    return drawCountBadges(rect, badges, mark)
}

function drawCycleRing(rect: Rectangle, { opacity, scale }: MarkLook): object {
    const centre = { cx: rect.x + rect.width - CYCLE_RING.insetPx, cy: rect.y + CYCLE_RING.insetPx }
    const { fill, line } = CYCLE_MARK_COLORS.declaration
    const style = { fill, stroke: line, lineWidth: CYCLE_RING.lineWidthPx * scale, opacity }
    return { type: "circle", ...UNTRANSFORMED, silent: true, shape: { ...centre, r: CYCLE_RING.radiusPx * scale }, style }
}

/** Read from the left, the badges tell the cycles between files, those inside files, then the upward dependencies,
 * which hang over the upper right corner; a badge without a count leaves its place to the next. */
function drawCountBadges(rect: Rectangle, badges: BadgeLook, mark: MarkLook): object[] {
    const corner = { right: rect.x + rect.width + BADGE_PILL.overhangPx * mark.scale, top: rect.y - BADGE_PILL.risePx * mark.scale }
    const designOf = (mark: PillKind, info: string): BadgeDesign => ({ ...pillLookOf(mark, badges.upwardLine), info })
    const upward = drawCountBadge(corner, badges.upwardCount, designOf("upward", UPWARD_BADGE_INFO), mark)
    const insideFilesCorner = { ...corner, right: upward.rightOfNextBadge }
    const insideFiles = drawCountBadge(insideFilesCorner, badges.insideFilesCount, designOf("insideFiles", CYCLE_BADGE_INFO), mark)
    const betweenFilesCorner = { ...corner, right: insideFiles.rightOfNextBadge }
    const betweenFiles = drawCountBadge(betweenFilesCorner, badges.betweenFilesCount, designOf("betweenFiles", CYCLE_BADGE_INFO), mark)
    return [...betweenFiles.elements, ...insideFiles.elements, ...upward.elements]
}

interface BadgeCorner {
    right: number
    top: number
}

interface DrawnBadge {
    rightOfNextBadge: number
    elements: object[]
}

function drawCountBadge({ right, top }: BadgeCorner, count: number, design: BadgeDesign, mark: MarkLook): DrawnBadge {
    if (count === 0) {
        return { rightOfNextBadge: right, elements: [] }
    }
    const { colors, glyph, lineDash, info } = design
    const { opacity, scale } = mark
    const text = count > MOST_COUNTED ? `${MOST_COUNTED}+` : String(count)
    const height = BADGE_PILL.heightPx * scale
    const numberLeft = BADGE_PILL.numberLeftPx * scale
    const width = numberLeft + (text.length * BADGE_PILL.digitWidthPx + BADGE_PILL.numberRoomPx) * scale
    const left = right - width
    const pill = { x: left, y: top, width, height, r: height / 2 }
    const pillStyle = { fill: colors.fill, stroke: colors.line, lineWidth: BADGE_PILL.outlinePx, lineDash, opacity }
    const middle = top + height / 2
    const badgePart = { info, ...CLICKABLE }
    const elements = [
        { type: "rect", ...UNTRANSFORMED, ...badgePart, shape: pill, style: pillStyle },
        ...badgeGlyph(glyph, { x: left + height / 2, y: middle }, colors.line, mark),
        { ...badgeCount(text, { x: left + numberLeft, y: middle }, colors.line, mark), ...badgePart }
    ]
    return { rightOfNextBadge: left - BADGE_PILL.gapPx * scale, elements }
}

function badgeGlyph(glyph: BadgeGlyph, centre: { x: number; y: number }, color: string, { opacity, scale }: MarkLook): object[] {
    const placed = { ...UNTRANSFORMED, ...centre, scaleX: scale, scaleY: scale, silent: true }
    const line = { fill: null, stroke: color, lineWidth: glyph.lineWidthPx, lineCap: "round", opacity }
    return [
        { type: "path", ...placed, shape: { pathData: glyph.line }, style: line },
        { type: "path", ...placed, shape: { pathData: glyph.head }, style: { fill: color, stroke: null, opacity } }
    ]
}

function badgeCount(text: string, leftMiddle: { x: number; y: number }, color: string, { opacity, scale }: MarkLook) {
    const fontSize = BADGE_PILL.fontSizePx * scale
    const [, shiftY] = inkCentreShiftOf(text, MARK_FONT_WEIGHT, fontSize)
    const look = { align: "left", verticalAlign: "middle", fontSize, fontWeight: MARK_FONT_WEIGHT, fontFamily: MARK_FONT_FAMILY }
    return {
        type: "text",
        ...UNTRANSFORMED,
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
