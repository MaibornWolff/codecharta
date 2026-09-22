import { CodeMapNode, ColorMode, NodeType } from "../../../model/codeCharta.model"
import { defaultMapColors } from "../../../stores/mapState/mapState.read.facade"
import { sunburstColoringSelector, sunburstFoldersSelector, sunburstMetricsSelector } from "./metricsSunburst.selector"

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
const METRICS = { areaMetric: "rloc", colorMetric: "mcc" }
const NOTHING_IS_FLAT = () => false

describe("sunburstFoldersSelector", () => {
    it("should build the folders of the whole map when nothing is focused", () => {
        // Act
        const folders = sunburstFoldersSelector.projector({ unifiedMapNode: MAP }, PATH_TO_NODE, undefined, METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(folders.path).toBe("/root")
        expect(folders.area).toBe(7)
    })

    it("should start at the focused folder", () => {
        // Act
        const folders = sunburstFoldersSelector.projector({ unifiedMapNode: MAP }, PATH_TO_NODE, "/root/src", METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(folders.path).toBe("/root/src")
        expect(folders.area).toBe(3)
    })

    it("should have no folders before a map is loaded", () => {
        // Act
        const folders = sunburstFoldersSelector.projector({ unifiedMapNode: undefined }, new Map(), undefined, METRICS, NOTHING_IS_FLAT)

        // Assert
        expect(folders).toBeNull()
    })
})

describe("sunburst metrics and coloring", () => {
    it("should pair the area and colour metric", () => {
        // Act
        const metrics = sunburstMetricsSelector.projector("rloc", "mcc")

        // Assert
        expect(metrics).toEqual({ areaMetric: "rloc", colorMetric: "mcc" })
    })

    it("should gather what colouring a folder needs", () => {
        // Arrange
        const colorRange = { from: 1, to: 2 }
        const colorMetricRange = { minValue: 0, maxValue: 3, values: [] }

        // Act
        const coloring = sunburstColoringSelector.projector("mcc", colorRange, ColorMode.absolute, defaultMapColors, colorMetricRange)

        // Assert
        expect(coloring).toEqual({
            colorMetric: "mcc",
            colorRange,
            colorMode: ColorMode.absolute,
            mapColors: defaultMapColors,
            colorMetricRange
        })
    })
})
