import { CodeMapNode, NodeType } from "../../../codeCharta.model"
import { _collectFolderPaths } from "./markableFolderPaths.selector"

describe("markableFolderPathsSelector", () => {
    it("should return an empty array when no map is loaded", () => {
        // Arrange & Act
        const result = _collectFolderPaths(undefined)

        // Assert
        expect(result).toEqual([])
    })

    it("should collect only folder paths, sorted by path", () => {
        // Arrange
        const root = {
            name: "root",
            path: "/root",
            type: NodeType.FOLDER,
            children: [
                { name: "main.ts", path: "/root/main.ts", type: NodeType.FILE },
                {
                    name: "zebra",
                    path: "/root/zebra",
                    type: NodeType.FOLDER,
                    children: [{ name: "util.ts", path: "/root/zebra/util.ts", type: NodeType.FILE }]
                },
                { name: "alpha", path: "/root/alpha", type: NodeType.FOLDER, children: [] }
            ]
        } as CodeMapNode

        // Act
        const result = _collectFolderPaths(root)

        // Assert
        expect(result).toEqual(["/root", "/root/alpha", "/root/zebra"])
    })
})
