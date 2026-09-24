import { borderWidthThatFits, pieceBorder, ringWidth } from "./radialChartStyle"

const WHITE_BORDER = { color: "#ffffff", widthPx: 1 }

describe("radialChartStyle", () => {
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
