import { AttributeDescriptors, CodeMapNode } from "../../../codeCharta.model"
import { _calculateMetricRows, isEmptyMetricValue } from "./inspectorMetricRows.selector"

describe("isEmptyMetricValue", () => {
    it("should treat zero and missing values as empty", () => {
        // Arrange, Act & Assert
        expect(isEmptyMetricValue(0)).toBe(true)
        expect(isEmptyMetricValue(undefined)).toBe(true)
        expect(isEmptyMetricValue(42)).toBe(false)
    })
})

describe("_calculateMetricRows", () => {
    const rootNode = { attributes: { rloc: 1000, coverage: 80, mcc: 90 } } as unknown as CodeMapNode
    const metricData = {
        nodeMetricData: [
            { name: "rloc", minValue: 0, maxValue: 500, values: [] },
            { name: "coverage", minValue: 20, maxValue: 100, values: [] },
            { name: "mcc", minValue: 0, maxValue: 60, values: [] }
        ]
    }
    const attributeDescriptors: AttributeDescriptors = {}

    it("should return an empty list when no node is selected", () => {
        // Arrange & Act
        const rows = _calculateMetricRows(undefined, rootNode, metricData, attributeDescriptors)

        // Assert
        expect(rows).toEqual([])
    })

    it("should exclude the unary metric and sort rows alphabetically", () => {
        // Arrange
        const selectedNode = { attributes: { unary: 1, rloc: 100, coverage: 50, mcc: 30 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, rootNode, metricData, attributeDescriptors)

        // Assert
        expect(rows.map(row => row.name)).toEqual(["coverage", "mcc", "rloc"])
    })

    it("should size the map bar as the building's share of the whole map", () => {
        // Arrange
        const selectedNode = { attributes: { rloc: 100 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, rootNode, metricData, attributeDescriptors)

        // Assert
        expect(rows[0].mapBar).toEqual({ fraction: 0.1, severity: "success" })
    })

    it("should size the range bar by the position within the file-level min/max range", () => {
        // Arrange
        const selectedNode = { attributes: { rloc: 400 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, rootNode, metricData, attributeDescriptors)

        // Assert
        expect(rows[0].mapBar).toEqual({ fraction: 0.4, severity: "warning" })
        expect(rows[0].rangeBar).toEqual({ fraction: 0.8, severity: "error" })
    })

    it("should clamp folder aggregates to a full range bar while the map bar shows their share", () => {
        // Arrange
        const folderNode = { children: [{}], attributes: { rloc: 600 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(folderNode, rootNode, metricData, attributeDescriptors)

        // Assert
        expect(rows[0].mapBar).toEqual({ fraction: 0.6, severity: "warning" })
        expect(rows[0].rangeBar).toEqual({ fraction: 1, severity: "error" })
    })

    it("should invert severity for higher-is-better metrics in both modes", () => {
        // Arrange
        const selectedNode = { attributes: { coverage: 60 } } as unknown as CodeMapNode
        const descriptors: AttributeDescriptors = {
            coverage: { title: "", description: "", hintLowValue: "", hintHighValue: "", link: "", direction: 1 }
        }

        // Act
        const rows = _calculateMetricRows(selectedNode, rootNode, metricData, descriptors)

        // Assert
        expect(rows[0].mapBar).toEqual({ fraction: 0.75, severity: "success" })
        expect(rows[0].rangeBar).toEqual({ fraction: 0.5, severity: "warning" })
    })

    it("should include delta values when the node carries deltas", () => {
        // Arrange
        const selectedNode = { attributes: { rloc: 100 }, deltas: { rloc: -20 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, rootNode, metricData, attributeDescriptors)

        // Assert
        expect(rows[0].delta).toBe(-20)
    })

    it("should give empty metrics an empty neutral bar in both modes", () => {
        // Arrange
        const selectedNode = { attributes: { rloc: 0 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, rootNode, metricData, attributeDescriptors)

        // Assert
        expect(rows[0].mapBar).toEqual({ fraction: 0, severity: "neutral" })
        expect(rows[0].rangeBar).toEqual({ fraction: 0, severity: "neutral" })
    })

    it("should render neutral full bars for metrics without map data", () => {
        // Arrange
        const selectedNode = { attributes: { custom: 7 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, rootNode, metricData, attributeDescriptors)

        // Assert
        expect(rows[0].mapBar).toEqual({ fraction: 1, severity: "neutral" })
        expect(rows[0].rangeBar).toEqual({ fraction: 1, severity: "neutral" })
    })

    it("should render a neutral full map bar when no root node is available", () => {
        // Arrange
        const selectedNode = { attributes: { rloc: 100 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, undefined, metricData, attributeDescriptors)

        // Assert
        expect(rows[0].mapBar).toEqual({ fraction: 1, severity: "neutral" })
        expect(rows[0].rangeBar).toEqual({ fraction: 0.2, severity: "success" })
    })
})
