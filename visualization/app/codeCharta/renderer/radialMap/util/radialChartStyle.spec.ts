import { borderWidthThatFits, pieceAnimation, pieceBorder, ringWidth, TRANSITION_MS } from "./radialChartStyle"

const WHITE_BORDER = { color: "#ffffff", widthPx: 1 }

describe("radialChartStyle", () => {
    it("should fade the hover gently and move the pieces on a map of up to two thousand pieces", () => {
        // Act
        const animation = pieceAnimation(2000)

        // Assert
        expect(animation.stateAnimation.duration).toBeGreaterThanOrEqual(500)
        expect(animation.animationThreshold).toBe(Number.POSITIVE_INFINITY)
        expect(animation.animationDurationUpdate).toBe(TRANSITION_MS)
    })

    it("should keep fading the hover but stop moving the pieces on a bigger map", () => {
        // Act
        const animation = pieceAnimation(2001)

        // Assert
        expect(animation.stateAnimation.duration).toBeGreaterThanOrEqual(500)
        expect(animation.animationThreshold).toBe(Number.POSITIVE_INFINITY)
        expect(animation.animationDurationUpdate).toBe(0)
        expect(animation.animationDuration).toBe(0)
    })

    it("should keep a border on a shape a few borders wide", () => {
        // Act
        const widths = [borderWidthThatFits(1, 4), borderWidthThatFits(1, 3.9)]

        // Assert
        expect(widths).toEqual([1, 0])
    })

    it("should keep the white border on a piece wide enough for it", () => {
        // Act
        const border = pieceBorder("#69ae40", WHITE_BORDER, 10)

        // Assert
        expect(border).toBe(WHITE_BORDER)
    })

    it("should outline a sliver in its own colour, bleeding over the antialiasing gaps", () => {
        // Act
        const border = pieceBorder("#69ae40", WHITE_BORDER, 0.2)

        // Assert
        expect(border).toEqual({ color: "#69ae40", widthPx: 1 })
    })

    it("should share the room between the centre and the rim evenly among the rings", () => {
        // Act
        const widths = [1, 3].map(ringCount => ringWidth(ringCount))

        // Assert
        expect(widths).toEqual([0.75, 0.25])
    })
})
