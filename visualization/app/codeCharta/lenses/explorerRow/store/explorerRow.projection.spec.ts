import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { projectExplorerRow } from "./explorerRow.projection"

const FOLDER = {
    name: "src",
    path: "/root/src",
    id: 1,
    type: NodeType.FOLDER,
    attributes: { rloc: 10, unary: 5 },
    children: [{ name: "a.ts", path: "/root/src/a.ts", id: 2, type: NodeType.FILE, attributes: { rloc: 4 } }]
} as unknown as CodeMapNode

const LEAF_WITH_BUILDING = { name: "a.ts", path: "/root/src/a.ts", id: 2, type: NodeType.FILE, attributes: { rloc: 4 } } as CodeMapNode
const LEAF_WITHOUT_BUILDING = { name: "b.ts", path: "/root/src/b.ts", id: 9, type: NodeType.FILE, attributes: { rloc: 4 } } as CodeMapNode
const LEAF_WITHOUT_AREA = { name: "c.ts", path: "/root/src/c.ts", id: 2, type: NodeType.FILE, attributes: { rloc: 0 } } as CodeMapNode

describe("projectExplorerRow", () => {
    describe("with the metrics (3D map) inputs", () => {
        const inputs = { areaMetric: "rloc", buildingIds: new Set([1, 2]), rootUnary: 10 }

        it("should make a leaf with a building selectable", () => {
            // Arrange & Act & Assert
            expect(projectExplorerRow(LEAF_WITH_BUILDING, inputs).isSelectable).toBe(true)
        })

        it("should not make a leaf without a building selectable", () => {
            // Arrange & Act & Assert
            expect(projectExplorerRow(LEAF_WITHOUT_BUILDING, inputs).isSelectable).toBe(false)
        })

        it("should keep folders selectable so they can still toggle open", () => {
            // Arrange & Act & Assert
            expect(projectExplorerRow(FOLDER, inputs).isSelectable).toBe(true)
        })

        it("should dim and italicize a row whose node has no area in the current area metric", () => {
            // Arrange & Act
            const projection = projectExplorerRow(LEAF_WITHOUT_AREA, inputs)

            // Assert
            expect(projection).toMatchObject({ isInactive: true, isItalic: true, title: "No Node Area for Chosen Metric" })
        })

        it("should leave a row with area undimmed and untitled", () => {
            // Arrange & Act
            const projection = projectExplorerRow(LEAF_WITH_BUILDING, inputs)

            // Assert
            expect(projection).toMatchObject({ isInactive: false, isItalic: false, title: "" })
        })

        it("should decorate a folder with its share of the root unary count", () => {
            // Arrange & Act & Assert
            expect(projectExplorerRow(FOLDER, inputs).decoration).toBe("50% / 5")
        })

        it("should not decorate a leaf", () => {
            // Arrange & Act & Assert
            expect(projectExplorerRow(LEAF_WITH_BUILDING, inputs).decoration).toBeNull()
        })
    })

    describe("with no inputs (a view with no 3D map)", () => {
        it("should render the trivial projection: selectable, undimmed, no decoration", () => {
            // Arrange & Act
            const projection = projectExplorerRow(LEAF_WITHOUT_AREA, {})

            // Assert
            expect(projection).toEqual({
                isSelectable: true,
                isInactive: false,
                isItalic: false,
                isFlattened: false,
                title: "",
                decoration: null
            })
        })
    })
})
