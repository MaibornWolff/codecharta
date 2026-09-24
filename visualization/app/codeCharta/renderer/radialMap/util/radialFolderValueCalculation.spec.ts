import { CodeMapNode, NodeType, RadialFolderValue } from "../../../model/codeCharta.model"
import { calculateFolderValues, FolderValueInputs } from "./radialFolderValueCalculation"

function file(path: string, rloc: number, mcc: number | undefined, overrides: Partial<CodeMapNode> = {}): CodeMapNode {
    const attributes = mcc === undefined ? { rloc } : { rloc, mcc }
    return { name: path.split("/").at(-1), path, type: NodeType.FILE, attributes, ...overrides }
}

function folder(path: string, children: CodeMapNode[], overrides: Partial<CodeMapNode> = {}): CodeMapNode {
    return { name: path.split("/").at(-1), path, type: NodeType.FOLDER, attributes: {}, children, ...overrides }
}

// /root/src holds three files of 10, 30 and 60 lines with mcc 2, 12 and 4; /root/docs one file of 100 lines with mcc 1.
const MAP = folder("/root", [
    folder("/root/src", [file("/root/src/a.ts", 10, 2), file("/root/src/b.ts", 30, 12), file("/root/src/c.ts", 60, 4)]),
    folder("/root/docs", [file("/root/docs/readme.md", 100, 1)])
])

function valuesOf(folderValue: RadialFolderValue, map = MAP): ReadonlyMap<string, number> {
    const inputs: FolderValueInputs = { areaMetric: "rloc", colorMetric: "mcc", folderValue }
    return calculateFolderValues(map, inputs)
}

describe("calculateFolderValues", () => {
    it("should add up a folder's files for the sum", () => {
        // Act
        const values = valuesOf(RadialFolderValue.Sum)

        // Assert
        expect(values.get("/root/src")).toBe(18)
        expect(values.get("/root")).toBe(19)
    })

    it("should take a folder's highest file for the max", () => {
        // Act
        const values = valuesOf(RadialFolderValue.Max)

        // Assert
        expect(values.get("/root/src")).toBe(12)
        expect(values.get("/root")).toBe(12)
    })

    it("should take a folder's lowest file for the min", () => {
        // Act
        const values = valuesOf(RadialFolderValue.Min)

        // Assert
        expect(values.get("/root/src")).toBe(2)
        expect(values.get("/root")).toBe(1)
    })

    it("should take a folder's middle file for the median, averaging the two middle files of an even count", () => {
        // Act
        const values = valuesOf(RadialFolderValue.Median)

        // Assert
        expect(values.get("/root/src")).toBe(4)
        expect(values.get("/root")).toBe(3)
    })

    it("should divide the sum by the number of files for the mean per file", () => {
        // Act
        const values = valuesOf(RadialFolderValue.MeanPerFile)

        // Assert
        expect(values.get("/root/src")).toBe(6)
    })

    it("should weight each file by its area for the average per line", () => {
        // Act
        const values = valuesOf(RadialFolderValue.AvgPerLine)

        // Assert
        expect(values.get("/root/src")).toBeCloseTo((10 * 2 + 30 * 12 + 60 * 4) / 100)
    })

    it("should leave out excluded files and folders", () => {
        // Arrange
        const map = folder("/root", [
            folder("/root/src", [file("/root/src/a.ts", 10, 2), file("/root/src/hot.ts", 10, 99, { isExcluded: true })]),
            folder("/root/gen", [file("/root/gen/x.ts", 10, 50)], { isExcluded: true })
        ])

        // Act
        const values = valuesOf(RadialFolderValue.Max, map)

        // Assert
        expect(values.get("/root")).toBe(2)
        expect(values.has("/root/gen")).toBe(false)
    })

    it("should leave out files without an area or a colour value, and give a folder of only those no value", () => {
        // Arrange
        const map = folder("/root", [
            folder("/root/src", [file("/root/src/a.ts", 10, 2), file("/root/src/empty.ts", 0, 99)]),
            folder("/root/assets", [file("/root/assets/logo.svg", 10, undefined)])
        ])

        // Act
        const values = valuesOf(RadialFolderValue.Max, map)

        // Assert
        expect(values.get("/root/src")).toBe(2)
        expect(values.has("/root/assets")).toBe(false)
    })

    it("should give no files a value", () => {
        // Act
        const values = valuesOf(RadialFolderValue.Max)

        // Assert
        expect(values.has("/root/src/a.ts")).toBe(false)
    })
})
