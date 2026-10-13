import { Point } from "./geometry"

/** The font the marks are drawn in, named so that what is measured is what is drawn. */
export const MARK_FONT_FAMILY = "sans-serif"

const REFERENCE_FONT_SIZE_PX = 100
const NO_SHIFT: Point = [0, 0]

export type InkCentreShiftOf = (text: string, fontWeight: string, fontSizePx: number) => Point

/** How far to move a text that a canvas centres on a point so that its ink is centred there. A canvas centres
 * the room a font keeps for any letter, and where a digit or a capital sits in that room differs from font to
 * font, so the canvas's own centring leaves a mark off the middle of its disc. A text is measured once, at one
 * size, and the shift scaled to the size it is drawn at. */
export function createInkMeasurer(context: Pick<CanvasRenderingContext2D, "measureText" | "font" | "textAlign" | "textBaseline"> | null) {
    const shiftsAtReferenceSize = new Map<string, Point>()
    return (text: string, fontWeight: string, fontSizePx: number): Point => {
        const key = `${fontWeight}|${text}`
        const atReferenceSize = shiftsAtReferenceSize.get(key) ?? measuredShiftOf(context, text, fontWeight)
        shiftsAtReferenceSize.set(key, atReferenceSize)
        const scale = fontSizePx / REFERENCE_FONT_SIZE_PX
        return [atReferenceSize[0] * scale, atReferenceSize[1] * scale]
    }
}

let measureOnTheDocument: InkCentreShiftOf | undefined

export const inkCentreShiftOf: InkCentreShiftOf = (text, fontWeight, fontSizePx) => {
    measureOnTheDocument ??= createInkMeasurer(document.createElement("canvas").getContext("2d"))
    return measureOnTheDocument(text, fontWeight, fontSizePx)
}

function measuredShiftOf(context: Parameters<typeof createInkMeasurer>[0], text: string, fontWeight: string): Point {
    if (!context) {
        return NO_SHIFT
    }
    context.font = `${fontWeight} ${REFERENCE_FONT_SIZE_PX}px ${MARK_FONT_FAMILY}`
    context.textAlign = "center"
    context.textBaseline = "middle"
    const ink = context.measureText(text)
    const shift: Point = [
        (ink.actualBoundingBoxLeft - ink.actualBoundingBoxRight) / 2,
        (ink.actualBoundingBoxAscent - ink.actualBoundingBoxDescent) / 2
    ]
    // A canvas that reports no ink bounds, as the one of the tests, leaves the text where it is.
    const isMeasured = shift.every(Number.isFinite)
    return isMeasured ? shift : NO_SHIFT
}
