import { APIVersions, ExportCCFile, NameDataPair } from "../../../../../model/codeCharta.api.model"
import { CodeMapNode } from "../../../../../model/codeCharta.model"
import { fileWithFixedFolders, fileWithFixedOverlappingSubFolders } from "../../../../../resources/fixed-folders/fixed-folders-example"
import { clone } from "../../../../../util/clone"
import { checkErrors, ERROR_MESSAGES } from "./fileValidator"

describe("FixedFolderValidator", () => {
    let file: ExportCCFile

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
})
