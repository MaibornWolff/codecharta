import { aBand, aBox } from "./dependencyGraphTestData"
import { DependencyGraphLayout } from "./levelizedLayout"
import { PaintedItem, paintOrder, topmostBoxAt } from "./paintOrder"

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

function namesOf(items: PaintedItem[]): string[] {
    return items.map(item => (item.kind === "box" ? item.box.path : `band ${item.band.folderPath} ${item.band.level}`))
}

describe("paintOrder", () => {
    it("should paint each folder, then its level bands, then its children", () => {
        // Act
        const items = paintOrder(layout, [])

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
        // Act
        const items = paintOrder(layout, ["/root/first"])

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
        // Act
        const items = paintOrder(layout, ["/root/second", "/root/first"])

        // Assert
        expect(namesOf(items).at(-1)).toBe("/root/first/a.ts")
    })

    it("should paint nothing for an empty layout", () => {
        // Act
        const items = paintOrder({ boxes: [], bands: [], width: 0, height: 0 }, [])

        // Assert
        expect(items).toEqual([])
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
