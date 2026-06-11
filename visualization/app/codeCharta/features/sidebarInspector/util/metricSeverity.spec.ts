import { calculateMetricBar } from "./metricSeverity"

describe("calculateMetricBar", () => {
    it("should return success severity when value is in the lower third of the range", () => {
        // Arrange & Act
        const result = calculateMetricBar(10, 0, 100)

        // Assert
        expect(result).toEqual({ fraction: 0.1, severity: "success" })
    })

    it("should return warning severity when value is in the middle third of the range", () => {
        // Arrange & Act
        const result = calculateMetricBar(50, 0, 100)

        // Assert
        expect(result).toEqual({ fraction: 0.5, severity: "warning" })
    })

    it("should return error severity when value is in the upper third of the range", () => {
        // Arrange & Act
        const result = calculateMetricBar(90, 0, 100)

        // Assert
        expect(result).toEqual({ fraction: 0.9, severity: "error" })
    })

    it("should invert severity for higher-is-better metrics while keeping the bar length", () => {
        // Arrange & Act
        const result = calculateMetricBar(90, 0, 100, 1)

        // Assert
        expect(result).toEqual({ fraction: 0.9, severity: "success" })
    })

    it("should treat low values of higher-is-better metrics as error", () => {
        // Arrange & Act
        const result = calculateMetricBar(10, 0, 100, 1)

        // Assert
        expect(result).toEqual({ fraction: 0.1, severity: "error" })
    })

    it("should clamp values above the maximum to a full bar", () => {
        // Arrange & Act
        const result = calculateMetricBar(150, 0, 100)

        // Assert
        expect(result).toEqual({ fraction: 1, severity: "error" })
    })

    it("should clamp values below the minimum to an empty bar", () => {
        // Arrange & Act
        const result = calculateMetricBar(-10, 0, 100)

        // Assert
        expect(result).toEqual({ fraction: 0, severity: "success" })
    })

    it("should return a neutral full bar when the range is degenerate", () => {
        // Arrange & Act
        const result = calculateMetricBar(5, 3, 3)

        // Assert
        expect(result).toEqual({ fraction: 1, severity: "neutral" })
    })

    it("should return a neutral full bar when the range is unknown", () => {
        // Arrange & Act
        const result = calculateMetricBar(5, undefined, undefined)

        // Assert
        expect(result).toEqual({ fraction: 1, severity: "neutral" })
    })
})
