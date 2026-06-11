import { formatMetricNumber } from "./formatMetricNumber"

describe("formatMetricNumber", () => {
    it("should format numbers with thousands separators", () => {
        // Arrange & Act
        const result = formatMetricNumber(4208)

        // Assert
        expect(result).toBe("4,208")
    })

    it("should keep fractional values readable", () => {
        // Arrange & Act
        const result = formatMetricNumber(0.5)

        // Assert
        expect(result).toBe("0.5")
    })

    it("should return a placeholder for missing values", () => {
        // Arrange & Act
        const result = formatMetricNumber(undefined)

        // Assert
        expect(result).toBe("-")
    })

    it("should return a placeholder for NaN values", () => {
        // Arrange & Act
        const result = formatMetricNumber(Number.NaN)

        // Assert
        expect(result).toBe("-")
    })
})
