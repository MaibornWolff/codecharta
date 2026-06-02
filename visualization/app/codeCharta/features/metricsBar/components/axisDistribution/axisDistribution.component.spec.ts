import { render, screen } from "@testing-library/angular"
import { AxisDistributionComponent } from "./axisDistribution.component"

describe("AxisDistributionComponent", () => {
    it("should render 12 bars", async () => {
        // Arrange
        const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

        // Act
        await render(AxisDistributionComponent, { inputs: { values } })

        // Assert
        const bars = screen.getAllByTestId("axis-distribution-bar")
        expect(bars).toHaveLength(12)
    })

    it("should render bars with computed heights matching histogramBins output", async () => {
        // Arrange
        const values = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100]

        // Act
        await render(AxisDistributionComponent, { inputs: { values } })

        // Assert
        const bars = screen.getAllByTestId("axis-distribution-bar") as HTMLElement[]
        // First bin holds 10 zeros → 100% height
        expect(bars[0].style.height).toBe("100%")
        // Middle bars should be 0%
        expect(bars[1].style.height).toBe("0%")
        // Last bar holds the outlier → sqrt(1)/sqrt(10) ≈ 0.316
        const lastHeight = Number.parseFloat(bars[bars.length - 1].style.height)
        expect(lastHeight).toBeGreaterThan(0)
        expect(lastHeight).toBeLessThan(100)
    })

    it("should render 12 zero-height bars when values is empty", async () => {
        // Arrange
        const values: number[] = []

        // Act
        await render(AxisDistributionComponent, { inputs: { values } })

        // Assert
        const bars = screen.getAllByTestId("axis-distribution-bar") as HTMLElement[]
        expect(bars).toHaveLength(12)
        expect(bars.every(bar => bar.style.height === "0%")).toBe(true)
    })
})
