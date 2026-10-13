import { Point } from "./geometry"

/** The font the marks are drawn in, named so that what is measured is what is drawn. */
export const MARK_FONT_FAMILY = "sans-serif"

const REFERENCE_FONT_SIZE_PX = 100
const NO_SHIFT: Point = [0, 0]
const shiftsAtReferenceSize = new Map<string, Point>()
let measuringContext: CanvasRenderingContext2D | null | undefined

/** How far to move a text that a canvas centres on a point so that its ink is centred there. A canvas centres
 * the room a font keeps for any letter, and where a digit or a capital sits in that room differs from font to
 * font, so a mark sat off the middle of its disc on one screen and not on another. */
export function inkCentreShiftOf(text: string, fontWeight: string, fontSizePx: number): Point {
    const key = `${fontWeight}|${text}`
    const atReferenceSize = shiftsAtReferenceSize.get(key) ?? measuredShiftOf(text, fontWeight)
    shiftsAtReferenceSize.set(key, atReferenceSize)
    const scale = fontSizePx / REFERENCE_FONT_SIZE_PX
    return [atReferenceSize[0] * scale, atReferenceSize[1] * scale]
}

function measuredShiftOf(text: string, fontWeight: string): Point {
    measuringContext ??= document.createElement("canvas").getContext("2d")
    if (!measuringContext) {
        return NO_SHIFT
    }
    measuringContext.font = `${fontWeight} ${REFERENCE_FONT_SIZE_PX}px ${MARK_FONT_FAMILY}`
    measuringContext.textAlign = "center"
    measuringContext.textBaseline = "middle"
    const ink = measuringContext.measureText(text)
    const shift: Point = [
        (ink.actualBoundingBoxLeft - ink.actualBoundingBoxRight) / 2,
        (ink.actualBoundingBoxAscent - ink.actualBoundingBoxDescent) / 2
    ]
    return shift.every(Number.isFinite) ? shift : NO_SHIFT
}
