import { EdgeMetricData, NodeMetricData } from "../../../model/codeCharta.model"
import { UrlMetricSelection } from "../../../util/queryParameter/queryParameter"
import { MetricSelection, resolveMetricSelection } from "./resolveMetricSelection"

describe("resolveMetricSelection", () => {
    const nodeMetricData: NodeMetricData[] = [
        { name: "rloc", maxValue: 100, minValue: 1, values: [1, 100] },
        { name: "mcc", maxValue: 20, minValue: 1, values: [1, 20] },
        { name: "functions", maxValue: 10, minValue: 1, values: [1, 10] }
    ]
    const edgeMetricData: EdgeMetricData[] = [
        { name: "pairingRate", maxValue: 10, minValue: 0, values: [0, 10] },
        { name: "avgCommits", maxValue: 5, minValue: 0, values: [0, 5] }
    ]

    const noUrlMetrics: UrlMetricSelection = { areaMetric: null, heightMetric: null, colorMetric: null, edgeMetric: null }
    const persistedSelection: MetricSelection = {
        areaMetric: "rloc",
        heightMetric: "mcc",
        colorMetric: "functions",
        distributionMetric: "rloc",
        edgeMetric: "pairingRate"
    }

    it("should prefer the url metric over the persisted metric when the url metric exists in the loaded files", () => {
        // Arrange
        const urlMetrics: UrlMetricSelection = { ...noUrlMetrics, areaMetric: "mcc" }

        // Act
        const resolved = resolveMetricSelection(urlMetrics, persistedSelection, nodeMetricData, edgeMetricData, true)

        // Assert
        expect(resolved.areaMetric).toBe("mcc")
    })

    it("should ignore the url metric and keep the persisted metric when the url metric does not exist in the loaded files", () => {
        // Arrange
        const urlMetrics: UrlMetricSelection = { ...noUrlMetrics, areaMetric: "does_not_exist" }

        // Act
        const resolved = resolveMetricSelection(urlMetrics, persistedSelection, nodeMetricData, edgeMetricData, true)

        // Assert
        expect(resolved.areaMetric).toBe("rloc")
    })

    it("should ignore url metrics entirely when no file query parameter is present", () => {
        // Arrange
        const urlMetrics: UrlMetricSelection = { ...noUrlMetrics, areaMetric: "mcc" }

        // Act
        const resolved = resolveMetricSelection(urlMetrics, persistedSelection, nodeMetricData, edgeMetricData, false)

        // Assert
        expect(resolved.areaMetric).toBe("rloc")
    })

    it("should keep the persisted combination when all three of area, height and color are available", () => {
        // Act
        const resolved = resolveMetricSelection(noUrlMetrics, persistedSelection, nodeMetricData, edgeMetricData, true)

        // Assert
        expect(resolved).toMatchObject({ areaMetric: "rloc", heightMetric: "mcc", colorMetric: "functions" })
    })

    it("should fall back to the computed default combination when any of area, height or color is unavailable", () => {
        // Arrange
        const staleSelection: MetricSelection = { ...persistedSelection, heightMetric: "vanished_metric" }

        // Act
        const resolved = resolveMetricSelection(noUrlMetrics, staleSelection, nodeMetricData, edgeMetricData, true)

        // Assert
        expect(resolved).toMatchObject({ areaMetric: "rloc", heightMetric: "mcc", colorMetric: "mcc" })
    })

    it("should let a valid url metric win over the computed default", () => {
        // Arrange
        const staleSelection: MetricSelection = { ...persistedSelection, heightMetric: "vanished_metric" }
        const urlMetrics: UrlMetricSelection = { ...noUrlMetrics, colorMetric: "functions" }

        // Act
        const resolved = resolveMetricSelection(urlMetrics, staleSelection, nodeMetricData, edgeMetricData, true)

        // Assert
        expect(resolved.colorMetric).toBe("functions")
        expect(resolved.heightMetric).toBe("mcc")
    })

    it("should recompute the distribution metric only when the default combination is used", () => {
        // Arrange
        const staleSelection: MetricSelection = { ...persistedSelection, distributionMetric: "mcc", heightMetric: "vanished_metric" }

        // Act
        const withDefaults = resolveMetricSelection(noUrlMetrics, staleSelection, nodeMetricData, edgeMetricData, true)
        const withPersisted = resolveMetricSelection(
            noUrlMetrics,
            { ...persistedSelection, distributionMetric: "mcc" },
            nodeMetricData,
            edgeMetricData,
            true
        )

        // Assert
        expect(withDefaults.distributionMetric).toBe("rloc")
        expect(withPersisted.distributionMetric).toBe("mcc")
    })

    it("should resolve the edge metric independently of the area, height and color combination", () => {
        // Arrange
        const staleSelection: MetricSelection = { ...persistedSelection, heightMetric: "vanished_metric" }

        // Act
        const resolved = resolveMetricSelection(noUrlMetrics, staleSelection, nodeMetricData, edgeMetricData, true)

        // Assert
        expect(resolved.edgeMetric).toBe("pairingRate")
    })

    it("should set the edge metric to the first available one when the selected one disappeared", () => {
        // Arrange
        const staleSelection: MetricSelection = { ...persistedSelection, edgeMetric: "vanished_edge_metric" }

        // Act
        const resolved = resolveMetricSelection(noUrlMetrics, staleSelection, nodeMetricData, edgeMetricData, true)

        // Assert
        expect(resolved.edgeMetric).toBe("pairingRate")
    })

    it("should prefer the url edge metric over the persisted one when it exists", () => {
        // Arrange
        const urlMetrics: UrlMetricSelection = { ...noUrlMetrics, edgeMetric: "avgCommits" }

        // Act
        const resolved = resolveMetricSelection(urlMetrics, persistedSelection, nodeMetricData, edgeMetricData, true)

        // Assert
        expect(resolved.edgeMetric).toBe("avgCommits")
    })

    it("should set the edge metric to undefined when the map has no edge metrics", () => {
        // Act
        const resolved = resolveMetricSelection(noUrlMetrics, persistedSelection, nodeMetricData, [], true)

        // Assert
        expect(resolved.edgeMetric).toBeUndefined()
    })

    it("should discard the current selection and take the computed default when the load discards it", () => {
        // Arrange — a reset: the previous selection is still perfectly valid in the reloaded files, but the
        // user asked for a reset, so it must not survive.
        const stillValidSelection: MetricSelection = { ...persistedSelection, areaMetric: "functions" }

        // Act
        const resolved = resolveMetricSelection(noUrlMetrics, stillValidSelection, nodeMetricData, edgeMetricData, true, true)

        // Assert
        expect(resolved.areaMetric).toBe("rloc")
    })

    it("should let a url metric win over the computed default even when the load discards the current selection", () => {
        // Arrange
        const urlMetrics: UrlMetricSelection = { ...noUrlMetrics, areaMetric: "functions" }

        // Act
        const resolved = resolveMetricSelection(urlMetrics, persistedSelection, nodeMetricData, edgeMetricData, true, true)

        // Assert
        expect(resolved.areaMetric).toBe("functions")
    })

    it("should return null when no metric is available at all", () => {
        // Arrange
        const emptyMetricData: NodeMetricData[] = [{ name: "unary", maxValue: 0, minValue: 0, values: [] }]
        const staleSelection: MetricSelection = { ...persistedSelection, areaMetric: "vanished_metric" }

        // Act
        const resolved = resolveMetricSelection(noUrlMetrics, staleSelection, emptyMetricData, [], true)

        // Assert
        expect(resolved).toBeNull()
    })
})
