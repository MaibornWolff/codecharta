import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { dependencyTreeSelector } from "./dependencyMap.selectors"

const appFolder: CodeMapNode = {
    name: "app",
    path: "/root/app",
    type: NodeType.FOLDER,
    children: [{ name: "a.ts", path: "/root/app/a.ts", type: NodeType.FILE }]
}
const root: CodeMapNode = { name: "root", path: "/root", type: NodeType.FOLDER, children: [appFolder] }
const levels = { "/root/app/a.ts": 0 }
const pathToNode = new Map([
    ["/root", root],
    ["/root/app", appFolder]
])

describe("dependencyTreeSelector", () => {
    it("should build the leveled tree of the whole map", () => {
        // Arrange
        const accumulatedData = { unifiedMapNode: root, unifiedFileMeta: undefined }

        // Act
        const tree = dependencyTreeSelector.projector(accumulatedData, pathToNode, "", levels)

        // Assert
        expect(tree).toMatchObject({ path: "/root/app", name: "root/app" })
        expect(tree.children[0].path).toBe("/root/app/a.ts")
    })

    it("should start at the focused folder", () => {
        // Arrange
        const accumulatedData = { unifiedMapNode: root, unifiedFileMeta: undefined }

        // Act
        const tree = dependencyTreeSelector.projector(accumulatedData, pathToNode, "/root/app", levels)

        // Assert
        expect(tree).toMatchObject({ path: "/root/app", name: "app" })
    })

    it("should be null while no map is loaded", () => {
        // Arrange
        const accumulatedData = { unifiedMapNode: undefined, unifiedFileMeta: undefined }

        // Act
        const tree = dependencyTreeSelector.projector(accumulatedData, new Map(), "", levels)

        // Assert
        expect(tree).toBeNull()
    })
})
