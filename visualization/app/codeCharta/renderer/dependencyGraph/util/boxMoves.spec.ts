import { canDragBoxAt, movedLayout } from "./boxMoves"
import { aBand, aBox } from "./dependencyGraphTestData"
import { DependencyGraphLayout, LAYOUT_SPACING } from "./levelizedLayout"

const root = aBox("/root", { isFolder: true, isExpanded: true, depth: 0, x: 0, y: 0, width: 1000, height: 600 })
const folder = aBox("/root/app", { isFolder: true, isExpanded: true, depth: 1, x: 100, y: 100, width: 400, height: 300 })
const file = aBox("/root/app/a.ts", { depth: 2, x: 150, y: 170 })
const other = aBox("/root/lib.ts", { depth: 1, x: 600, y: 100 })
const layout: DependencyGraphLayout = {
    boxes: [root, folder, file, other],
    bands: [aBand({ folderPath: "/root/app", x: 100, y: 170, width: 400 })],
    width: 1000,
    height: 600
}

function boxAt(moved: DependencyGraphLayout, path: string) {
    return moved.boxes.find(box => box.path === path)
}

describe("boxMoves", () => {
    describe("movedLayout", () => {
        it("should shift a moved folder with everything inside it and its level bands", () => {
            // Act
            const moved = movedLayout(layout, new Map([["/root/app", [50, 20]]]))

            // Assert
            expect(boxAt(moved, "/root/app")).toMatchObject({ x: 150, y: 120, width: 400 })
            expect(boxAt(moved, "/root/app/a.ts")).toMatchObject({ x: 200, y: 190 })
            expect(boxAt(moved, "/root/lib.ts")).toBe(other)
            expect(moved.bands[0]).toMatchObject({ x: 150, y: 190, width: 400 })
            expect(moved.width).toBe(1000)
        })

        it("should add up a folder's move and its child's own", () => {
            // Act
            const moved = movedLayout(
                layout,
                new Map([
                    ["/root/app", [50, 0]],
                    ["/root/app/a.ts", [10, 10]]
                ])
            )

            // Assert
            expect(boxAt(moved, "/root/app/a.ts")).toMatchObject({ x: 210, y: 180 })
        })

        it("should grow the folder, and its level bands, to hold a box dragged past its edge", () => {
            // Act
            const moved = movedLayout(layout, new Map([["/root/app/a.ts", [-200, 0]]]))

            // Assert
            const grown = boxAt(moved, "/root/app")
            expect(grown.x).toBe(150 - 200 - LAYOUT_SPACING.padding)
            expect(grown.x + grown.width).toBe(500)
            expect(moved.bands[0]).toMatchObject({ x: grown.x, width: grown.width })
        })

        it("should grow every folder up the tree that the moved box reaches past", () => {
            // Act
            const moved = movedLayout(layout, new Map([["/root/app/a.ts", [0, 1000]]]))

            // Assert
            const grownFolder = boxAt(moved, "/root/app")
            expect(grownFolder.y + grownFolder.height).toBe(170 + 1000 + 40 + LAYOUT_SPACING.padding)
            expect(boxAt(moved, "/root").height).toBe(grownFolder.y + grownFolder.height + LAYOUT_SPACING.padding)
        })

        it("should return the layout itself while nothing is moved", () => {
            // Act
            const moved = movedLayout(layout, new Map())

            // Assert
            expect(moved).toBe(layout)
        })
    })

    describe("canDragBoxAt", () => {
        it("should drag a file anywhere on it", () => {
            // Act
            const canDrag = canDragBoxAt(layout, "/root/app/a.ts", [200, 200])

            // Assert
            expect(canDrag).toBe(true)
        })

        it("should drag an open folder by its header only", () => {
            // Act
            const byHeader = canDragBoxAt(layout, "/root/app", [200, 110])
            const byInside = canDragBoxAt(layout, "/root/app", [200, 300])

            // Assert
            expect([byHeader, byInside]).toEqual([true, false])
        })

        it("should never drag the root or a box that is not drawn", () => {
            // Act
            const rootDrag = canDragBoxAt(layout, "/root", [10, 10])
            const missing = canDragBoxAt(layout, "/root/gone.ts", [10, 10])

            // Assert
            expect([rootDrag, missing]).toEqual([false, false])
        })
    })
})
