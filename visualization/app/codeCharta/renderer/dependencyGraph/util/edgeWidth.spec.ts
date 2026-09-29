import { edgeWidthPx } from "./edgeWidth"

const FEW_AND_MANY_DEPENDENCIES = [1, 64]

describe("edgeWidthPx", () => {
    it("should grow slowly with the dependencies an edge stands for, and stop growing at some point", () => {
        // Arrange
        const weights = [1, 2, 4, 1_000_000]

        // Act
        const widths = weights.map(weight => edgeWidthPx(weight, { thickness: "byCount", factor: 1 }))

        // Assert
        expect(widths).toEqual([1.2, 1.7, 2.2, 3.7])
    })

    it("should draw every edge as a hairline, whatever it stands for", () => {
        // Arrange
        const weights = FEW_AND_MANY_DEPENDENCIES

        // Act
        const widths = weights.map(weight => edgeWidthPx(weight, { thickness: "thin", factor: 1 }))

        // Assert
        expect(widths).toEqual([0.6, 0.6])
    })

    it("should draw every edge with the same width", () => {
        // Arrange
        const weights = FEW_AND_MANY_DEPENDENCIES

        // Act
        const widths = weights.map(weight => edgeWidthPx(weight, { thickness: "uniform", factor: 1 }))

        // Assert
        expect(widths).toEqual([1.6, 1.6])
    })

    it("should let strong edges grow twice as fast as by count, and twice as far", () => {
        // Arrange
        const weights = [1, 4, 1_000_000]

        // Act
        const widths = weights.map(weight => edgeWidthPx(weight, { thickness: "strong", factor: 1 }))

        // Assert
        expect(widths).toEqual([1.2, 3.2, 6.2])
    })

    it("should scale every width by the factor", () => {
        // Arrange
        const doubled = { thickness: "byCount", factor: 2 } as const

        // Act
        const width = edgeWidthPx(4, doubled)

        // Assert
        expect(width).toBe(4.4)
    })
})
