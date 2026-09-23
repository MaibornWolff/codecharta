import { CodeMapNode, ColorMode, NodeType } from "../../../model/codeCharta.model"
import { AccumulatedData } from "../../../renderer/renderModel/renderModel.facade"
import { defaultMapColors } from "../../../stores/mapState/mapState.read.facade"
import { radialColoringSelector, radialMetricsSelector, radialTreeSelector } from "./radialMap.selectors"

function file(path: string, rloc: number): CodeMapNode {
    return { name: path.split("/").at(-1), path, type: NodeType.FILE, attributes: { rloc, mcc: 1 } }
}

function folder(path: string, children: CodeMapNode[]): CodeMapNode {
    return { name: path.split("/").at(-1), path, type: NodeType.FOLDER, attributes: {}, children }
}

const MAP = folder("/root", [folder("/root/src", [folder("/root/src/app", [file("/root/src/app/a.ts", 3)])]), file("/root/b.ts", 4)])
const PATH_TO_NODE = new Map([
    ["/root", MAP],
    ["/root/src", MAP.children[0]]
])
function accumulatedData(unifiedMapNode: CodeMapNode | undefined): AccumulatedData {
    return { unifiedMapNode, unifiedFileMeta: undefined }
}

const METRICS = { areaMetric: "rloc", colorMetric: "mcc" }
const NOTHING_IS_FLAT = () => false

describe("radialTreeSelector", () => {
    it("should build the tree of the whole map when nothing is focused", () => {
        // Act
        const tree = radialTreeSelector.projector(accumulatedData(MAP), PATH_TO_NODE, undefined, METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(tree.path).toBe("/root")
        expect(tree.area).toBe(7)
    })

    it("should start at the focused folder", () => {
        // Act
        const tree = radialTreeSelector.projector(accumulatedData(MAP), PATH_TO_NODE, "/root/src", METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(tree.path).toBe("/root/src")
        expect(tree.area).toBe(3)
    })

    it("should have no tree before a map is loaded", () => {
        // Act
        const tree = radialTreeSelector.projector(accumulatedData(undefined), new Map(), undefined, METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(tree).toBeNull()
    })
})

describe("sunburst metrics and coloring", () => {
    it("should pair the area and colour metric", () => {
        // Act
        const metrics = radialMetricsSelector.projector("rloc", "mcc")

        // Assert
        expect(metrics).toEqual({ areaMetric: "rloc", colorMetric: "mcc" })
    })

    it("should mark the unary metric, which colours every node the same", () => {
        // Act
        const coloring = radialColoringSelector.projector("unary", { from: 1, to: 2 }, ColorMode.absolute, defaultMapColors, {
            minValue: 0,
            maxValue: 3,
            values: []
        })

        // Assert
        expect(coloring.isUnaryMetric).toBe(true)
    })

    it("should gather what colouring a folder needs", () => {
        // Arrange
        const colorRange = { from: 1, to: 2 }
        const colorMetricRange = { minValue: 0, maxValue: 3, values: [] }

        // Act
        const coloring = radialColoringSelector.projector("mcc", colorRange, ColorMode.absolute, defaultMapColors, colorMetricRange)

        // Assert
        expect(coloring).toEqual({
            isUnaryMetric: false,
            colorRange,
            colorMode: ColorMode.absolute,
            mapColors: defaultMapColors,
            colorMetricRange
        })
    })
})
