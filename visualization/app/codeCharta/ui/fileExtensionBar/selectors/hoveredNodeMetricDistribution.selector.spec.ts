import { hoveredNodeMetricDistributionSelector } from "./hoveredNodeMetricDistribution.selector"
import { FileExtensionCalculator } from "./fileExtensionCalculator"
import { VALID_NODE_WITH_MULTIPLE_FOLDERS, VALID_NODE_WITH_MULTIPLE_FOLDERS_REVERSED } from "../../../util/dataMocks"
import { NodeType } from "../../../codeCharta.model"

describe("hoveredNodeMetricDistributionSelector", () => {
    const areaMetric = "rloc"

    const globalDistribution = {
        visible: [
            { fileExtension: "ts", absoluteMetricValue: 1000, relativeMetricValue: 80, color: "#color1" },
            { fileExtension: "html", absoluteMetricValue: 250, relativeMetricValue: 20, color: "#color2" }
        ],
        others: [],
        none: []
    }

    const fileNode = {
        name: "test.ts",
        type: NodeType.FILE,
        attributes: { rloc: 100 }
    }

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it("should return global distribution when no node is hovered or selected", () => {
        const result = hoveredNodeMetricDistributionSelector.projector(null, null, areaMetric, globalDistribution)
        expect(result).toBe(globalDistribution)
    })

    it("should return global distribution when hovered and selected nodes are undefined", () => {
        const result = hoveredNodeMetricDistributionSelector.projector(undefined, undefined, areaMetric, globalDistribution)
        expect(result).toBe(globalDistribution)
    })

    it("should calculate distribution for hovered folder node when nothing is selected", () => {
        const result = hoveredNodeMetricDistributionSelector.projector(
            VALID_NODE_WITH_MULTIPLE_FOLDERS,
            null,
            areaMetric,
            globalDistribution
        )

        expect(result).toBeDefined()
        expect(result).not.toBe(globalDistribution)
    })

    it("should return global distribution for hovered file node (AC-3)", () => {
        const result = hoveredNodeMetricDistributionSelector.projector(fileNode, null, areaMetric, globalDistribution)

        expect(result).toBe(globalDistribution)
    })

    it("should prioritize selected node over hovered node (AC-4)", () => {
        const selectedNode = VALID_NODE_WITH_MULTIPLE_FOLDERS
        const hoveredNode = fileNode
        const expectedDistribution = {
            visible: [{ fileExtension: "cs", absoluteMetricValue: 900, relativeMetricValue: 90, color: "#color3" }],
            others: [],
            none: []
        }

        jest.spyOn(FileExtensionCalculator, "getMetricDistribution").mockReturnValue(expectedDistribution)

        const result = hoveredNodeMetricDistributionSelector.projector(hoveredNode, selectedNode, areaMetric, globalDistribution)

        expect(FileExtensionCalculator.getMetricDistribution).toHaveBeenCalledWith(selectedNode, areaMetric)
        expect(result).toBe(expectedDistribution)
    })

    it("should persist selected folder distribution even when hovering over different nodes (AC-5)", () => {
        const selectedFolder = VALID_NODE_WITH_MULTIPLE_FOLDERS
        const hoveredFolder = VALID_NODE_WITH_MULTIPLE_FOLDERS_REVERSED
        const expectedDistribution = {
            visible: [{ fileExtension: "cs", absoluteMetricValue: 900, relativeMetricValue: 90, color: "#color3" }],
            others: [],
            none: []
        }

        jest.spyOn(FileExtensionCalculator, "getMetricDistribution").mockReturnValue(expectedDistribution)

        const result = hoveredNodeMetricDistributionSelector.projector(hoveredFolder, selectedFolder, areaMetric, globalDistribution)

        expect(FileExtensionCalculator.getMetricDistribution).toHaveBeenCalledWith(selectedFolder, areaMetric)
        expect(result).toBe(expectedDistribution)
    })

    it("should use FileExtensionCalculator to compute distribution when node is hovered", () => {
        const hoveredNode = VALID_NODE_WITH_MULTIPLE_FOLDERS
        const expectedDistribution = {
            visible: [{ fileExtension: "cs", absoluteMetricValue: 900, relativeMetricValue: 90, color: "#color3" }],
            others: [],
            none: []
        }

        jest.spyOn(FileExtensionCalculator, "getMetricDistribution").mockReturnValue(expectedDistribution)

        const result = hoveredNodeMetricDistributionSelector.projector(hoveredNode, null, areaMetric, globalDistribution)

        expect(FileExtensionCalculator.getMetricDistribution).toHaveBeenCalledWith(hoveredNode, areaMetric)
        expect(result).toBe(expectedDistribution)
    })
})
