import { AttributeDescriptors, CodeMapNode, MapColors, NodeType } from "../../../codeCharta.model"
import { _calculateMappingBlocks } from "./inspectorMappingBlocks.selector"

describe("_calculateMappingBlocks", () => {
    const metricData = {
        nodeMetricData: [
            { name: "rloc", minValue: 12, maxValue: 4208, values: [] },
            { name: "mcc", minValue: 1, maxValue: 62, values: [] },
            { name: "coverage", minValue: 0, maxValue: 100, values: [] }
        ],
        edgeMetricData: [{ name: "pairingRate", minValue: 0, maxValue: 90, values: [] }]
    }
    const primaryMetricNames = { areaMetric: "rloc", heightMetric: "mcc", colorMetric: "coverage", edgeMetric: null }
    const attributeDescriptors: AttributeDescriptors = {}
    const mapColors = { isColorRangeInverted: false } as MapColors

    it("should create area, height and color blocks with their global ranges", () => {
        // Arrange & Act
        const blocks = _calculateMappingBlocks(primaryMetricNames, metricData, attributeDescriptors, mapColors, false, undefined)

        // Assert
        expect(blocks).toEqual([
            { kind: "area", metricName: "rloc", min: 12, max: 4208, descriptor: undefined },
            { kind: "height", metricName: "mcc", min: 1, max: 62, descriptor: undefined },
            { kind: "color", metricName: "coverage", min: 0, max: 100, descriptor: undefined, inverted: false }
        ])
    })

    it("should mark the color block as inverted when the color range is inverted", () => {
        // Arrange
        const invertedMapColors = { isColorRangeInverted: true } as MapColors

        // Act
        const blocks = _calculateMappingBlocks(primaryMetricNames, metricData, attributeDescriptors, invertedMapColors, false, undefined)

        // Assert
        const colorBlock = blocks.find(block => block.kind === "color")
        expect(colorBlock.inverted).toBe(true)
    })

    it("should omit the color block in delta mode", () => {
        // Arrange & Act
        const blocks = _calculateMappingBlocks(primaryMetricNames, metricData, attributeDescriptors, mapColors, true, undefined)

        // Assert
        expect(blocks.map(block => block.kind)).toEqual(["area", "height"])
    })

    it("should omit the edge block when no edge metric is selected", () => {
        // Arrange
        const selectedNode = { edgeAttributes: { pairingRate: { incoming: 5, outgoing: 3 } } } as unknown as CodeMapNode

        // Act
        const blocks = _calculateMappingBlocks(primaryMetricNames, metricData, attributeDescriptors, mapColors, false, selectedNode)

        // Assert
        expect(blocks.some(block => block.kind === "edge")).toBe(false)
    })

    it("should add an edge block with the node's in and out counts when an edge metric is selected", () => {
        // Arrange
        const namesWithEdge = { ...primaryMetricNames, edgeMetric: "pairingRate" }
        const selectedNode = { edgeAttributes: { pairingRate: { incoming: 5, outgoing: 3 } } } as unknown as CodeMapNode

        // Act
        const blocks = _calculateMappingBlocks(namesWithEdge, metricData, attributeDescriptors, mapColors, false, selectedNode)

        // Assert
        const edgeBlock = blocks.find(block => block.kind === "edge")
        expect(edgeBlock).toEqual({
            kind: "edge",
            metricName: "pairingRate",
            min: 0,
            max: 90,
            incoming: 5,
            outgoing: 3,
            descriptor: undefined
        })
    })

    it("should omit the edge block when the selected node has no matching edge attributes", () => {
        // Arrange
        const namesWithEdge = { ...primaryMetricNames, edgeMetric: "pairingRate" }
        const selectedNode = { name: "a", type: NodeType.FILE, edgeAttributes: {} } as unknown as CodeMapNode

        // Act
        const blocks = _calculateMappingBlocks(namesWithEdge, metricData, attributeDescriptors, mapColors, false, selectedNode)

        // Assert
        expect(blocks.some(block => block.kind === "edge")).toBe(false)
    })

    it("should fall back to a zero range when a mapped metric has no metric data", () => {
        // Arrange
        const namesWithUnknownMetric = { ...primaryMetricNames, areaMetric: "unknown" }

        // Act
        const blocks = _calculateMappingBlocks(namesWithUnknownMetric, metricData, attributeDescriptors, mapColors, false, undefined)

        // Assert
        const areaBlock = blocks.find(block => block.kind === "area")
        expect(areaBlock.min).toBe(0)
        expect(areaBlock.max).toBe(0)
    })

    it("should attach the attribute descriptor of the mapped metric", () => {
        // Arrange
        const descriptors: AttributeDescriptors = {
            rloc: { title: "Real Lines of Code", description: "", hintLowValue: "", hintHighValue: "", link: "https://docs", direction: -1 }
        }

        // Act
        const blocks = _calculateMappingBlocks(primaryMetricNames, metricData, descriptors, mapColors, false, undefined)

        // Assert
        const areaBlock = blocks.find(block => block.kind === "area")
        expect(areaBlock.descriptor).toBe(descriptors.rloc)
    })
})
