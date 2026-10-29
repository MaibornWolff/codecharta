import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { relativePathOf, sampleFilePaths, vscodeFileLink } from "./localSourcePaths"

describe("localSourcePaths", () => {
    describe("relativePathOf", () => {
        it("should drop the root segment of a node path", () => {
            // Arrange
            const nodePath = "/root/src/main/Foo.kt"

            // Act
            const relativePath = relativePathOf(nodePath)

            // Assert
            expect(relativePath).toBe("src/main/Foo.kt")
        })

        it("should drop the folder a map gets while several maps are visible", () => {
            // Arrange
            const nodePath = "/root/myproject.cc.json/src/Foo.kt"

            // Act
            const relativePath = relativePathOf(nodePath, "myproject.cc.json")

            // Assert
            expect(relativePath).toBe("src/Foo.kt")
        })

        it("should give an empty path for the root itself", () => {
            // Arrange
            const nodePath = "/root"

            // Act
            const relativePath = relativePathOf(nodePath)

            // Assert
            expect(relativePath).toBe("")
        })
    })

    describe("vscodeFileLink", () => {
        it("should build the link from a Windows folder written with backslashes", () => {
            // Arrange
            const editorRootPath = "C:\\dev\\myproject\\"

            // Act
            const link = vscodeFileLink(editorRootPath, "src/Foo.kt")

            // Assert
            expect(link).toBe("vscode://file/C:/dev/myproject/src/Foo.kt")
        })

        it("should build the link from an absolute Unix folder", () => {
            // Arrange
            const editorRootPath = " /home/dev/myproject/ "

            // Act
            const link = vscodeFileLink(editorRootPath, "src/Foo.kt")

            // Assert
            expect(link).toBe("vscode://file/home/dev/myproject/src/Foo.kt")
        })

        it("should encode characters a link would otherwise misread", () => {
            // Arrange
            const editorRootPath = "/home/dev/my project"

            // Act
            const link = vscodeFileLink(editorRootPath, "src/C#/Foo?.cs")

            // Assert
            expect(link).toBe("vscode://file/home/dev/my%20project/src/C%23/Foo%3F.cs")
        })
    })

    describe("sampleFilePaths", () => {
        const file = (name: string): CodeMapNode => ({ name, type: NodeType.FILE, attributes: {} }) as CodeMapNode
        const folder = (name: string, children: CodeMapNode[]): CodeMapNode =>
            ({ name, type: NodeType.FOLDER, attributes: {}, children }) as CodeMapNode

        it("should list file paths below the root, nearest files first", () => {
            // Arrange
            const root = folder("root", [folder("src", [folder("deep", [file("C.kt")]), file("B.kt")]), file("A.kt")])

            // Act
            const samples = sampleFilePaths(root, 10)

            // Assert
            expect(samples).toEqual(["A.kt", "src/B.kt", "src/deep/C.kt"])
        })

        it("should stop at the sample size", () => {
            // Arrange
            const root = folder("root", [file("A.kt"), file("B.kt"), file("C.kt")])

            // Act
            const samples = sampleFilePaths(root, 2)

            // Assert
            expect(samples).toEqual(["A.kt", "B.kt"])
        })

        it("should skip folders without children", () => {
            // Arrange
            const emptyFolder = { name: "empty", type: NodeType.FOLDER, attributes: {} } as CodeMapNode
            const root = folder("root", [emptyFolder, file("A.kt")])

            // Act
            const samples = sampleFilePaths(root, 10)

            // Assert
            expect(samples).toEqual(["A.kt"])
        })

        it("should find no samples in a map without children", () => {
            // Arrange
            const root = { name: "root", type: NodeType.FOLDER, attributes: {} } as CodeMapNode

            // Act
            const samples = sampleFilePaths(root, 10)

            // Assert
            expect(samples).toEqual([])
        })
    })
})
