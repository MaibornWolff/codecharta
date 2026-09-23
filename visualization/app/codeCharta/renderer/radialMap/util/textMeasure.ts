import { MeasureGlyph } from "./arcGlyphs"

const FONT_FAMILY = "sans-serif"
const AVERAGE_GLYPH_WIDTH_SHARE_OF_FONT_SIZE = 0.6

const glyphWidths = new Map<string, number>()
let measuringContext: CanvasRenderingContext2D | null | undefined

export function measureGlyphsIn(fontWeight: string, fontSizePx: number): MeasureGlyph {
    const font = `${fontWeight} ${fontSizePx}px ${FONT_FAMILY}`
    return glyph => {
        const key = `${font}|${glyph}`
        const cached = glyphWidths.get(key)
        if (cached !== undefined) {
            return cached
        }
        const width = widthOf(glyph, font, fontSizePx)
        glyphWidths.set(key, width)
        return width
    }
}

function widthOf(text: string, font: string, fontSizePx: number): number {
    measuringContext ??= document.createElement("canvas").getContext("2d")
    if (!measuringContext) {
        return text.length * fontSizePx * AVERAGE_GLYPH_WIDTH_SHARE_OF_FONT_SIZE
    }
    measuringContext.font = font
    return measuringContext.measureText(text).width
}
