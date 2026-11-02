import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { _shownFiles } from "./shownFiles.selector"

const file = (path: string, isExcluded = false, attributes = {}) =>
    ({ name: path, path, type: NodeType.FILE, isExcluded, attributes }) as unknown as CodeMapNode
const folder = (path: string, children: CodeMapNode[]) => ({ name: path, path, type: NodeType.FOLDER, children }) as unknown as CodeMapNode

describe("shownFiles", () => {
    it("should list files, not folders and not excluded files", () => {
        // Arrange
        const shownFile = file("/root/a")
        const nodes = [folder("/root", [shownFile]), shownFile, file("/root/excluded", true)]

        // Act
        const files = _shownFiles(nodes, undefined)

        // Assert
        expect([...files.keys()]).toEqual(["/root/a"])
    })

    it("should list only the files inside the focused folder", () => {
        // Arrange
        const nodes = [file("/root/src/a"), file("/root/src2/b"), file("/root/c")]

        // Act
        const files = _shownFiles(nodes, "/root/src")

        // Assert
        expect([...files.keys()]).toEqual(["/root/src/a"])
    })
    it("should hand over the attributes of each shown file", () => {
        // Arrange
        const nodes = [file("/root/a", false, { loc: 12 })]

        // Act
        const files = _shownFiles(nodes, undefined)

        // Assert
        expect(files.get("/root/a")).toEqual({ loc: 12 })
    })
})
