import { AttributeDescriptors, CodeMapNode, MapColors, NodeType } from "../../../codeCharta.model"
import { _calculateMappingBlocks } from "./inspectorMappingBlocks.selector"

describe("_calculateMappingBlocks", () => {
    const primaryMetricNames = { areaMetric: "rloc", heightMetric: "mcc", colorMetric: "coverage", edgeMetric: null }
    const attributeDescriptors: AttributeDescriptors = {}
    const mapColors = { isColorRangeInverted: false } as MapColors
    const selectedNode = { attributes: { rloc: 842, mcc: 41, coverage: 62 } } as unknown as CodeMapNode

    it("should create area, height and color blocks with the selected node's values", () => {
        // Arrange & Act
        const blocks = _calculateMappingBlocks(primaryMetricNames, attributeDescriptors, mapColors, false, selectedNode)

        // Assert
        expect(blocks).toEqual([
            { kind: "area", metricName: "rloc", value: 842, descriptor: undefined },
            { kind: "height", metricName: "mcc", value: 41, descriptor: undefined },
            { kind: "color", metricName: "coverage", value: 62, descriptor: undefined, inverted: false }
        ])
    })

    it("should show the aggregated value of a selected folder", () => {
        // Arrange
        const folderNode = {
            type: NodeType.FOLDER,
            children: [{}],
            attributes: { rloc: 12_400, mcc: 200, coverage: 70 }
        } as unknown as CodeMapNode

        // Act
        const blocks = _calculateMappingBlocks(primaryMetricNames, attributeDescriptors, mapColors, false, folderNode)

        // Assert
        const areaBlock = blocks.find(block => block.kind === "area")
        expect(areaBlock.value).toBe(12_400)
    })

    it("should mark the color block as inverted when the color range is inverted", () => {
        // Arrange
        const invertedMapColors = { isColorRangeInverted: true } as MapColors

        // Act
        const blocks = _calculateMappingBlocks(primaryMetricNames, attributeDescriptors, invertedMapColors, false, selectedNode)

        // Assert
        const colorBlock = blocks.find(block => block.kind === "color")
        expect(colorBlock.inverted).toBe(true)
    })

    it("should omit the color block in delta mode", () => {
        // Arrange & Act
        const blocks = _calculateMappingBlocks(primaryMetricNames, attributeDescriptors, mapColors, true, selectedNode)

        // Assert
        expect(blocks.map(block => block.kind)).toEqual(["area", "height"])
    })

    it("should omit the edge block when no edge metric is selected", () => {
        // Arrange
        const nodeWithEdges = { ...selectedNode, edgeAttributes: { pairingRate: { incoming: 5, outgoing: 3 } } } as unknown as CodeMapNode

        // Act
        const blocks = _calculateMappingBlocks(primaryMetricNames, attributeDescriptors, mapColors, false, nodeWithEdges)

        // Assert
        expect(blocks.some(block => block.kind === "edge")).toBe(false)
    })

    it("should add an edge block with the node's in and out counts when an edge metric is selected", () => {
        // Arrange
        const namesWithEdge = { ...primaryMetricNames, edgeMetric: "pairingRate" }
        const nodeWithEdges = { ...selectedNode, edgeAttributes: { pairingRate: { incoming: 5, outgoing: 3 } } } as unknown as CodeMapNode

        // Act
        const blocks = _calculateMappingBlocks(namesWithEdge, attributeDescriptors, mapColors, false, nodeWithEdges)

        // Assert
        const edgeBlock = blocks.find(block => block.kind === "edge")
        expect(edgeBlock).toEqual({
            kind: "edge",
            metricName: "pairingRate",
            incoming: 5,
            outgoing: 3,
            descriptor: undefined
        })
    })

    it("should omit the edge block when the selected node has no matching edge attributes", () => {
        // Arrange
        const namesWithEdge = { ...primaryMetricNames, edgeMetric: "pairingRate" }
        const nodeWithoutEdges = { ...selectedNode, edgeAttributes: {} } as unknown as CodeMapNode

        // Act
        const blocks = _calculateMappingBlocks(namesWithEdge, attributeDescriptors, mapColors, false, nodeWithoutEdges)

        // Assert
        expect(blocks.some(block => block.kind === "edge")).toBe(false)
    })

    it("should leave the value undefined when the node does not carry the mapped metric", () => {
        // Arrange
        const namesWithUnknownMetric = { ...primaryMetricNames, areaMetric: "unknown" }

        // Act
        const blocks = _calculateMappingBlocks(namesWithUnknownMetric, attributeDescriptors, mapColors, false, selectedNode)

        // Assert
        const areaBlock = blocks.find(block => block.kind === "area")
        expect(areaBlock.value).toBeUndefined()
    })

    it("should attach the attribute descriptor of the mapped metric", () => {
        // Arrange
        const descriptors: AttributeDescriptors = {
            rloc: { title: "Real Lines of Code", description: "", hintLowValue: "", hintHighValue: "", link: "https://docs", direction: -1 }
        }

        // Act
        const blocks = _calculateMappingBlocks(primaryMetricNames, descriptors, mapColors, false, selectedNode)

        // Assert
        const areaBlock = blocks.find(block => block.kind === "area")
        expect(areaBlock.descriptor).toBe(descriptors.rloc)
    })
})
