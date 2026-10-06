import { BoxOffset, isDraggable, movedLayout } from "./boxMoves"
import { aBand, aBox } from "./dependencyGraphTestData"
import { DependencyGraphLayout, LAYOUT_SPACING } from "./layoutModel"

const root = aBox("/root", { kind: "folder", isExpanded: true, depth: 0, x: 0, y: 0, width: 1000, height: 600 })
const folder = aBox("/root/app", { kind: "folder", isExpanded: true, depth: 1, x: 100, y: 100, width: 400, height: 300 })
const file = aBox("/root/app/a.ts", { depth: 2, x: 150, y: 170 })
const other = aBox("/root/lib.ts", { depth: 1, x: 600, y: 100 })
const layout: DependencyGraphLayout = {
    boxes: [root, folder, file, other],
    bands: [aBand({ containerPath: "/root/app", memberPaths: ["/root/app/a.ts"], x: 100, y: 170, width: 400 })],
    width: 1000,
    height: 600
}

function boxAt(moved: DependencyGraphLayout, path: string) {
    return moved.boxes.find(box => box.path === path)
}

describe("boxMoves", () => {
    describe("movedLayout", () => {
        it("should shift a moved folder with everything inside it and its level bands", () => {
            // Arrange
            const offsets = new Map<string, BoxOffset>([["/root/app", [50, 20]]])

            // Act
            const moved = movedLayout(layout, offsets)

            // Assert
            expect(boxAt(moved, "/root/app")).toMatchObject({ x: 150, y: 120, width: 400 })
            expect(boxAt(moved, "/root/app/a.ts")).toMatchObject({ x: 200, y: 190 })
            expect(boxAt(moved, "/root/lib.ts")).toBe(other)
            expect(moved.bands[0]).toMatchObject({ x: 150, y: 190, width: 400 })
            expect(moved.width).toBe(1000)
        })

        it("should add up a folder's move and its child's own", () => {
            // Arrange
            const offsets = new Map<string, BoxOffset>([
                ["/root/app", [50, 0]],
                ["/root/app/a.ts", [10, 10]]
            ])

            // Act
            const moved = movedLayout(layout, offsets)

            // Assert
            expect(boxAt(moved, "/root/app/a.ts")).toMatchObject({ x: 210, y: 180 })
        })

        it("should move a level band with the boxes of its level", () => {
            // Arrange
            const offsets = new Map<string, BoxOffset>([["/root/app/a.ts", [0, 60]]])

            // Act
            const moved = movedLayout(layout, offsets)

            // Assert
            expect(moved.bands[0]).toMatchObject({ y: 230, height: 40 })
        })

        it("should grow the folder, and its level bands, to hold a box dragged past its edge", () => {
            // Arrange
            const offsets = new Map<string, BoxOffset>([["/root/app/a.ts", [-200, 0]]])

            // Act
            const moved = movedLayout(layout, offsets)

            // Assert
            const grown = boxAt(moved, "/root/app")
            expect(grown.x).toBe(150 - 200 - LAYOUT_SPACING.padding)
            expect(grown.x + grown.width).toBe(500)
            expect(moved.bands[0]).toMatchObject({ x: grown.x, width: grown.width })
        })

        it("should grow every folder up the tree that the moved box reaches past", () => {
            // Arrange
            const offsets = new Map<string, BoxOffset>([["/root/app/a.ts", [0, 1000]]])

            // Act
            const moved = movedLayout(layout, offsets)

            // Assert
            const grownFolder = boxAt(moved, "/root/app")
            expect(grownFolder.y + grownFolder.height).toBe(170 + 1000 + 40 + LAYOUT_SPACING.padding)
            expect(boxAt(moved, "/root").height).toBe(grownFolder.y + grownFolder.height + LAYOUT_SPACING.padding)
        })

        it("should return the layout itself while nothing is moved", () => {
            // Arrange
            const offsets = new Map<string, BoxOffset>()

            // Act
            const moved = movedLayout(layout, offsets)

            // Assert
            expect(moved).toBe(layout)
        })
    })

    describe("isDraggable", () => {
        it("should drag files and folders wherever they are grabbed", () => {
            // Arrange
            const grabbedPaths = [file.path, folder.path]

            // Act
            const draggable = grabbedPaths.map(path => isDraggable(layout, path))

            // Assert
            expect(draggable).toEqual([true, true])
        })

        it("should never drag the root or a box that is not drawn", () => {
            // Arrange
            const grabbedPaths = [root.path, "/root/gone.ts"]

            // Act
            const draggable = grabbedPaths.map(path => isDraggable(layout, path))

            // Assert
            expect(draggable).toEqual([false, false])
        })
    })
})
