import { aBand, aBox } from "./dependencyGraphTestData"
import { DependencyGraphLayout } from "./levelizedLayout"
import { aroundEdges, boxAtPoint, PaintedItem, paintOrder, TitleItem, topmostBoxAt } from "./paintOrder"

const root = aBox("/root", { isFolder: true, isExpanded: true, depth: 0, width: 1000, height: 600 })
const first = aBox("/root/first", { isFolder: true, isExpanded: true, depth: 1, x: 20, y: 40, width: 300, height: 200 })
const firstFile = aBox("/root/first/a.ts", { depth: 2, x: 40, y: 80 })
const second = aBox("/root/second", { isFolder: true, isExpanded: true, depth: 1, x: 400, y: 40, width: 300, height: 200 })
const secondFile = aBox("/root/second/b.ts", { depth: 2, x: 420, y: 80 })
const layout: DependencyGraphLayout = {
    boxes: [root, first, firstFile, second, secondFile],
    bands: [aBand({ folderPath: "/root/first", level: 0 }), aBand({ folderPath: "/root", level: 2 })],
    width: 1000,
    height: 600
}

function namesOf(items: (PaintedItem | TitleItem)[]): string[] {
    return items.map(item => {
        switch (item.kind) {
            case "box":
                return item.box.path
            case "title":
                return `title ${item.box.path}`
            default:
                return `band ${item.band.folderPath} ${item.band.level}`
        }
    })
}

describe("paintOrder", () => {
    it("should paint each folder, then its level bands, then its children", () => {
        // Arrange
        const nothingDragged: string[] = []

        // Act
        const items = paintOrder(layout, nothingDragged)

        // Assert
        expect(namesOf(items)).toEqual([
            "/root",
            "band /root 2",
            "/root/first",
            "band /root/first 0",
            "/root/first/a.ts",
            "/root/second",
            "/root/second/b.ts"
        ])
    })

    it("should paint a dragged folder with everything in it over its siblings", () => {
        // Arrange
        const raisedPaths = ["/root/first"]

        // Act
        const items = paintOrder(layout, raisedPaths)

        // Assert
        expect(namesOf(items).slice(2)).toEqual([
            "/root/second",
            "/root/second/b.ts",
            "/root/first",
            "band /root/first 0",
            "/root/first/a.ts"
        ])
    })

    it("should paint the most recently dragged sibling on top", () => {
        // Arrange
        const raisedPaths = ["/root/second", "/root/first"]

        // Act
        const items = paintOrder(layout, raisedPaths)

        // Assert
        expect(namesOf(items).at(-1)).toBe("/root/first/a.ts")
    })

    it("should paint nothing for an empty layout", () => {
        // Arrange
        const emptyLayout = { boxes: [], bands: [], width: 0, height: 0 }

        // Act
        const items = paintOrder(emptyLayout, [])

        // Assert
        expect(items).toEqual([])
    })
})

describe("aroundEdges", () => {
    it("should lay the open folders and level bands under the edges, and the closed boxes and folder names over them", () => {
        // Arrange
        const painted = paintOrder(layout, [])

        // Act
        const { underEdges, overEdges } = aroundEdges(painted)

        // Assert
        expect(namesOf(underEdges)).toEqual(["/root", "band /root 2", "/root/first", "band /root/first 0", "/root/second"])
        expect(namesOf(overEdges)).toEqual([
            "title /root",
            "title /root/first",
            "/root/first/a.ts",
            "title /root/second",
            "/root/second/b.ts"
        ])
    })
})

describe("boxAtPoint", () => {
    it("should find a closed box over a folder dragged across it, as the closed box is painted over every open folder", () => {
        // Arrange
        const draggedOver = { ...layout, boxes: layout.boxes.map(box => (box === second ? { ...second, x: 20, y: 40 } : box)) }

        // Act
        const found = boxAtPoint(draggedOver, ["/root/second"], [50, 90])

        // Assert
        expect(found).toBe("/root/first/a.ts")
    })
})

describe("topmostBoxAt", () => {
    it("should find the box painted on top at a point", () => {
        // Arrange
        const items = paintOrder(layout, [])

        // Act
        const onFile = topmostBoxAt(items, [50, 90])
        const onFolder = topmostBoxAt(items, [300, 220])
        const onRoot = topmostBoxAt(items, [900, 500])
        const outside = topmostBoxAt(items, [2000, 2000])

        // Assert
        expect([onFile, onFolder, onRoot, outside]).toEqual(["/root/first/a.ts", "/root/first", "/root", null])
    })
})
