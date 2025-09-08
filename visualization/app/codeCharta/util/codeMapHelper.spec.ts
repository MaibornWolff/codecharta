import { CCFile, CodeMapNode, MarkedPackage, NodeType } from "../codeCharta.model"
import packageJson from "../../../package.json"
import { getAllNodes, getMapResolutionScaleFactor, getMarkingColor, MAP_RESOLUTION_SCALE } from "./codeMapHelper"
import { FileSelectionState, FileState } from "../model/files/files"
import { VALID_NODE_WITH_PATH } from "./dataMocks"

describe("CodeMapHelper", () => {
    describe("getMarkingColor", () => {
        const markedRootPackage: MarkedPackage = { path: "folder/to/mark", color: "#ffffff" }

        it("should return the marked color for the marked root package", () => {
            const rootNodeToMark: CodeMapNode = { name: "RootFolder", type: NodeType.FOLDER, path: markedRootPackage.path }
            expect(getMarkingColor(rootNodeToMark, [markedRootPackage])).toEqual(markedRootPackage.color)
        })

        it("should return no color for siblings that match the same name as the marked package", () => {
            const siblingNode: CodeMapNode = {
                name: "SiblingFolderWithTheSameStartingPath",
                type: NodeType.FOLDER,
                path: `${markedRootPackage.path}-extra-text`
            }
            expect(getMarkingColor(siblingNode, [markedRootPackage])).toBeUndefined()
        })

        it("should return the marked color for all childrens of the marked root package", () => {
            const childNode1: CodeMapNode = { name: "ChildFolder", type: NodeType.FOLDER, path: `${markedRootPackage.path}/sibling` }
            const childNode2: CodeMapNode = {
                name: "DeeperChildFolder",
                type: NodeType.FOLDER,
                path: `${markedRootPackage.path}/deeper/sibling`
            }

            expect(getMarkingColor(childNode1, [markedRootPackage])).toEqual(markedRootPackage.color)
            expect(getMarkingColor(childNode2, [markedRootPackage])).toEqual(markedRootPackage.color)
        })
    })
    describe("getMapResolutionScaleFactor", () => {
        it("should get map resolution scale factor SMALL for a single and multiple maps", () => {
            const smallFile1 = {
                fileMeta: {
                    fileName: "file1",
                    fileChecksum: "invalid-md5-checksum-1",
                    projectName: "Sample Project",
                    apiVersion: packageJson.codecharta.apiVersion,
                    exportedFileSize: 1024 // 1MB
                }
            } as CCFile

            const smallFile2 = {
                fileMeta: {
                    fileName: "file1",
                    fileChecksum: "invalid-md5-checksum-1",
                    projectName: "Sample Project",
                    apiVersion: packageJson.codecharta.apiVersion,
                    exportedFileSize: 1023 * 1024 // nearly 1 MB
                }
            } as CCFile

            const fileStateSingle: FileState[] = [{ file: smallFile1, selectedAs: FileSelectionState.Partial }]

            expect(getMapResolutionScaleFactor(fileStateSingle)).toBe(MAP_RESOLUTION_SCALE.SMALL_MAP)

            const fileStateMultiple: FileState[] = [
                {
                    file: smallFile1,
                    selectedAs: FileSelectionState.Partial
                },
                {
                    file: smallFile2,
                    selectedAs: FileSelectionState.Partial
                }
            ]

            expect(getMapResolutionScaleFactor(fileStateMultiple)).toBe(MAP_RESOLUTION_SCALE.SMALL_MAP)
        })

        it("should get map resolution scale factor MEDIUM for a single map", () => {
            const oneMBFile = {
                fileMeta: {
                    fileName: "file1",
                    fileChecksum: "invalid-md5-checksum-1",
                    projectName: "Sample Project",
                    apiVersion: packageJson.codecharta.apiVersion,
                    exportedFileSize: 2048 * 1024 // 2MB
                }
            } as CCFile

            const fileStateSingle: FileState[] = [{ file: oneMBFile, selectedAs: FileSelectionState.Partial }]

            expect(getMapResolutionScaleFactor(fileStateSingle)).toBe(MAP_RESOLUTION_SCALE.MEDIUM_MAP)
        })

        it("should get map resolution scale factor MEDIUM for multiple maps", () => {
            const almostOneMBFile = {
                fileMeta: {
                    fileName: "file1",
                    fileChecksum: "invalid-md5-checksum-1",
                    projectName: "Sample Project",
                    apiVersion: packageJson.codecharta.apiVersion,
                    exportedFileSize: 1023 * 1024 // nearly one MB
                }
            } as CCFile

            const sixMBFile = {
                fileMeta: {
                    fileName: "file1",
                    fileChecksum: "invalid-md5-checksum-1",
                    projectName: "Sample Project",
                    apiVersion: packageJson.codecharta.apiVersion,
                    exportedFileSize: 1024 * 1024 * 6 // 6MB
                }
            } as CCFile

            const fileStateMultiple: FileState[] = [
                { file: almostOneMBFile, selectedAs: FileSelectionState.Partial },
                { file: sixMBFile, selectedAs: FileSelectionState.Partial }
            ]

            expect(getMapResolutionScaleFactor(fileStateMultiple)).toBe(MAP_RESOLUTION_SCALE.MEDIUM_MAP)
        })

        it("should get map resolution scale factor BIG for single map", () => {
            const bigFile1 = {
                fileMeta: {
                    fileName: "file1",
                    fileChecksum: "invalid-md5-checksum-1",
                    projectName: "Sample Project",
                    apiVersion: packageJson.codecharta.apiVersion,
                    exportedFileSize: 1024 * 1024 * 20 // 20MB
                }
            } as CCFile

            const fileStateSingle: FileState[] = [{ file: bigFile1, selectedAs: FileSelectionState.Partial }]

            expect(getMapResolutionScaleFactor(fileStateSingle)).toBe(MAP_RESOLUTION_SCALE.BIG_MAP)
        })

        it("should get map resolution scale factor BIG for multiple maps", () => {
            const fiveMBFile = {
                fileMeta: {
                    fileName: "file1",
                    fileChecksum: "invalid-md5-checksum-1",
                    projectName: "Sample Project",
                    apiVersion: packageJson.codecharta.apiVersion,
                    exportedFileSize: 1024 * 1024 * 5 // 5MB
                }
            } as CCFile

            const twoMBFile = {
                fileMeta: {
                    fileName: "file1",
                    fileChecksum: "invalid-md5-checksum-1",
                    projectName: "Sample Project",
                    apiVersion: packageJson.codecharta.apiVersion,
                    exportedFileSize: 1024 * 1024 * 2 // 2MB
                }
            } as CCFile

            const fileStateMultiple: FileState[] = [
                { file: fiveMBFile, selectedAs: FileSelectionState.Partial },
                { file: twoMBFile, selectedAs: FileSelectionState.Partial }
            ]

            expect(getMapResolutionScaleFactor(fileStateMultiple)).toBe(MAP_RESOLUTION_SCALE.BIG_MAP)
        })
    })

    describe("getAllNodes", () => {
        it("should return array of all nodes for given root", () => {
            const rootNode = VALID_NODE_WITH_PATH
            const nodeLeaves = [rootNode.children[0], rootNode.children[1].children[0], rootNode.children[1].children[1]]
            expect(getAllNodes(rootNode)).toEqual(nodeLeaves)
        })

        it("should return empty array for undefined root", () => {
            const rootNode = undefined
            expect(getAllNodes(rootNode)).toEqual([])
        })
    })
})
