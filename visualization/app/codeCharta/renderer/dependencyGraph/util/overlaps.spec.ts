import { aBand, aBox } from "./dependencyGraphTestData"
import { LAYOUT_SPACING } from "./levelizedLayout"
import { findOverlaps } from "./overlaps"
import { PaintedItem } from "./paintOrder"

const root = aBox("/root", { kind: "folder", isExpanded: true, depth: 0, width: 1000, height: 600 })
const lib = aBox("/root/lib", { kind: "folder", isExpanded: true, depth: 1, x: 20, y: 40, width: 400, height: 300 })
const libBand = aBand({ folderPath: "/root/lib", level: 0, isTopmost: false, x: 20, y: 200, width: 400 })
const libFile = aBox("/root/lib/c.ts", { depth: 2, x: 40, y: 200 })
const ui = aBox("/root/ui", { kind: "folder", isExpanded: true, depth: 1, x: 300, y: 150, width: 300, height: 200 })
const uiFile = aBox("/root/ui/d.ts", { depth: 2, x: 320, y: 220 })
const MANY_FILES = 2000
const GAP_BETWEEN_FILES = 20
const FILE_SPACING = 160 + GAP_BETWEEN_FILES

function painted(...entries: (typeof root | typeof libBand)[]): PaintedItem[] {
    return entries.map(entry => ("folderPath" in entry ? { kind: "band", band: entry } : { kind: "box", box: entry }))
}

describe("findOverlaps", () => {
    it("should let a folder painted over a box it does not belong with show it through", () => {
        // Arrange
        const items = painted(root, lib, libBand, libFile, ui, uiFile)

        // Act
        const { seeThroughPaths } = findOverlaps(items)

        // Assert
        expect([...seeThroughPaths]).toEqual(["/root/ui"])
    })

    it("should keep folders solid over their own content and their parents", () => {
        // Arrange
        const items = painted(root, lib, libFile)

        // Act
        const { seeThroughPaths } = findOverlaps(items)

        // Assert
        expect(seeThroughPaths.size).toBe(0)
    })

    it("should stop a band's separator where a box from outside its folder covers it", () => {
        // Arrange
        const items = painted(root, lib, libBand, libFile, ui, uiFile)

        // Act
        const cutout = findOverlaps(items).bandCutouts.get(libBand)

        // Assert
        expect(cutout.hiddenSpans).toEqual([[300, 420 - LAYOUT_SPACING.padding]])
        expect(cutout.isLabelHidden).toBe(false)
    })

    it("should leave out a band's label under a box from outside its folder", () => {
        // Arrange
        const coveringTheLabel = aBox("/root/ui", { kind: "folder", isExpanded: true, depth: 1, x: 0, y: 150, width: 200, height: 100 })

        // Act
        const cutout = findOverlaps(painted(root, lib, libBand, coveringTheLabel)).bandCutouts.get(libBand)

        // Assert
        expect(cutout.isLabelHidden).toBe(true)
    })

    it("should cut nothing out of a band covered only by its own folder's boxes", () => {
        // Arrange
        const ownFileOnTheSeparator = aBox("/root/lib/e.ts", { depth: 2, x: 100, y: 170 })

        // Act
        const { bandCutouts } = findOverlaps(painted(root, lib, libBand, ownFileOnTheSeparator))

        // Assert
        expect(bandCutouts.size).toBe(0)
    })

    it("should leave a band alone that a box painted before it covers", () => {
        // Arrange
        const items = painted(root, ui, lib, libBand)

        // Act
        const { bandCutouts } = findOverlaps(items)

        // Assert
        expect(bandCutouts.size).toBe(0)
    })

    it("should find the one overlap among many boxes, wherever it lies", () => {
        // Arrange
        const files = Array.from({ length: MANY_FILES }, (_, index) =>
            aBox(`/root/wide/file${index}.ts`, { depth: 2, x: index * FILE_SPACING, y: 1000 })
        )
        const wide = aBox("/root/wide", {
            kind: "folder",
            isExpanded: true,
            depth: 1,
            y: 960,
            width: MANY_FILES * FILE_SPACING,
            height: 100
        })
        const lastFile = files.at(-1)
        const draggedOntoTheLastFile = aBox("/root/wide/dragged", {
            kind: "folder",
            isExpanded: true,
            depth: 2,
            x: lastFile.x,
            y: lastFile.y
        })
        const betweenTheFiles = aBox("/root/wide/between", {
            kind: "folder",
            depth: 2,
            x: FILE_SPACING - GAP_BETWEEN_FILES,
            y: 1000,
            width: GAP_BETWEEN_FILES
        })
        const items = painted(root, wide, ...files, betweenTheFiles, draggedOntoTheLastFile)

        // Act
        const { seeThroughPaths } = findOverlaps(items)

        // Assert
        expect([...seeThroughPaths]).toEqual(["/root/wide/dragged"])
    })
})
