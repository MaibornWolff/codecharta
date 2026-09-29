import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { dependencySearchedPathsSelector, dependencyTreeSelector } from "./dependencyMap.selectors"

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

describe("dependencySearchedPathsSelector", () => {
    it("should hand on what the search found while a search is on", () => {
        // Arrange
        const found = new Set(["/root/app"])

        // Act
        const searched = dependencySearchedPathsSelector.projector("app", found)

        // Assert
        expect(searched).toBe(found)
    })

    it("should find nothing to fade while the search pattern is empty", () => {
        // Act
        const searched = dependencySearchedPathsSelector.projector("!", new Set())

        // Assert
        expect(searched).toBeNull()
    })
})
