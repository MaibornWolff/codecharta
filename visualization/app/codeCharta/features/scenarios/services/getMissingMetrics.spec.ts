import { MetricData } from "../../../codeCharta.model"
import { MetricsSection } from "../model/scenario.model"
import { getMissingMetrics, hasMissingMetrics } from "./getMissingMetrics"

describe("getMissingMetrics", () => {
    const metricsSection: MetricsSection = {
        areaMetric: "rloc",
        heightMetric: "mcc",
        colorMetric: "mcc",
        edgeMetric: "pairingRate",
        distributionMetric: "rloc"
    }

    it("should return no missing metrics when all are available", () => {
        // Arrange
        const metricData: MetricData = {
            nodeMetricData: [
                { name: "rloc", maxValue: 100, minValue: 0, values: [] },
                { name: "mcc", maxValue: 50, minValue: 0, values: [] }
            ],
            edgeMetricData: [{ name: "pairingRate", maxValue: 1, minValue: 0, values: [] }]
        }

        // Act
        const result = getMissingMetrics(metricsSection, metricData)

        // Assert
        expect(result.nodeMetrics).toEqual([])
        expect(result.edgeMetrics).toEqual([])
        expect(hasMissingMetrics(result)).toBe(false)
    })

    it("should detect missing node metrics", () => {
        // Arrange
        const metricData: MetricData = {
            nodeMetricData: [{ name: "rloc", maxValue: 100, minValue: 0, values: [] }],
            edgeMetricData: [{ name: "pairingRate", maxValue: 1, minValue: 0, values: [] }]
        }

        // Act
        const result = getMissingMetrics(metricsSection, metricData)

        // Assert
        expect(result.nodeMetrics).toEqual(["mcc"])
        expect(hasMissingMetrics(result)).toBe(true)
    })

    it("should detect missing edge metrics", () => {
        // Arrange
        const metricData: MetricData = {
            nodeMetricData: [
                { name: "rloc", maxValue: 100, minValue: 0, values: [] },
                { name: "mcc", maxValue: 50, minValue: 0, values: [] }
            ],
            edgeMetricData: []
        }

        // Act
        const result = getMissingMetrics(metricsSection, metricData)

        // Assert
        expect(result.edgeMetrics).toEqual(["pairingRate"])
        expect(hasMissingMetrics(result)).toBe(true)
    })

    it("should deduplicate node metrics that appear in multiple roles", () => {
        // Arrange
        const section: MetricsSection = {
            areaMetric: "rloc",
            heightMetric: "rloc",
            colorMetric: "rloc",
            edgeMetric: "",
            distributionMetric: "rloc"
        }
        const metricData: MetricData = {
            nodeMetricData: [],
            edgeMetricData: []
        }

        // Act
        const result = getMissingMetrics(section, metricData)

        // Assert
        expect(result.nodeMetrics).toEqual(["rloc"])
    })

    it("should handle partial metrics section with no optional fields", () => {
        // Arrange
        const section: MetricsSection = {
            areaMetric: "rloc",
            heightMetric: "complexity",
            colorMetric: "complexity"
        }
        const metricData: MetricData = {
            nodeMetricData: [{ name: "rloc", maxValue: 100, minValue: 0, values: [] }],
            edgeMetricData: []
        }

        // Act
        const result = getMissingMetrics(section, metricData)

        // Assert
        expect(result.nodeMetrics).toEqual(["complexity"])
        expect(result.edgeMetrics).toEqual([])
    })

    it("should not flag undefined optional metrics as missing", () => {
        // Arrange
        const section: MetricsSection = {
            areaMetric: "rloc",
            heightMetric: "rloc",
            colorMetric: "rloc"
        }
        const metricData: MetricData = {
            nodeMetricData: [{ name: "rloc", maxValue: 100, minValue: 0, values: [] }],
            edgeMetricData: []
        }

        // Act
        const result = getMissingMetrics(section, metricData)

        // Assert
        expect(result.nodeMetrics).toEqual([])
        expect(result.edgeMetrics).toEqual([])
        expect(hasMissingMetrics(result)).toBe(false)
    })
})
