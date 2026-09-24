import { QUARTER_TURN } from "./radialChartStyle"

const ELLIPSIS = "…"

export type MeasureGlyph = (glyph: string) => number

/** The circle a name follows, with `midAngle` in radians clockwise from three o'clock, as the canvas turns. */
export interface LabelArc {
    centreX: number
    centreY: number
    radiusPx: number
    midAngle: number
    lengthPx: number
}

export interface PlacedGlyph {
    glyph: string
    x: number
    y: number
    rotation: number
}

// Upright both ways: in the top half the name runs clockwise with the letters standing on the arc, in the bottom
// half anticlockwise with them hanging from it.
export function layOutGlyphsAlongArc(text: string, arc: LabelArc, measure: MeasureGlyph): PlacedGlyph[] {
    const glyphs = glyphsThatFit([...text], arc.lengthPx, measure)
    const widths = glyphs.map(glyph => measure(glyph))
    const readsClockwise = Math.sin(arc.midAngle) < 0
    const direction = readsClockwise ? 1 : -1
    let distanceFromMiddle = -sumOf(widths) / 2
    return glyphs.map((glyph, index) => {
        const angle = arc.midAngle + (direction * (distanceFromMiddle + widths[index] / 2)) / arc.radiusPx
        distanceFromMiddle += widths[index]
        return {
            glyph,
            x: arc.centreX + arc.radiusPx * Math.cos(angle),
            y: arc.centreY + arc.radiusPx * Math.sin(angle),
            rotation: readsClockwise ? -(angle + QUARTER_TURN) : QUARTER_TURN - angle
        }
    })
}

function glyphsThatFit(glyphs: string[], lengthPx: number, measure: MeasureGlyph): string[] {
    const widths = glyphs.map(glyph => measure(glyph))
    if (sumOf(widths) <= lengthPx) {
        return glyphs
    }
    const roomBeforeTheEllipsis = lengthPx - measure(ELLIPSIS)
    let kept = 0
    let usedPx = 0
    while (kept < glyphs.length && usedPx + widths[kept] <= roomBeforeTheEllipsis) {
        usedPx += widths[kept]
        kept++
    }
    return kept === 0 ? [] : [...glyphs.slice(0, kept), ELLIPSIS]
}

function sumOf(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0)
}
