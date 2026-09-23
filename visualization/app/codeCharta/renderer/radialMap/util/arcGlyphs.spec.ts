import { LabelArc, layOutGlyphsAlongArc } from "./arcGlyphs"

const GLYPH_WIDTH_PX = 10
const measureEvenly = (glyph: string) => glyph.length * GLYPH_WIDTH_PX
const TWELVE_O_CLOCK = -Math.PI / 2
const SIX_O_CLOCK = Math.PI / 2

function arcAt(midAngle: number, overrides: Partial<LabelArc> = {}): LabelArc {
    return { centreX: 0, centreY: 0, radiusPx: 100, midAngle, lengthPx: 200, ...overrides }
}

function angleOf({ x, y }: { x: number; y: number }): number {
    return Math.atan2(y, x)
}

describe("layOutGlyphsAlongArc", () => {
    it("should place every letter on the arc, centred on its middle", () => {
        // Act
        const glyphs = layOutGlyphsAlongArc("abc", arcAt(TWELVE_O_CLOCK), measureEvenly)

        // Assert
        expect(glyphs.map(({ glyph }) => glyph)).toEqual(["a", "b", "c"])
        for (const glyph of glyphs) {
            expect(Math.hypot(glyph.x, glyph.y)).toBeCloseTo(100)
        }
        expect(angleOf(glyphs[1])).toBeCloseTo(TWELVE_O_CLOCK)
        expect(glyphs[1].rotation).toBeCloseTo(0)
    })

    it("should read clockwise with the letters upright in the top half", () => {
        // Act
        const [first, , last] = layOutGlyphsAlongArc("abc", arcAt(TWELVE_O_CLOCK), measureEvenly)

        // Assert
        expect(first.x).toBeLessThan(last.x)
        expect(angleOf(first)).toBeLessThan(angleOf(last))
    })

    it("should read anticlockwise with the letters upright in the bottom half", () => {
        // Act
        const [first, middle, last] = layOutGlyphsAlongArc("abc", arcAt(SIX_O_CLOCK), measureEvenly)

        // Assert
        expect(first.x).toBeLessThan(last.x)
        expect(angleOf(first)).toBeGreaterThan(angleOf(last))
        expect(middle.rotation).toBeCloseTo(0)
    })

    it("should turn each letter with the arc, so neighbours lean towards the centre on either side", () => {
        // Act
        const [first, , last] = layOutGlyphsAlongArc("abc", arcAt(TWELVE_O_CLOCK), measureEvenly)

        // Assert
        expect(first.rotation).toBeGreaterThan(0)
        expect(last.rotation).toBeLessThan(0)
    })

    it("should cut a name that does not fit and end it with an ellipsis", () => {
        // Act
        const glyphs = layOutGlyphsAlongArc("abcdefgh", arcAt(TWELVE_O_CLOCK, { lengthPx: 45 }), measureEvenly)

        // Assert
        expect(glyphs.map(({ glyph }) => glyph).join("")).toBe("abc…")
    })

    it("should place nothing when not even one letter fits before the ellipsis", () => {
        // Act
        const glyphs = layOutGlyphsAlongArc("abc", arcAt(TWELVE_O_CLOCK, { lengthPx: 15 }), measureEvenly)

        // Assert
        expect(glyphs).toEqual([])
    })
})
