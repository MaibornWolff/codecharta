import { LeveledNode } from "./leveledTree"
import { LAYOUT_SPACING, LayoutBox, layoutLevelized, namedByOwnLevel } from "./levelizedLayout"

function leveledFile(path: string, level = 0): LeveledNode {
    return { path, name: path.split("/").pop(), level, isFolder: false, children: [] }
}

function leveledFolder(path: string, children: LeveledNode[], level = 0): LeveledNode {
    return { path, name: path.split("/").pop(), level, isFolder: true, children }
}

function filesNamed(count: number): LeveledNode[] {
    return Array.from({ length: count }, (_, index) => leveledFile(`/root/file${String(index).padStart(3, "0")}`))
}

function boxOf(boxes: LayoutBox[], path: string): LayoutBox {
    return boxes.find(box => box.path === path)
}

function isInside(inner: LayoutBox, outer: LayoutBox): boolean {
    return (
        inner.x >= outer.x &&
        inner.y >= outer.y &&
        inner.x + inner.width <= outer.x + outer.width &&
        inner.y + inner.height <= outer.y + outer.height
    )
}

describe("layoutLevelized", () => {
    it("should put higher levels above lower ones", () => {
        // Arrange
        const tree = leveledFolder("/root", [leveledFile("/root/base", 0), leveledFile("/root/top", 2), leveledFile("/root/middle", 1)])

        // Act
        const { boxes } = layoutLevelized(tree, new Set(["/root"]))

        // Assert
        const [top, middle, base] = ["/root/top", "/root/middle", "/root/base"].map(path => boxOf(boxes, path))
        expect(top.y).toBeLessThan(middle.y)
        expect(middle.y).toBeLessThan(base.y)
    })

    it("should order the nodes of one level by name", () => {
        // Arrange
        const tree = leveledFolder("/root", [leveledFile("/root/b"), leveledFile("/root/a")])

        // Act
        const { boxes } = layoutLevelized(tree, new Set(["/root"]))

        // Assert
        expect(boxOf(boxes, "/root/a").x).toBeLessThan(boxOf(boxes, "/root/b").x)
    })

    it("should keep a level of up to six nodes in a single row", () => {
        // Arrange
        const tree = leveledFolder("/root", filesNamed(6))

        // Act
        const { boxes } = layoutLevelized(tree, new Set(["/root"]))

        // Assert
        expect(new Set(boxes.filter(box => !box.isFolder).map(box => box.y)).size).toBe(1)
    })

    it("should wrap a long level into rows that keep the folder close to the target aspect ratio", () => {
        // Arrange
        const tree = leveledFolder("/root", filesNamed(100))

        // Act
        const { boxes, width, height } = layoutLevelized(tree, new Set(["/root"]))

        // Assert
        const fileBoxes = boxes.filter(box => !box.isFolder)
        expect(fileBoxes.filter(box => box.y === fileBoxes[0].y)).toHaveLength(7)
        expect(new Set(fileBoxes.map(box => box.y)).size).toBe(15)
        expect(width / height).toBeCloseTo(1.49, 2)
    })

    it("should draw a collapsed folder as a single node box", () => {
        // Arrange
        const tree = leveledFolder("/root", [leveledFolder("/root/closed", [leveledFile("/root/closed/a")])])

        // Act
        const { boxes } = layoutLevelized(tree, new Set(["/root"]))

        // Assert
        expect(boxOf(boxes, "/root/closed")).toMatchObject({
            isExpanded: false,
            width: LAYOUT_SPACING.nodeWidth,
            height: LAYOUT_SPACING.nodeHeight
        })
        expect(boxOf(boxes, "/root/closed/a")).toBeUndefined()
    })

    it("should nest an open folder's children inside it and list parents before children", () => {
        // Arrange
        const tree = leveledFolder("/root", [leveledFolder("/root/open", [leveledFile("/root/open/a"), leveledFile("/root/open/b", 1)])])

        // Act
        const { boxes } = layoutLevelized(tree, new Set(["/root", "/root/open"]))

        // Assert
        const open = boxOf(boxes, "/root/open")
        expect(boxes.map(box => box.path)).toEqual(["/root", "/root/open", "/root/open/b", "/root/open/a"])
        expect(isInside(boxOf(boxes, "/root/open/a"), open)).toBe(true)
        expect(isInside(open, boxOf(boxes, "/root"))).toBe(true)
        expect(boxOf(boxes, "/root/open/a").depth).toBe(2)
    })

    it("should mark one band per level of an open folder", () => {
        // Arrange
        const tree = leveledFolder("/root", [leveledFile("/root/a", 1), leveledFile("/root/b", 0), leveledFile("/root/c", 0)])

        // Act
        const { bands, boxes } = layoutLevelized(tree, new Set(["/root"]))

        // Assert
        expect(bands.map(band => band.level)).toEqual([1, 0])
        expect(bands[1].y).toBe(boxOf(boxes, "/root/b").y)
        expect(bands[1].height).toBe(LAYOUT_SPACING.nodeHeight)
    })

    it("should size each band by its own folder's rows when a nested folder opens inside it", () => {
        // Arrange
        const nested = leveledFolder("/root/open", [leveledFile("/root/open/x", 1), leveledFile("/root/open/y", 0)])
        const tree = leveledFolder("/root", [nested, ...filesNamed(8)])

        // Act
        const { bands, boxes } = layoutLevelized(tree, new Set(["/root", "/root/open"]))

        // Assert
        const rootBand = bands.find(band => band.folderPath === "/root")
        const lowestRootChild = Math.max(...boxes.filter(box => box.depth === 1).map(box => box.y + box.height))
        expect(rootBand.y + rootBand.height).toBe(lowestRootChild)
        expect(bands.filter(band => band.folderPath === "/root/open").map(band => band.isTopmost)).toEqual([true, false])
    })

    it("should number each band and box by the levels of the boxes around it, outermost first", () => {
        // Arrange
        const nested = leveledFolder("/root/open", [leveledFile("/root/open/x", 2), leveledFile("/root/open/y", 0)], 1)
        const tree = leveledFolder("/root", [nested, leveledFile("/root/a", 0)])

        // Act
        const { bands, boxes } = layoutLevelized(tree, new Set(["/root", "/root/open"]))

        // Assert
        expect(bands.map(band => band.levelPath)).toEqual([[1], [1, 2], [1, 0], [0]])
        expect(boxOf(boxes, "/root").levelPath).toEqual([])
        expect(boxOf(boxes, "/root/open").levelPath).toEqual([1])
        expect(boxOf(boxes, "/root/open/x").levelPath).toEqual([1, 2])
    })

    it("should keep counting from the levels above the tree it is given", () => {
        // Arrange
        const tree = leveledFolder("/root/open", [leveledFile("/root/open/x", 2)])

        // Act
        const { bands, boxes } = layoutLevelized(tree, new Set(["/root/open"]), [0, 1])

        // Assert
        expect(bands.map(band => band.levelPath)).toEqual([[0, 1, 2]])
        expect(boxOf(boxes, "/root/open").levelPath).toEqual([0, 1])
    })
})

describe("namedByOwnLevel", () => {
    it("should name every band and box by its own level alone, leaving the root without one", () => {
        // Arrange
        const nested = leveledFolder("/root/open", [leveledFile("/root/open/x", 2)], 1)
        const layout = layoutLevelized(leveledFolder("/root", [nested]), new Set(["/root", "/root/open"]))

        // Act
        const { bands, boxes } = namedByOwnLevel(layout)

        // Assert
        expect(bands.map(band => band.levelPath)).toEqual([[1], [2]])
        expect(boxes.map(box => box.levelPath)).toEqual([[], [1], [2]])
    })
})
