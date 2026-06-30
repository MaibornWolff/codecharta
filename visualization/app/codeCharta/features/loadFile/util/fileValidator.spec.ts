import {
    TEST_FILE_CONTENT,
    TEST_FILE_CONTENT_CC_JSON_2,
    TEST_FILE_CONTENT_INVALID_API,
    TEST_FILE_CONTENT_INVALID_MAJOR_API,
    TEST_FILE_CONTENT_INVALID_MINOR_API,
    TEST_FILE_CONTENT_NO_API
} from "../../../mocks/dataMocks"
import { CodeMapNode, NodeType } from "../../../codeCharta.model"
import { NameDataPair } from "../../../codeCharta.api.model"
import { CcJson2 } from "../../../model/ccjson2.model"
import packageJson from "../../../../../package.json"
import { checkErrors, checkWarnings, detectApiVersionMajor, isCcJson2, removeAuthorsAttributes, ERROR_MESSAGES } from "./fileValidator"
import { fileWithFixedFolders, fileWithFixedOverlappingSubFolders } from "../../../resources/fixed-folders/fixed-folders-example"
import { APIVersions, ExportCCFile } from "../../../codeCharta.api.model"
import { clone } from "../../../util/clone"

describe("FileValidator", () => {
    let file: ExportCCFile

    beforeEach(() => {
        file = clone(TEST_FILE_CONTENT)
    })

    it("API version exists in package.json", () => {
        expect(packageJson.codecharta.apiVersion).toEqual("1.5")
    })

    it("should throw on null", () => {
        const expectedErrors = [ERROR_MESSAGES.fileIsInvalid]

        expect(checkErrors(null)).toEqual(expectedErrors)
    })

    it("should throw when higher Major API", () => {
        const nameDataPair: NameDataPair = {
            fileName: "fileName",
            fileSize: 30,
            content: TEST_FILE_CONTENT_INVALID_MAJOR_API
        }
        const expectedErrors = [ERROR_MESSAGES.majorApiVersionIsOutdated]

        expect(checkErrors(nameDataPair.content)).toEqual(expectedErrors)
    })

    it("should throw on warning with higher minor API version", () => {
        const nameDataPair: NameDataPair = {
            fileName: "fileName",
            fileSize: 30,
            content: TEST_FILE_CONTENT_INVALID_MINOR_API
        }
        const expectedWarnings = [`${ERROR_MESSAGES.minorApiVersionOutdated} Found: ${(nameDataPair.content as ExportCCFile).apiVersion}`]

        expect(checkWarnings(nameDataPair.content)).toEqual(expectedWarnings)
    })

    it("should throw on file missing API version", () => {
        const nameDataPair: NameDataPair = {
            fileName: "fileName",
            fileSize: 30,
            content: TEST_FILE_CONTENT_NO_API
        }
        const expectedErrors = [ERROR_MESSAGES.apiVersionIsInvalid]

        expect(checkErrors(nameDataPair.content)).toEqual(expectedErrors)
    })

    it("should throw on file with wrong API version", () => {
        const nameDataPair: NameDataPair = {
            fileName: "fileName",
            fileSize: 30,
            content: TEST_FILE_CONTENT_INVALID_API
        }
        const expectedErrors = [ERROR_MESSAGES.apiVersionIsInvalid]

        expect(checkErrors(nameDataPair.content)).toEqual(expectedErrors)
    })

    it("should not throw on a file with edges", () => {
        file.edges = [
            {
                fromNodeName: "a",
                toNodeName: "b",
                attributes: {
                    avgCommits: 42,
                    pairingRate: 80
                }
            }
        ]

        const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }

        expect(checkErrors(nameDataPair.content)).toEqual([])
        expect(checkWarnings(nameDataPair.content)).toEqual([])
    })

    it("should not throw on a file without edges", () => {
        file.edges = undefined

        const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }

        expect(checkErrors(nameDataPair.content)).toEqual([])
        expect(checkWarnings(nameDataPair.content)).toEqual([])
    })

    it("should not throw on a file when numbers are floating point values", () => {
        file.nodes[0].children[0].attributes["rloc"] = 333.4

        const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }

        expect(checkErrors(nameDataPair.content)).toEqual([])
        expect(checkWarnings(nameDataPair.content)).toEqual([])
    })

    it("should throw when children are not unique in name+type", () => {
        file.nodes[0].children[0].name = "same"
        file.nodes[0].children[0].type = NodeType.FILE
        file.nodes[0].children[1].name = "same"
        file.nodes[0].children[1].type = NodeType.FILE
        const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }
        const expectedErrors = [`${ERROR_MESSAGES.nodesNotUnique} Found duplicate of File with path: /root/same`]

        expect(checkErrors(nameDataPair.content)).toEqual(expectedErrors)
    })

    it("should throw when nodes are empty", () => {
        file.nodes = []
        const nameDataPair: NameDataPair = { fileName: "", fileSize: 30, content: file }
        const expectedErrors = [ERROR_MESSAGES.nodesEmpty]

        expect(checkErrors(nameDataPair.content)).toEqual(expectedErrors)
    })

    it("should throw if nodes is not a node and therefore has no name or id", () => {
        file.nodes[0] = {
            // @ts-expect-error
            something: "something"
        }
        const nameDataPair: NameDataPair = { fileName: "", fileSize: 30, content: file }
        const expectedErrors = [
            "Required error: nodes/0 must have required property 'name'",
            "Required error: nodes/0 must have required property 'type'"
        ]

        expect(checkErrors(nameDataPair.content)).toEqual(expectedErrors)
    })

    describe("fixed sub folders validation", () => {
        it("should throw an error, if two sub folders horizontally overlap", () => {
            file = clone(fileWithFixedOverlappingSubFolders)
            const folder1: CodeMapNode = file.nodes[0].children[0].children[0]
            const folder2: CodeMapNode = file.nodes[0].children[0].children[1]
            const nameDataPair: NameDataPair = { fileName: "", fileSize: 30, content: file }
            const expectedErrors = [
                `${ERROR_MESSAGES.fixedFoldersOverlapped} Found: folder_1_1 ${JSON.stringify(
                    folder1.fixedPosition
                )} and folder_1_2 ${JSON.stringify(folder2.fixedPosition)}`
            ]

            expect(checkErrors(nameDataPair.content)).toEqual(expectedErrors)
        })
    })

    describe("fixed folders validation", () => {
        let folder1: CodeMapNode
        let folder2: CodeMapNode

        beforeEach(() => {
            file = clone(fileWithFixedFolders)
            ;[folder1, folder2] = file.nodes[0].children
        })

        it("should throw an error, if there are fixed folders, but not every folder on root is fixed", () => {
            folder1.fixedPosition = undefined
            const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }
            const expectedErrors = [`${ERROR_MESSAGES.notAllFoldersAreFixed} Found: folder_1`]

            expect(checkErrors(nameDataPair.content)).toEqual(expectedErrors)
        })

        it("should throw an error, if at least one fixed folder has a padding that is out of bounds", () => {
            folder1.fixedPosition.left = -5
            folder1.fixedPosition.width = 7
            const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }
            const expectedErrors = [`${ERROR_MESSAGES.fixedFoldersOutOfBounds} Found: folder_1 ${JSON.stringify(folder1.fixedPosition)}`]

            expect(checkErrors(nameDataPair.content)).toEqual(expectedErrors)
        })

        it("should throw an error, if at least one fixed folder has a width or height that is out of bounds", () => {
            folder1.fixedPosition.left = 10
            folder1.fixedPosition.width = -50
            const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }
            const expectedErrors = [`${ERROR_MESSAGES.fixedFoldersOutOfBounds} Found: folder_1 ${JSON.stringify(folder1.fixedPosition)}`]

            expect(checkErrors(nameDataPair.content)).toEqual(expectedErrors)
        })

        it("should throw an error, if at least one fixed folder exceeds the maximum coordinate of 100", () => {
            folder1.fixedPosition.left = 99
            folder1.fixedPosition.width = 2
            const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }
            const expectedErrors = [`${ERROR_MESSAGES.fixedFoldersOutOfBounds} Found: folder_1 ${JSON.stringify(folder1.fixedPosition)}`]

            expect(checkErrors(nameDataPair.content)).toEqual(expectedErrors)
        })

        it("should throw an error, if two folders horizontally overlap", () => {
            folder1.fixedPosition = {
                left: 0,
                top: 0,
                width: 10,
                height: 10
            }
            folder2.fixedPosition = {
                left: 5,
                top: 1,
                width: 10,
                height: 10
            }
            const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }
            const expectedErrors = [
                `${ERROR_MESSAGES.fixedFoldersOverlapped} Found: folder_1 ${JSON.stringify(
                    folder1.fixedPosition
                )} and folder_2 ${JSON.stringify(folder2.fixedPosition)}`
            ]

            expect(checkErrors(nameDataPair.content)).toEqual(expectedErrors)
        })

        it("should throw an error, if two folders vertically overlap", () => {
            folder1.fixedPosition = {
                left: 0,
                top: 0,
                width: 10,
                height: 10
            }
            folder2.fixedPosition = {
                left: 0,
                top: 5,
                width: 10,
                height: 10
            }
            const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }
            const expectedErrors = [
                `${ERROR_MESSAGES.fixedFoldersOverlapped} Found: folder_1 ${JSON.stringify(
                    folder1.fixedPosition
                )} and folder_2 ${JSON.stringify(folder2.fixedPosition)}`
            ]
            expect(checkErrors(nameDataPair.content)).toEqual(expectedErrors)
        })

        it("should throw an error, if a folder is placed inside another", () => {
            folder1.fixedPosition = {
                left: 0,
                top: 0,
                width: 10,
                height: 10
            }
            folder2.fixedPosition = {
                left: 1,
                top: 1,
                width: 1,
                height: 1
            }
            const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }
            const expectedErrors = [
                `${ERROR_MESSAGES.fixedFoldersOverlapped} Found: folder_2 ${JSON.stringify(
                    folder2.fixedPosition
                )} and folder_1 ${JSON.stringify(folder1.fixedPosition)}`
            ]

            expect(checkErrors(nameDataPair.content)).toEqual(expectedErrors)
        })

        it("should throw an error, if a folder has the same boundaries as another", () => {
            folder1.fixedPosition = {
                left: 0,
                top: 0,
                width: 10,
                height: 10
            }
            folder2.fixedPosition = folder1.fixedPosition
            const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }
            const expectedErrors = [
                `${ERROR_MESSAGES.fixedFoldersOverlapped} Found: folder_1 ${JSON.stringify(
                    folder1.fixedPosition
                )} and folder_2 ${JSON.stringify(folder2.fixedPosition)}`
            ]

            expect(checkErrors(nameDataPair.content)).toEqual(expectedErrors)
        })

        it("should throw an error, if the major api version is smaller and fixed folders were defined", () => {
            file.apiVersion = APIVersions.ZERO_POINT_ONE
            const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }
            const expectedErrors = [`${ERROR_MESSAGES.fixedFoldersNotAllowed} Found: 0.1`]

            expect(checkErrors(nameDataPair.content)).toEqual(expectedErrors)
        })

        it("should throw an error, if the minor api version is smaller and fixed folders were defined", () => {
            file.apiVersion = APIVersions.ONE_POINT_ONE
            const nameDataPair: NameDataPair = { fileName: "fileName", fileSize: 30, content: file }
            const expectedErrors = [`${ERROR_MESSAGES.fixedFoldersNotAllowed} Found: 1.1`]

            expect(checkErrors(nameDataPair.content)).toEqual(expectedErrors)
        })
    })

    describe("cc.json 2.0", () => {
        let file2_0: CcJson2

        beforeEach(() => {
            file2_0 = clone(TEST_FILE_CONTENT_CC_JSON_2)
        })

        it("should detect a 2.0 envelope by its meta but not a legacy file claiming apiVersion 2.0", () => {
            expect(isCcJson2(file2_0)).toBe(true)
            expect(detectApiVersionMajor(file2_0)).toBe(2)
            expect(isCcJson2(TEST_FILE_CONTENT_INVALID_MAJOR_API)).toBe(false)
        })

        it("should return no errors for a valid 2.0 file", () => {
            expect(checkErrors(file2_0)).toEqual([])
        })

        it("should not strip authors or emit minor-version warnings for 2.0 files", () => {
            expect(removeAuthorsAttributes(file2_0)).toEqual([])
            expect(checkWarnings(file2_0)).toEqual([])
        })

        it("should report schema errors for a malformed 2.0 file", () => {
            delete file2_0.meta.checksum

            const errors = checkErrors(file2_0)

            expect(errors.length).toBeGreaterThan(0)
            expect(errors.some(error => error.includes("checksum"))).toBe(true)
        })

        it("should report duplicate node ids", () => {
            file2_0.files[0].children[0].id = file2_0.files[0].id

            const errors = checkErrors(file2_0)

            expect(errors).toContain(`${ERROR_MESSAGES.nodeIdsNotUnique} Found duplicate id: ${file2_0.files[0].id}`)
        })
    })
})
