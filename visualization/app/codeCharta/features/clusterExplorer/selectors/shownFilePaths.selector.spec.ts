import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { _shownFilePaths } from "./shownFilePaths.selector"

const file = (path: string, isExcluded = false) => ({ name: path, path, type: NodeType.FILE, isExcluded }) as unknown as CodeMapNode
const folder = (path: string, children: CodeMapNode[]) => ({ name: path, path, type: NodeType.FOLDER, children }) as unknown as CodeMapNode

describe("shownFilePaths", () => {
    it("should list files, not folders and not excluded files", () => {
        // Arrange
        const shownFile = file("/root/a")
        const nodes = [folder("/root", [shownFile]), shownFile, file("/root/excluded", true)]

        // Act
        const paths = _shownFilePaths(nodes, undefined)

        // Assert
        expect([...paths]).toEqual(["/root/a"])
    })

    it("should list only the files inside the focused folder", () => {
        // Arrange
        const nodes = [file("/root/src/a"), file("/root/src2/b"), file("/root/c")]

        // Act
        const paths = _shownFilePaths(nodes, "/root/src")

        // Assert
        expect([...paths]).toEqual(["/root/src/a"])
    })
})
