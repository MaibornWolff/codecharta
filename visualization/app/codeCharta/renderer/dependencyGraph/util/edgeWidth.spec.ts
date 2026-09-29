import { edgeWidthPx } from "./edgeWidth"

describe("edgeWidthPx", () => {
    it("should grow slowly with the dependencies an edge stands for, and stop growing at some point", () => {
        // Act
        const widths = [1, 2, 4, 1_000_000].map(weight => edgeWidthPx(weight, { thickness: "byCount", factor: 1 }))

        // Assert
        expect(widths).toEqual([1.2, 1.7, 2.2, 3.7])
    })

    it("should draw every edge as a hairline, whatever it stands for", () => {
        // Act
        const widths = [1, 64].map(weight => edgeWidthPx(weight, { thickness: "thin", factor: 1 }))

        // Assert
        expect(widths).toEqual([0.6, 0.6])
    })

    it("should draw every edge with the same width", () => {
        // Act
        const widths = [1, 64].map(weight => edgeWidthPx(weight, { thickness: "uniform", factor: 1 }))

        // Assert
        expect(widths).toEqual([1.6, 1.6])
    })

    it("should let strong edges grow twice as fast as by count, and twice as far", () => {
        // Act
        const widths = [1, 4, 1_000_000].map(weight => edgeWidthPx(weight, { thickness: "strong", factor: 1 }))

        // Assert
        expect(widths).toEqual([1.2, 3.2, 6.2])
    })

    it("should scale every width by the factor", () => {
        // Act
        const width = edgeWidthPx(4, { thickness: "byCount", factor: 2 })

        // Assert
        expect(width).toBe(4.4)
    })
})
