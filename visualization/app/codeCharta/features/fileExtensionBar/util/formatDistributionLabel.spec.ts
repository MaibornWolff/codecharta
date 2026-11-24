import { MetricDistribution } from "../../../util/fileExtension/fileExtensionCalculator"
import { formatDistributionLabel, formatDistributionValue } from "./formatDistributionLabel"

describe("formatDistributionLabel", () => {
    const item: MetricDistribution = { fileExtension: "ts", absoluteMetricValue: 1120, relativeMetricValue: 12.345, color: "#fff" }

    it("should format the relative value as a percentage", () => {
        // Arrange
        const showAbsoluteValues = false

        // Act
        const label = formatDistributionLabel(item, showAbsoluteValues)

        // Assert
        expect(label).toBe("ts 12.35%")
    })

    it("should format the absolute value with thousands separators", () => {
        // Arrange
        const showAbsoluteValues = true

        // Act
        const label = formatDistributionLabel(item, showAbsoluteValues)

        // Assert
        expect(label).toBe(`ts ${(1120).toLocaleString()}`)
    })

    it("should say no data is available when the shown value is missing", () => {
        // Arrange
        const itemWithoutAbsoluteValue = { ...item, absoluteMetricValue: null }

        // Act
        const label = formatDistributionLabel(itemWithoutAbsoluteValue, true)

        // Assert
        expect(label).toBe("No data available")
    })
})

describe("formatDistributionValue", () => {
    it("should format only the value, without the extension", () => {
        // Arrange
        const item: MetricDistribution = { fileExtension: "ts", absoluteMetricValue: 3, relativeMetricValue: 1.5, color: "#fff" }

        // Act
        const value = formatDistributionValue(item, false)

        // Assert
        expect(value).toBe("1.50%")
    })
})
