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

    describe("sorting by area size", () => {
        it("should sort by area metric in descending order when sortingOption is AREA_SIZE", () => {
            const node: CodeMapNode = {
                name: "root",
                type: NodeType.FOLDER,
                attributes: { unary: 100, rloc: 1000 },
                children: [
                    {
                        name: "smallFile.ts",
                        type: NodeType.FILE,
                        attributes: { unary: 1, rloc: 50 }
                    },
                    {
                        name: "largeFile.ts",
                        type: NodeType.FILE,
                        attributes: { unary: 1, rloc: 500 }
                    },
                    {
                        name: "mediumFile.ts",
                        type: NodeType.FILE,
                        attributes: { unary: 1, rloc: 200 }
                    }
                ]
            }

            const result = sortNodesInPlace(klona(node), SortingOption.AREA_SIZE, false, "rloc")

            expect(result.children[0].name).toBe("largeFile.ts")
            expect(result.children[1].name).toBe("mediumFile.ts")
            expect(result.children[2].name).toBe("smallFile.ts")
        })

        it("should sort folders before files and both by area metric", () => {
            const node: CodeMapNode = {
                name: "root",
                type: NodeType.FOLDER,
                attributes: { unary: 100, rloc: 1000 },
                children: [
                    {
                        name: "smallFolder",
                        type: NodeType.FOLDER,
                        attributes: { unary: 10, rloc: 100 },
                        children: []
                    },
                    {
                        name: "largeFile.ts",
                        type: NodeType.FILE,
                        attributes: { unary: 1, rloc: 900 }
                    },
                    {
                        name: "largeFolder",
                        type: NodeType.FOLDER,
                        attributes: { unary: 50, rloc: 500 },
                        children: []
                    },
                    {
                        name: "smallFile.ts",
                        type: NodeType.FILE,
                        attributes: { unary: 1, rloc: 50 }
                    }
                ]
            }

            const result = sortNodesInPlace(klona(node), SortingOption.AREA_SIZE, false, "rloc")

            expect(result.children[0].name).toBe("largeFolder")
            expect(result.children[1].name).toBe("smallFolder")
            expect(result.children[2].name).toBe("largeFile.ts")
            expect(result.children[3].name).toBe("smallFile.ts")
        })

        it("should handle nodes with missing area metric values by treating them as zero", () => {
            const node: CodeMapNode = {
                name: "root",
                type: NodeType.FOLDER,
                attributes: { unary: 100 },
                children: [
                    {
                        name: "fileWithMetric.ts",
                        type: NodeType.FILE,
                        attributes: { unary: 1, rloc: 100 }
                    },
                    {
                        name: "fileWithoutMetric.ts",
                        type: NodeType.FILE,
                        attributes: { unary: 1 }
                    },
                    {
                        name: "anotherFileWithMetric.ts",
                        type: NodeType.FILE,
                        attributes: { unary: 1, rloc: 50 }
                    }
                ]
            }

            const result = sortNodesInPlace(klona(node), SortingOption.AREA_SIZE, false, "rloc")

            expect(result.children[0].name).toBe("fileWithMetric.ts")
            expect(result.children[1].name).toBe("anotherFileWithMetric.ts")
            expect(result.children[2].name).toBe("fileWithoutMetric.ts")
        })

        it("should use alphabetical name as tiebreaker for equal area metric values", () => {
            const node: CodeMapNode = {
                name: "root",
                type: NodeType.FOLDER,
                attributes: { unary: 100, rloc: 1000 },
                children: [
                    {
                        name: "zebra.ts",
                        type: NodeType.FILE,
                        attributes: { unary: 1, rloc: 100 }
                    },
                    {
                        name: "alpha.ts",
                        type: NodeType.FILE,
                        attributes: { unary: 1, rloc: 100 }
                    },
                    {
                        name: "beta.ts",
                        type: NodeType.FILE,
                        attributes: { unary: 1, rloc: 100 }
                    }
                ]
            }

            const result = sortNodesInPlace(klona(node), SortingOption.AREA_SIZE, true, "rloc")

            expect(result.children[0].name).toBe("alpha.ts")
            expect(result.children[1].name).toBe("beta.ts")
            expect(result.children[2].name).toBe("zebra.ts")
        })

        it("should recursively sort nested folders by area size", () => {
            const node: CodeMapNode = {
                name: "root",
                type: NodeType.FOLDER,
                attributes: { unary: 100, rloc: 1000 },
                children: [
                    {
                        name: "folderB",
                        type: NodeType.FOLDER,
                        attributes: { unary: 50, rloc: 300 },
                        children: [
                            {
                                name: "file2.ts",
                                type: NodeType.FILE,
                                attributes: { unary: 1, rloc: 200 }
                            },
                            {
                                name: "file1.ts",
                                type: NodeType.FILE,
                                attributes: { unary: 1, rloc: 100 }
                            }
                        ]
                    },
                    {
                        name: "folderA",
                        type: NodeType.FOLDER,
                        attributes: { unary: 30, rloc: 600 },
                        children: [
                            {
                                name: "fileZ.ts",
                                type: NodeType.FILE,
                                attributes: { unary: 1, rloc: 50 }
                            },
                            {
                                name: "fileA.ts",
                                type: NodeType.FILE,
                                attributes: { unary: 1, rloc: 550 }
                            }
                        ]
                    }
                ]
            }

            const result = sortNodesInPlace(klona(node), SortingOption.AREA_SIZE, false, "rloc")

            expect(result.children[0].name).toBe("folderA")
            expect(result.children[1].name).toBe("folderB")
            expect(result.children[0].children[0].name).toBe("fileA.ts")
            expect(result.children[0].children[1].name).toBe("fileZ.ts")
            expect(result.children[1].children[0].name).toBe("file2.ts")
            expect(result.children[1].children[1].name).toBe("file1.ts")
        })

        it("should sort in ascending order when sortingOrderAscending is true", () => {
            const node: CodeMapNode = {
                name: "root",
                type: NodeType.FOLDER,
                attributes: { unary: 100, rloc: 1000 },
                children: [
                    {
                        name: "largeFile.ts",
                        type: NodeType.FILE,
                        attributes: { unary: 1, rloc: 500 }
                    },
                    {
                        name: "smallFile.ts",
                        type: NodeType.FILE,
                        attributes: { unary: 1, rloc: 50 }
                    },
                    {
                        name: "mediumFile.ts",
                        type: NodeType.FILE,
                        attributes: { unary: 1, rloc: 200 }
                    }
                ]
            }

            const result = sortNodesInPlace(klona(node), SortingOption.AREA_SIZE, true, "rloc")

            expect(result.children[0].name).toBe("smallFile.ts")
            expect(result.children[1].name).toBe("mediumFile.ts")
            expect(result.children[2].name).toBe("largeFile.ts")
        })

        it("should handle zero and undefined area metrics correctly", () => {
            const node: CodeMapNode = {
                name: "root",
                type: NodeType.FOLDER,
                attributes: { unary: 100 },
                children: [
                    {
                        name: "fileWithZero.ts",
                        type: NodeType.FILE,
                        attributes: { unary: 1, rloc: 0 }
                    },
                    {
                        name: "fileWithValue.ts",
                        type: NodeType.FILE,
                        attributes: { unary: 1, rloc: 100 }
                    },
                    {
                        name: "fileWithUndefined.ts",
                        type: NodeType.FILE,
                        attributes: { unary: 1 }
                    }
                ]
            }

            const result = sortNodesInPlace(klona(node), SortingOption.AREA_SIZE, false, "rloc")

            expect(result.children[0].name).toBe("fileWithValue.ts")
            expect(result.children[1].name).toBe("fileWithZero.ts")
            expect(result.children[2].name).toBe("fileWithUndefined.ts")
        })
    })
})
