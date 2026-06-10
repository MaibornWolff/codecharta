import { render, screen } from "@testing-library/angular"
import { AxisColorRampComponent } from "./axisColorRamp.component"

describe("AxisColorRampComponent", () => {
    const mapColors = {
        positive: "#0f0",
        neutral: "#ff0",
        negative: "#f00"
    }

    function rgbToHex(rgb: string): string {
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
        if (!match) {
            return rgb
        }
        const toHex = (value: string) => Number.parseInt(value, 10).toString(16).padStart(2, "0")
        return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`
    }

    it("should render 12 bars colored by midpoint vs colorRange", async () => {
        // Arrange
        const values = Array.from({ length: 12 }, (_, i) => i)

        // Act
        await render(AxisColorRampComponent, {
            inputs: {
                values,
                min: 0,
                max: 12,
                colorRange: { from: 5, to: 10 },
                mapColors
            }
        })

        // Assert
        const bars = screen.getAllByTestId("axis-color-ramp-bar") as HTMLElement[]
        expect(bars).toHaveLength(12)

        // Each bin spans 1 unit; midpoints: 0.5, 1.5, ... 11.5
        // Below 5 → positive (#0f0)
        // Between 5 and 10 → neutral (#ff0)
        // Above 10 → negative (#f00)
        expect(rgbToHex(bars[0].style.backgroundColor)).toBe("#00ff00")
        expect(rgbToHex(bars[4].style.backgroundColor)).toBe("#00ff00")
        expect(rgbToHex(bars[5].style.backgroundColor)).toBe("#ffff00")
        expect(rgbToHex(bars[9].style.backgroundColor)).toBe("#ffff00")
        expect(rgbToHex(bars[10].style.backgroundColor)).toBe("#ff0000")
        expect(rgbToHex(bars[11].style.backgroundColor)).toBe("#ff0000")
    })

    it("should render a bin exactly at the thresholds with the same color its buildings have on the map", async () => {
        // Arrange: midpoints are 0.5, 1.5, ... so from/to land exactly on bin midpoints
        const values = Array.from({ length: 12 }, (_, i) => i)

        // Act
        await render(AxisColorRampComponent, {
            inputs: {
                values,
                min: 0,
                max: 12,
                colorRange: { from: 5.5, to: 9.5 },
                mapColors
            }
        })

        // Assert: the map classifies value < from as positive, value < to as neutral
        // and value >= to as negative — a bin exactly at `to` must be negative
        const bars = screen.getAllByTestId("axis-color-ramp-bar") as HTMLElement[]
        expect(rgbToHex(bars[4].style.backgroundColor)).toBe("#00ff00")
        expect(rgbToHex(bars[5].style.backgroundColor)).toBe("#ffff00")
        expect(rgbToHex(bars[8].style.backgroundColor)).toBe("#ffff00")
        expect(rgbToHex(bars[9].style.backgroundColor)).toBe("#ff0000")
    })

    it("should fall back to neutral color when colorRange is null", async () => {
        // Arrange
        const values = [0, 1, 2, 3]

        // Act
        await render(AxisColorRampComponent, {
            inputs: {
                values,
                min: 0,
                max: 3,
                colorRange: { from: null, to: null },
                mapColors
            }
        })

        // Assert
        const bars = screen.getAllByTestId("axis-color-ramp-bar") as HTMLElement[]
        for (const bar of bars) {
            expect(rgbToHex(bar.style.backgroundColor)).toBe("#ffff00")
        }
    })
})
