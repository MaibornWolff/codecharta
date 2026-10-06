import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { FileState } from "../../../model/files/files"
import {
    dependencyLayoutIdentitySelector,
    dependencySearchedPathsOrNullSelector,
    dependencyTreeSelector,
    focusedFolderLevelPathSelector,
    isDependencyMapFocusedSelector
} from "./dependencyMap.selectors"

const appFolder: CodeMapNode = {
    name: "app",
    path: "/root/app",
    type: NodeType.FOLDER,
    children: [{ name: "a.ts", path: "/root/app/a.ts", type: NodeType.FILE }]
}
const root: CodeMapNode = { name: "root", path: "/root", type: NodeType.FOLDER, children: [appFolder] }
const levels = { "/root/app/a.ts": 0 }
const declarations = { namespaces: {}, leaves: { "/root/app/a.ts": { helper: { name: "helper", kind: "function" } } }, leafEdges: [] }
const pathToNode = new Map([
    ["/root", root],
    ["/root/app", appFolder]
])

describe("dependencyTreeSelector", () => {
    it("should build the leveled tree of the whole map", () => {
        // Arrange
        const accumulatedData = { unifiedMapNode: root, unifiedFileMeta: undefined }

        // Act
        const tree = dependencyTreeSelector.projector(accumulatedData, pathToNode, "", levels, declarations)

        // Assert
        expect(tree).toMatchObject({ path: "/root/app", name: "root/app" })
        expect(tree.children[0].path).toBe("/root/app/a.ts")
        expect(tree.children[0].children.map(declaration => declaration.path)).toEqual(["/root/app/a.ts/helper"])
    })

    it("should start at the focused folder", () => {
        // Arrange
        const accumulatedData = { unifiedMapNode: root, unifiedFileMeta: undefined }

        // Act
        const tree = dependencyTreeSelector.projector(accumulatedData, pathToNode, "/root/app", levels, declarations)

        // Assert
        expect(tree).toMatchObject({ path: "/root/app", name: "app" })
    })

    it("should be null while no map is loaded", () => {
        // Arrange
        const accumulatedData = { unifiedMapNode: undefined, unifiedFileMeta: undefined }

        // Act
        const tree = dependencyTreeSelector.projector(accumulatedData, new Map(), "", levels, declarations)

        // Assert
        expect(tree).toBeNull()
    })
})

describe("focusedFolderLevelPathSelector", () => {
    const coreFolder: CodeMapNode = {
        name: "core",
        path: "/root/lib/core",
        type: NodeType.FOLDER,
        children: [{ name: "io.ts", path: "/root/lib/core/io.ts", type: NodeType.FILE }]
    }
    const libFolder: CodeMapNode = {
        name: "lib",
        path: "/root/lib",
        type: NodeType.FOLDER,
        children: [coreFolder, { name: "index.ts", path: "/root/lib/index.ts", type: NodeType.FILE }]
    }
    const wholeMap: CodeMapNode = { name: "root", path: "/root", type: NodeType.FOLDER, children: [appFolder, libFolder] }
    const accumulatedData = { unifiedMapNode: wholeMap, unifiedFileMeta: undefined }
    const nestedLevels = { ...levels, "/root/lib": 2, "/root/lib/core": 1, "/root/lib/core/io.ts": 0, "/root/lib/index.ts": 0 }

    it("should list the levels leading from the root to the focused folder", () => {
        // Act
        const levelPath = focusedFolderLevelPathSelector.projector(accumulatedData, "/root/lib/core", nestedLevels)

        // Assert
        expect(levelPath).toEqual([2, 1])
    })

    it.each([
        ["no folder is focused", ""],
        ["the focused folder carries no dependency levels", "/root/docs"]
    ])("should list no levels while %s", (_situation, focusedNodePath) => {
        // Act
        const levelPath = focusedFolderLevelPathSelector.projector(accumulatedData, focusedNodePath, nestedLevels)

        // Assert
        expect(levelPath).toEqual([])
    })
})

describe("dependencySearchedPathsOrNullSelector", () => {
    it("should hand on what the search found while a search is on", () => {
        // Arrange
        const found = new Set(["/root/app"])

        // Act
        const searched = dependencySearchedPathsOrNullSelector.projector("app", found)

        // Assert
        expect(searched).toBe(found)
    })

    it("should find nothing to fade while the search pattern is empty", () => {
        // Arrange
        const emptyPattern = "!"

        // Act
        const searched = dependencySearchedPathsOrNullSelector.projector(emptyPattern, new Set())

        // Assert
        expect(searched).toBeNull()
    })
})

function fileStateWithChecksum(fileChecksum: string): FileState {
    return { file: { fileMeta: { fileChecksum } } } as FileState
}

describe("dependencyLayoutIdentitySelector", () => {
    it("should stay the same for the same files in another order and the same focus", () => {
        // Arrange
        const fileStates = [fileStateWithChecksum("a"), fileStateWithChecksum("b")]

        // Act
        const identity = dependencyLayoutIdentitySelector.projector(fileStates, "/root/app")
        const reorderedIdentity = dependencyLayoutIdentitySelector.projector([...fileStates].reverse(), "/root/app")

        // Assert
        expect(reorderedIdentity).toBe(identity)
    })

    it.each([
        ["other files", [fileStateWithChecksum("c")], "/root/app"],
        ["another focus", [fileStateWithChecksum("a")], "/root"],
        ["no focus", [fileStateWithChecksum("a")], undefined]
    ])("should change for %s", (_, fileStates, focusedNodePath) => {
        // Arrange
        const identity = dependencyLayoutIdentitySelector.projector([fileStateWithChecksum("a")], "/root/app")

        // Act
        const otherIdentity = dependencyLayoutIdentitySelector.projector(fileStates, focusedNodePath)

        // Assert
        expect(otherIdentity).not.toBe(identity)
    })
})

describe("isDependencyMapFocusedSelector", () => {
    it.each([
        ["/root/app", true],
        [undefined, false]
    ])("should tell whether %s is a focus", (focusedNodePath, expected) => {
        // Arrange
        const focus = focusedNodePath

        // Act
        const isFocused = isDependencyMapFocusedSelector.projector(focus)

        // Assert
        expect(isFocused).toBe(expected)
    })
})
