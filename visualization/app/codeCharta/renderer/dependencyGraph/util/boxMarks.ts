import { DeclarationShape, declarationKindLookOf, KIND_ICON_COLORS } from "./declarationKinds"
import { UNTRANSFORMED } from "./dependencyGraphElements"
import { FILE_FILL, FILE_STROKE, MOVED_COLOR, QUIET_BADGE_COLOR } from "./dependencyGraphStyle"
import { Rectangle } from "./geometry"
import { LayoutBox } from "./levelizedLayout"

export interface CycleLook {
    /** The cycles a closed box hides; none draws no badge. */
    hiddenCount: number
    /** A declaration taking part in a cycle. */
    isInCycle: boolean
    color: string
}

/** How a mark inside a box is drawn: as faded as its box, and as much smaller as the zoom makes the box. */
export interface MarkLook {
    opacity: number
    scale: number
}

const KIND_ICON = { radiusPx: 7, centreInsetPx: 14, fontSizePx: 10, lineWidthPx: 0.8 }
/** What the icon takes from the room for a declaration's name. */
export const KIND_ICON_WIDTH_PX = 18
const HEXAGON = { maxNotchPx: 8, heightsPerNotch: 2.5 }
const INNER_FRAME = { insetPx: 2.5, cornerRadiusPx: 1.5 }
const COUNT_BADGE = { radiusPx: 7, centreInsetPx: 14, fontSizePx: 10 }
const CYCLE_BADGE = {
    heightPx: 15,
    overhangPx: 6,
    risePx: 9,
    outlinePx: 1.2,
    fontSizePx: 10,
    numberLeftPx: 17,
    numberRoomPx: 5,
    digitWidthPx: 6
}
const CYCLE_BADGE_TEXT_COLOR = "#ffffff"
const MOST_COUNTED = 99
const CYCLE_GLYPH = { arc: "M2.9 1.7A3.4 3.4 0 1 1 1.7-2.9", head: "M4.1-1.5L2.8-5.1L.3-1.2z", lineWidthPx: 1.5 }
const CYCLE_RING = { radiusPx: 3.5, lineWidthPx: 2, insetPx: 1 }
const MOVED_OUTLINE = { outsetPx: 3, cornerRadiusPx: 6, lineWidthPx: 1.4, dash: [5, 3] }

/** What a click on a box's cycle badge carries, to tell it from a click on the box. */
export const CYCLE_BADGE_INFO = "cycleBadge"

export function outlineOf(rect: Rectangle, shape: DeclarationShape, cornerRadiusPx: number) {
    if (shape !== "hexagon") {
        return { type: "rect", shape: { ...rect, r: cornerRadiusPx } }
    }
    const notch = Math.min(HEXAGON.maxNotchPx, rect.height / HEXAGON.heightsPerNotch)
    const { x: left, y: top } = rect
    const right = left + rect.width
    const bottom = top + rect.height
    const middle = top + rect.height / 2
    const points = [
        [left + notch, top],
        [right - notch, top],
        [right, middle],
        [right - notch, bottom],
        [left + notch, bottom],
        [left, middle]
    ]
    return { type: "polygon", shape: { points } }
}

export function drawInnerFrame(rect: Rectangle, opacity: number) {
    const inset = INNER_FRAME.insetPx
    const shape = {
        x: rect.x + inset,
        y: rect.y + inset,
        width: rect.width - 2 * inset,
        height: rect.height - 2 * inset,
        r: INNER_FRAME.cornerRadiusPx
    }
    return { type: "rect", ...UNTRANSFORMED, silent: true, shape, style: { fill: null, stroke: FILE_STROKE, lineWidth: 1, opacity } }
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

const LISTED_LEVEL = { insetPx: 7, fontSizePx: 10 }
/** What the level takes from the room for a listed declaration's name. */
export const LISTED_LEVEL_WIDTH_PX = 12

export function drawListedLevel(box: LayoutBox, rect: Rectangle, { opacity, scale }: MarkLook): object[] {
    if (box.listedLevel === undefined) {
        return []
    }
    const style = {
        text: String(box.listedLevel),
        x: rect.x + rect.width - LISTED_LEVEL.insetPx * scale,
        y: rect.y + rect.height / 2,
        align: "right",
        verticalAlign: "middle",
        fontSize: LISTED_LEVEL.fontSizePx * scale,
        fill: QUIET_BADGE_COLOR,
        opacity
    }
    return [{ type: "text", ...UNTRANSFORMED, silent: true, style }]
}

/** A closed file says how many declarations it holds once there is more than the one its name stands for. */
export function drawDeclarationCount(box: LayoutBox, rect: Rectangle, { opacity, scale }: MarkLook): object[] {
    if (box.isExpanded || box.declarationCount < 2) {
        return []
    }
    const centre = { cx: rect.x + rect.width - COUNT_BADGE.centreInsetPx * scale, cy: rect.y + rect.height / 2 }
    const disc = { fill: FILE_FILL, stroke: QUIET_BADGE_COLOR, lineWidth: 1, opacity }
    return [
        { type: "circle", ...UNTRANSFORMED, silent: true, shape: { ...centre, r: COUNT_BADGE.radiusPx * scale }, style: disc },
        centredText(String(box.declarationCount), centre, { fontSize: COUNT_BADGE.fontSizePx * scale, fill: QUIET_BADGE_COLOR, opacity })
    ]
}

export interface CycleMarkLook {
    opacity: number
    /** How many pixels a layout unit takes. */
    zoom: number
}

/** A cycle mark leads the reader to a cycle from far out, so it shrinks with the graph only this far. */
const SMALLEST_CYCLE_MARK_SCALE = 0.7

/** Both sit on the box's upper right corner: the badge of a closed box, the ring of a declaration. */
export function drawCycleMark(
    box: LayoutBox,
    rect: Rectangle,
    { hiddenCount, isInCycle, color }: CycleLook,
    { opacity, zoom }: CycleMarkLook
): object[] {
    const scale = Math.max(SMALLEST_CYCLE_MARK_SCALE, Math.min(1, zoom))
    if (box.kind === "declaration") {
        const centre = { cx: rect.x + rect.width - CYCLE_RING.insetPx, cy: rect.y + CYCLE_RING.insetPx }
        const style = { fill: FILE_FILL, stroke: color, lineWidth: CYCLE_RING.lineWidthPx * scale, opacity }
        const ring = { type: "circle", ...UNTRANSFORMED, silent: true, shape: { ...centre, r: CYCLE_RING.radiusPx * scale }, style }
        return isInCycle ? [ring] : []
    }
    return box.isExpanded || hiddenCount === 0 ? [] : drawCycleBadge(rect, hiddenCount, { color, opacity, scale })
}

/** A pill with the sign of a cycle, and the count once it hides more than one. */
function drawCycleBadge(
    rect: Rectangle,
    count: number,
    { color, opacity, scale }: { color: string; opacity: number; scale: number }
): object[] {
    const text = count > MOST_COUNTED ? `${MOST_COUNTED}+` : String(count)
    const height = CYCLE_BADGE.heightPx * scale
    const numberLeft = CYCLE_BADGE.numberLeftPx * scale
    const width = count > 1 ? numberLeft + (text.length * CYCLE_BADGE.digitWidthPx + CYCLE_BADGE.numberRoomPx) * scale : height
    const left = rect.x + rect.width + CYCLE_BADGE.overhangPx * scale - width
    const top = rect.y - CYCLE_BADGE.risePx * scale
    const part = { info: CYCLE_BADGE_INFO, cursor: "pointer" }
    const pill = { x: left, y: top, width, height, r: height / 2 }
    const pillStyle = { fill: color, stroke: CYCLE_BADGE_TEXT_COLOR, lineWidth: CYCLE_BADGE.outlinePx, opacity }
    const glyphAt = { ...UNTRANSFORMED, x: left + height / 2, y: top + height / 2, scaleX: scale, scaleY: scale, silent: true }
    const glyphLine = { fill: null, stroke: CYCLE_BADGE_TEXT_COLOR, lineWidth: CYCLE_GLYPH.lineWidthPx, lineCap: "round", opacity }
    const number = {
        type: "text",
        ...UNTRANSFORMED,
        ...part,
        style: {
            text,
            x: left + numberLeft,
            y: top + height / 2,
            align: "left",
            verticalAlign: "middle",
            fontSize: CYCLE_BADGE.fontSizePx * scale,
            fontWeight: "bold",
            fill: CYCLE_BADGE_TEXT_COLOR,
            opacity
        }
    }
    return [
        { type: "rect", ...UNTRANSFORMED, ...part, shape: pill, style: pillStyle },
        { type: "path", ...glyphAt, shape: { pathData: CYCLE_GLYPH.arc }, style: glyphLine },
        { type: "path", ...glyphAt, shape: { pathData: CYCLE_GLYPH.head }, style: { fill: CYCLE_BADGE_TEXT_COLOR, stroke: null, opacity } },
        ...(count > 1 ? [number] : [])
    ]
}

/** Drawn around the box rather than on its border, which keeps saying whether the box is selected. */
export function drawMovedOutline(rect: Rectangle, opacity: number) {
    const { outsetPx, cornerRadiusPx, lineWidthPx, dash } = MOVED_OUTLINE
    const shape = {
        x: rect.x - outsetPx,
        y: rect.y - outsetPx,
        width: rect.width + 2 * outsetPx,
        height: rect.height + 2 * outsetPx,
        r: cornerRadiusPx
    }
    return {
        type: "rect",
        ...UNTRANSFORMED,
        silent: true,
        shape,
        style: { fill: null, stroke: MOVED_COLOR, lineWidth: lineWidthPx, lineDash: dash, opacity }
    }
}

interface TextLook {
    fontSize: number
    fill: string
    opacity: number
}

function centredText(text: string, { cx, cy }: { cx: number; cy: number }, look: TextLook) {
    return {
        type: "text",
        ...UNTRANSFORMED,
        silent: true,
        style: { text, x: cx, y: cy, align: "center", verticalAlign: "middle", fontWeight: "bold", ...look }
    }
}
