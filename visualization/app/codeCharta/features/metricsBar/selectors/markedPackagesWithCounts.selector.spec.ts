import { CodeMapNode, NodeType } from "../../../codeCharta.model"
import { _calculateMarkedPackagesWithCounts } from "./markedPackagesWithCounts.selector"

describe("markedPackagesWithCountsSelector", () => {
    const file = (path: string) => ({ name: path.split("/").pop(), path, type: NodeType.FILE }) as CodeMapNode

    it("should return an empty array when no packages are marked", () => {
        // Arrange
        const nodes = [file("/root/app/main.ts")]

        // Act
        const result = _calculateMarkedPackagesWithCounts([], nodes)

        // Assert
        expect(result).toEqual([])
    })

    it("should count the files inside a marked package", () => {
        // Arrange
        const markedPackages = [{ path: "/root/app", color: "#ff0000" }]
        const nodes = [file("/root/app/main.ts"), file("/root/app/sub/util.ts"), file("/root/other/readme.md")]

        // Act
        const result = _calculateMarkedPackagesWithCounts(markedPackages, nodes)

        // Assert
        expect(result).toEqual([{ path: "/root/app", color: "#ff0000", fileCount: 2 }])
    })

    it("should attribute files of a nested marked package only to the deepest package", () => {
        // Arrange
        const markedPackages = [
            { path: "/root/app", color: "#ff0000" },
            { path: "/root/app/sub", color: "#00ff00" }
        ]
        const nodes = [file("/root/app/main.ts"), file("/root/app/sub/util.ts"), file("/root/app/sub/helper.ts")]

        // Act
        const result = _calculateMarkedPackagesWithCounts(markedPackages, nodes)

        // Assert
        expect(result).toEqual([
            { path: "/root/app", color: "#ff0000", fileCount: 1 },
            { path: "/root/app/sub", color: "#00ff00", fileCount: 2 }
        ])
    })

    it("should not count files of sibling folders sharing a path prefix", () => {
        // Arrange
        const markedPackages = [{ path: "/root/app", color: "#ff0000" }]
        const nodes = [file("/root/app2/main.ts")]

        // Act
        const result = _calculateMarkedPackagesWithCounts(markedPackages, nodes)

        // Assert
        expect(result).toEqual([{ path: "/root/app", color: "#ff0000", fileCount: 0 }])
    })

    it("should sort the marked packages by path", () => {
        // Arrange
        const markedPackages = [
            { path: "/root/zebra", color: "#ff0000" },
            { path: "/root/alpha", color: "#00ff00" }
        ]

        // Act
        const result = _calculateMarkedPackagesWithCounts(markedPackages, [])

        // Assert
        expect(result.map(markedPackage => markedPackage.path)).toEqual(["/root/alpha", "/root/zebra"])
    })
})
