import { AttributeDescriptors, CodeMapNode } from "../../../codeCharta.model"
import { _calculateMetricRows } from "./inspectorMetricRows.selector"

describe("_calculateMetricRows", () => {
    const rootNode = { attributes: { rloc: 1000, coverage: 80, mcc: 90 } } as unknown as CodeMapNode
    const attributeDescriptors: AttributeDescriptors = {}

    it("should return an empty list when no node is selected", () => {
        // Arrange & Act
        const rows = _calculateMetricRows(undefined, rootNode, attributeDescriptors)

        // Assert
        expect(rows).toEqual([])
    })

    it("should exclude the unary metric and sort rows alphabetically", () => {
        // Arrange
        const selectedNode = { attributes: { unary: 1, rloc: 100, coverage: 50, mcc: 30 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, rootNode, attributeDescriptors)

        // Assert
        expect(rows.map(row => row.name)).toEqual(["coverage", "mcc", "rloc"])
    })

    it("should size the bar as the building's share of the whole map", () => {
        // Arrange
        const selectedNode = { attributes: { rloc: 100 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, rootNode, attributeDescriptors)

        // Assert
        expect(rows[0]).toEqual(expect.objectContaining({ name: "rloc", value: 100, fraction: 0.1, severity: "success" }))
    })

    it("should size the bar as the folder's aggregated share of the whole map", () => {
        // Arrange
        const folderNode = { children: [{}], attributes: { rloc: 500 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(folderNode, rootNode, attributeDescriptors)

        // Assert
        expect(rows[0]).toEqual(expect.objectContaining({ name: "rloc", value: 500, fraction: 0.5, severity: "warning" }))
    })

    it("should color high shares as error", () => {
        // Arrange
        const selectedNode = { attributes: { rloc: 900 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, rootNode, attributeDescriptors)

        // Assert
        expect(rows[0]).toEqual(expect.objectContaining({ fraction: 0.9, severity: "error" }))
    })

    it("should invert severity for higher-is-better metrics", () => {
        // Arrange
        const selectedNode = { attributes: { coverage: 60 } } as unknown as CodeMapNode
        const descriptors: AttributeDescriptors = {
            coverage: { title: "", description: "", hintLowValue: "", hintHighValue: "", link: "", direction: 1 }
        }

        // Act
        const rows = _calculateMetricRows(selectedNode, rootNode, descriptors)

        // Assert
        expect(rows[0]).toEqual(expect.objectContaining({ name: "coverage", fraction: 0.75, severity: "success" }))
    })

    it("should include delta values when the node carries deltas", () => {
        // Arrange
        const selectedNode = { attributes: { rloc: 100 }, deltas: { rloc: -20 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, rootNode, attributeDescriptors)

        // Assert
        expect(rows[0].delta).toBe(-20)
    })

    it("should clamp values exceeding the map total to a full bar", () => {
        // Arrange
        const selectedNode = { attributes: { mcc: 120 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, rootNode, attributeDescriptors)

        // Assert
        expect(rows[0].fraction).toBe(1)
    })

    it("should render a neutral full bar for metrics the map root does not carry", () => {
        // Arrange
        const selectedNode = { attributes: { custom: 7 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, rootNode, attributeDescriptors)

        // Assert
        expect(rows[0]).toEqual(expect.objectContaining({ name: "custom", fraction: 1, severity: "neutral" }))
    })

    it("should render a neutral full bar when no root node is available", () => {
        // Arrange
        const selectedNode = { attributes: { rloc: 100 } } as unknown as CodeMapNode

        // Act
        const rows = _calculateMetricRows(selectedNode, undefined, attributeDescriptors)

        // Assert
        expect(rows[0]).toEqual(expect.objectContaining({ fraction: 1, severity: "neutral" }))
    })
})
