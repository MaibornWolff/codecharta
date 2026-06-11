import { AttributeDescriptors, CodeMapNode } from "../../../codeCharta.model"
import { _calculateMetricRows } from "./inspectorMetricRows.selector"

describe("_calculateMetricRows", () => {
    const metricData = {
        nodeMetricData: [
            { name: "rloc", minValue: 0, maxValue: 1000, values: [] },
            { name: "coverage", minValue: 0, maxValue: 100, values: [] },
            { name: "mcc", minValue: 0, maxValue: 90, values: [] }
        ]
    }
    const attributeDescriptors: AttributeDescriptors = {}

    it("should return an empty list when no node is selected", () => {
        // Arrange & Act
        const rows = _calculateMetricRows(undefined, metricData, attributeDescriptors)

        // Assert
        expect(rows).toEqual([])
    })

    it("should exclude the unary metric and sort rows alphabetically", () => {
        // Arrange
        const selectedNode = { attributes: { unary: 1, rloc: 100, coverage: 50, mcc: 30 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, metricData, attributeDescriptors)

        // Assert
        expect(rows.map(row => row.name)).toEqual(["coverage", "mcc", "rloc"])
    })

    it("should compute bar fraction and severity from the global metric range", () => {
        // Arrange
        const selectedNode = { attributes: { rloc: 900 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, metricData, attributeDescriptors)

        // Assert
        expect(rows[0]).toEqual(expect.objectContaining({ name: "rloc", value: 900, fraction: 0.9, severity: "error" }))
    })

    it("should invert severity for higher-is-better metrics", () => {
        // Arrange
        const selectedNode = { attributes: { coverage: 90 } } as unknown as CodeMapNode
        const descriptors: AttributeDescriptors = {
            coverage: { title: "", description: "", hintLowValue: "", hintHighValue: "", link: "", direction: 1 }
        }

        // Act
        const rows = _calculateMetricRows(selectedNode, metricData, descriptors)

        // Assert
        expect(rows[0]).toEqual(expect.objectContaining({ name: "coverage", fraction: 0.9, severity: "success" }))
    })

    it("should include delta values when the node carries deltas", () => {
        // Arrange
        const selectedNode = { attributes: { rloc: 100 }, deltas: { rloc: -20 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, metricData, attributeDescriptors)

        // Assert
        expect(rows[0].delta).toBe(-20)
    })

    it("should clamp folder aggregates exceeding the global maximum to a full bar", () => {
        // Arrange
        const selectedNode = { attributes: { rloc: 5000 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, metricData, attributeDescriptors)

        // Assert
        expect(rows[0].fraction).toBe(1)
    })

    it("should render a neutral full bar for metrics without metric data", () => {
        // Arrange
        const selectedNode = { attributes: { custom: 7 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, metricData, attributeDescriptors)

        // Assert
        expect(rows[0]).toEqual(expect.objectContaining({ name: "custom", fraction: 1, severity: "neutral" }))
    })
})
