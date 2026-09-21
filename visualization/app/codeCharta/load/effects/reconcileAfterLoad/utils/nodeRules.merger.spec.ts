import { TEST_FILE_DATA } from "../../../../mocks/dataMocks"
import { CCFile, ImportedNodeRule } from "../../../../model/codeCharta.model"
import { clone } from "../../../../util/clone"
import { getMergedNodeRules } from "./nodeRules.merger"

describe("nodeRules.merger", () => {
    let file1: CCFile
    let file2: CCFile

    beforeEach(() => {
        file1 = clone(TEST_FILE_DATA)
        file1.fileMeta.fileName = "file1"

        file2 = clone(TEST_FILE_DATA)
        file2.fileMeta.fileName = "file2"
    })

    describe("getMergedNodeRules", () => {
        const excludeNodeA: ImportedNodeRule = { path: "/root/nodeA", type: "exclude" }
        const flattenNodeB: ImportedNodeRule = { path: "/another/nodeB", type: "flatten" }
        const excludeNodeC: ImportedNodeRule = { path: "/another/nodeC", type: "exclude" }
        const flattenNodeD: ImportedNodeRule = { path: "*prefix/nodeD", type: "flatten" }
        const excludeNodeADuplicate: ImportedNodeRule = { path: "/root/nodeA", type: "exclude" }

        it("should split the rules the files carried into the two lists", () => {
            // Arrange
            file1.settings.fileSettings.blacklist = [excludeNodeA, flattenNodeB]
            file2.settings.fileSettings.blacklist = [excludeNodeC, flattenNodeD]

            // Act
            const { excludedNodes, flattenedNodes } = getMergedNodeRules([file1, file2], false)

            // Assert
            expect(excludedNodes).toEqual([{ path: "/root/nodeA" }, { path: "/another/nodeC" }])
            expect(flattenedNodes).toEqual([{ path: "/another/nodeB" }, { path: "*prefix/nodeD" }])
        })

        it("should keep a path only once when two files carry the same rule", () => {
            // Arrange
            file1.settings.fileSettings.blacklist = [excludeNodeA, flattenNodeB]
            file2.settings.fileSettings.blacklist = [excludeNodeADuplicate, flattenNodeD]

            // Act
            const { excludedNodes, flattenedNodes } = getMergedNodeRules([file1, file2], false)

            // Assert
            expect(excludedNodes).toEqual([{ path: "/root/nodeA" }])
            expect(flattenedNodes).toEqual([{ path: "/another/nodeB" }, { path: "*prefix/nodeD" }])
        })

        it("should keep the same path twice when the two files disagree on what it does", () => {
            // Arrange
            file1.settings.fileSettings.blacklist = [excludeNodeA]
            file2.settings.fileSettings.blacklist = [{ path: "/root/nodeA", type: "flatten" }]

            // Act
            const { excludedNodes, flattenedNodes } = getMergedNodeRules([file1, file2], false)

            // Assert
            expect(excludedNodes).toEqual([{ path: "/root/nodeA" }])
            expect(flattenedNodes).toEqual([{ path: "/root/nodeA" }])
        })
    })
})
