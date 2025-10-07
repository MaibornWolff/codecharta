import { klona } from "klona"
import {
    VALID_NODE_NUMBERS_AND_DIACTRIC_CHARACHTERS,
    VALID_NODE_NUMBERS_AND_DIACTRIC_CHARACHTERS_SORTED,
    VALID_NODE_WITH_MULTIPLE_FOLDERS,
    VALID_NODE_WITH_MULTIPLE_FOLDERS_REVERSED,
    VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_NAME,
    VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_UNARY
} from "../../../../../util/dataMocks"
import { CodeMapNode, NodeType, SortingOption } from "../../../../../codeCharta.model"
import { sortNodesInPlace } from "./sortNodesInPlace"

describe("sortNode", () => {
    it("should reverse order if 'sortingOrderAscending' is false", () => {
        const node = klona(VALID_NODE_WITH_MULTIPLE_FOLDERS)
        expect(sortNodesInPlace(node, SortingOption.NAME, false)).toEqual(VALID_NODE_WITH_MULTIPLE_FOLDERS_REVERSED)
    })

    it("should sort by name, if sortingOption is set to SortingOption.NAME", () => {
        const node = klona(VALID_NODE_WITH_MULTIPLE_FOLDERS)
        expect(sortNodesInPlace(node, SortingOption.NAME, true)).toEqual(VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_NAME)
    })

    it("should sort by unary value, if sortingOption is set to SortingOption.NUMBER_OF_FILES", () => {
        const node = klona(VALID_NODE_WITH_MULTIPLE_FOLDERS)
        expect(sortNodesInPlace(node, SortingOption.NUMBER_OF_FILES, false)).toEqual(VALID_NODE_WITH_MULTIPLE_FOLDERS_SORTED_BY_UNARY)
    })

    it("should sort according to name accounting for numbers", () => {
        const node = klona(VALID_NODE_NUMBERS_AND_DIACTRIC_CHARACHTERS)
        expect(sortNodesInPlace(node, SortingOption.NAME, true)).toEqual(VALID_NODE_NUMBERS_AND_DIACTRIC_CHARACHTERS_SORTED)
    })

    it("should handle nodes without children", () => {
        const nodeWithoutChildren: CodeMapNode = {
            name: "leaf",
            type: NodeType.FILE,
            attributes: { unary: 1 }
        }

        const result = sortNodesInPlace(nodeWithoutChildren, SortingOption.NAME, true)
        expect(result).toEqual(nodeWithoutChildren)
    })

    it("should recursively sort nested folders", () => {
        const nestedNode: CodeMapNode = {
            name: "root",
            type: NodeType.FOLDER,
            attributes: { unary: 100 },
            children: [
                {
                    name: "folderB",
                    type: NodeType.FOLDER,
                    attributes: { unary: 50 },
                    children: [
                        { name: "file2.ts", type: NodeType.FILE, attributes: { unary: 2 } },
                        { name: "file1.ts", type: NodeType.FILE, attributes: { unary: 1 } }
                    ]
                },
                {
                    name: "folderA",
                    type: NodeType.FOLDER,
                    attributes: { unary: 30 },
                    children: [
                        { name: "fileZ.ts", type: NodeType.FILE, attributes: { unary: 1 } },
                        { name: "fileA.ts", type: NodeType.FILE, attributes: { unary: 1 } }
                    ]
                }
            ]
        }

        const result = sortNodesInPlace(klona(nestedNode), SortingOption.NAME, true)

        expect(result.children[0].name).toBe("folderA")
        expect(result.children[1].name).toBe("folderB")
        expect(result.children[0].children[0].name).toBe("fileA.ts")
        expect(result.children[0].children[1].name).toBe("fileZ.ts")
        expect(result.children[1].children[0].name).toBe("file1.ts")
        expect(result.children[1].children[1].name).toBe("file2.ts")
    })
})
