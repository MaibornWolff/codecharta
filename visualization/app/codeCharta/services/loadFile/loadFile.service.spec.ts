import { TestBed } from "@angular/core/testing"
import { LoadFileService } from "./loadFile.service"
import { TEST_FILE_CONTENT } from "../../util/dataMocks"
import { CCFile, CcState, NodeMetricData, NodeType } from "../../codeCharta.model"
import { removeFile, setDeltaReference, setStandard } from "../../state/store/files/files.actions"
import { ExportBlacklistType, ExportCCFile } from "../../codeCharta.api.model"
import { getCCFiles, isPartialState } from "../../model/files/files.helper"
import { CCFileValidationResult, ERROR_MESSAGES } from "../../util/fileValidator"
import packageJson from "../../../../package.json"
import { clone } from "../../util/clone"
import { klona } from "klona"
import { ErrorDialogComponent } from "../../ui/dialogs/errorDialog/errorDialog.component"
import { loadFilesValidationToErrorDialog } from "../../util/loadFilesValidationToErrorDialog"
import { fileRoot } from "./fileRoot"
import { MatDialog } from "@angular/material/dialog"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"
import { State, Store, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../state/store/state.manager"

const mockedMetricDataSelector = metricDataSelector as unknown as jest.Mock
jest.mock("../../state/selectors/accumulatedData/metricData/metricData.selector", () => ({
    metricDataSelector: jest.fn()
}))

describe("loadFileService", () => {
    let codeChartaService: LoadFileService
    let store: Store<CcState>
    let state: State<CcState>
    let dialog: MatDialog
    let validFileContent: ExportCCFile
    let metricData: NodeMetricData[]
    const fileName = "someFileName"

    beforeEach(() => {
        restartSystem()
        rebuildService()

        validFileContent = clone(TEST_FILE_CONTENT)

        metricData = [
            { name: "mcc", maxValue: 1, minValue: 1, values: [1, 1] },
            { name: "rloc", maxValue: 2, minValue: 1, values: [1, 2] }
        ]
    })

    afterEach(() => {
        codeChartaService.referenceFileSubscription.unsubscribe()
    })

    function restartSystem() {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        store = TestBed.inject(Store)
        state = TestBed.inject(State)
        dialog = { open: jest.fn() } as unknown as MatDialog
    }

    function rebuildService() {
        codeChartaService = new LoadFileService(store, state, dialog)
    }

    describe("loadFiles", () => {
        mockedMetricDataSelector.mockImplementation(() => ({ nodeMetricData: metricData }))

        const expected: CCFile = {
            fileMeta: {
                apiVersion: packageJson.codecharta.apiVersion,
                fileName,
                projectName: "Sample Map",
                fileChecksum: "invalid-md5-sample",
                exportedFileSize: 42,
                repoCreationDate: ""
            },
            map: {
                attributes: {},
                isExcluded: false,
                isFlattened: false,
                children: [
                    {
                        attributes: { functions: 10, mcc: 1, rloc: 100 },
                        link: "https://www.google.de",
                        name: "big leaf",
                        path: "/root/big leaf",
                        type: NodeType.FILE,
                        isExcluded: false,
                        isFlattened: false
                    },
                    {
                        attributes: {},
                        children: [
                            {
                                attributes: { functions: 100, mcc: 100, rloc: 30 },
                                name: "small leaf",
                                path: "/root/Parent Leaf/small leaf",
                                type: NodeType.FILE,
                                isExcluded: false,
                                isFlattened: false
                            },
                            {
                                attributes: { functions: 1000, mcc: 10, rloc: 70 },
                                name: "other small leaf",
                                path: "/root/Parent Leaf/other small leaf",
                                type: NodeType.FILE,
                                isExcluded: false,
                                isFlattened: false
                            }
                        ],
                        name: "Parent Leaf",
                        path: "/root/Parent Leaf",
                        type: NodeType.FOLDER,
                        isExcluded: false,
                        isFlattened: false
                    }
                ],
                name: "root",
                path: "/root",
                type: NodeType.FOLDER
            },
            settings: {
                fileSettings: {
                    attributeTypes: { nodes: {}, edges: {} },
                    attributeDescriptors: {},
                    blacklist: [],
                    edges: [],
                    markedPackages: []
                }
            }
        }

        it("should load a file without edges", () => {
            validFileContent.edges = undefined

            codeChartaService.loadFiles([
                {
                    fileName,
                    content: validFileContent,
                    fileSize: 42
                }
            ])

            expect(getCCFiles(state.getValue().files)[0]).toEqual(expected)
            expect(isPartialState(state.getValue().files)).toBeTruthy()
        })

        it("should load a valid file and update root data", () => {
            codeChartaService.loadFiles([
                {
                    fileName,
                    content: validFileContent,
                    fileSize: 42
                }
            ])

            expect(getCCFiles(state.getValue().files)[0]).toEqual(expected)
            expect(isPartialState(state.getValue().files)).toBeTruthy()
            expect(dialog.open).not.toHaveBeenCalled()

            expect(fileRoot.rootName).toBe(expected.map.name)
            expect(fileRoot.rootPath).toBe(`/${expected.map.name}`)
        })

        it("should replace files with equal file name and checksum when loading new files", () => {
            const valid2ndFileContent = klona(validFileContent)
            valid2ndFileContent.fileChecksum = "hash_1"

            codeChartaService.loadFiles([{ fileName: "FirstFile", content: validFileContent, fileSize: 42 }])
            codeChartaService.loadFiles([
                { fileName: "FirstFile", content: validFileContent, fileSize: 42 },
                { fileName: "SecondFile", content: valid2ndFileContent, fileSize: 42 }
            ])

            const CCFilesUnderTest = getCCFiles(state.getValue().files)

            expect(CCFilesUnderTest.length).toEqual(2)
            expect(CCFilesUnderTest[0].fileMeta.fileName).toEqual("FirstFile")
            expect(CCFilesUnderTest[0].fileMeta.fileChecksum).toEqual("invalid-md5-sample")
            expect(CCFilesUnderTest[1].fileMeta.fileName).toEqual("SecondFile")
            expect(CCFilesUnderTest[1].fileMeta.fileChecksum).toEqual("hash_1")
        })

        it("should load files with equal file name but different checksum and rename uploaded files ", () => {
            const valid2ndFileContent = klona(validFileContent)
            valid2ndFileContent.fileChecksum = "hash_1"
            const valid3rdFileContent = klona(validFileContent)
            valid3rdFileContent.fileChecksum = "hash_2"

            codeChartaService.loadFiles([{ fileName: "FirstFile", content: validFileContent, fileSize: 42 }])
            codeChartaService.loadFiles([
                { fileName: "FirstFile", content: valid2ndFileContent, fileSize: 42 },
                { fileName: "FirstFile", content: valid3rdFileContent, fileSize: 42 }
            ])

            const CCFilesUnderTest = getCCFiles(state.getValue().files)

            expect(CCFilesUnderTest.length).toEqual(3)
            expect(CCFilesUnderTest[0].fileMeta.fileName).toEqual("FirstFile")
            expect(CCFilesUnderTest[0].fileMeta.fileChecksum).toEqual("invalid-md5-sample")
            expect(CCFilesUnderTest[1].fileMeta.fileName).toEqual("FirstFile_1")
            expect(CCFilesUnderTest[1].fileMeta.fileChecksum).toEqual("hash_1")
            expect(CCFilesUnderTest[2].fileMeta.fileName).toEqual("FirstFile_2")
            expect(CCFilesUnderTest[2].fileMeta.fileChecksum).toEqual("hash_2")
        })

        it("should not load files with equal file name and checksum when there was a renaming of file names in previous uploads", () => {
            const valid2ndFileContent = klona(validFileContent)
            valid2ndFileContent.fileChecksum = "hash_1"
            const valid3rdFileContent = klona(validFileContent)
            valid3rdFileContent.fileChecksum = "hash_2"

            codeChartaService.loadFiles([
                { fileName: "FirstFile", content: validFileContent, fileSize: 42 },
                { fileName: "FirstFile", content: valid2ndFileContent, fileSize: 42 }
            ])
            codeChartaService.loadFiles([
                { fileName: "FirstFile", content: valid3rdFileContent, fileSize: 42 },
                { fileName: "FirstFile", content: valid2ndFileContent, fileSize: 42 }
            ])

            const CCFilesUnderTest = getCCFiles(state.getValue().files)

            expect(CCFilesUnderTest.length).toEqual(3)
            expect(CCFilesUnderTest[0].fileMeta.fileName).toEqual("FirstFile")
            expect(CCFilesUnderTest[0].fileMeta.fileChecksum).toEqual("invalid-md5-sample")
            expect(CCFilesUnderTest[1].fileMeta.fileName).toEqual("FirstFile_1")
            expect(CCFilesUnderTest[1].fileMeta.fileChecksum).toEqual("hash_1")
            expect(CCFilesUnderTest[2].fileMeta.fileName).toEqual("FirstFile_2")
            expect(CCFilesUnderTest[2].fileMeta.fileChecksum).toEqual("hash_2")
        })

        it("should not load broken file but after fixing this problem manually it should possible to load this file again", () => {
            const invalidFileContent = klona(validFileContent)
            invalidFileContent.apiVersion = ""

            expect(() => codeChartaService.loadFiles([{ fileName: "FirstFile", content: invalidFileContent, fileSize: 42 }])).toThrow(
                "File(s) could not be loaded"
            )
            codeChartaService.loadFiles([{ fileName: "FirstFile", content: validFileContent, fileSize: 42 }])

            const CCFilesUnderTest = getCCFiles(state.getValue().files)

            expect(CCFilesUnderTest.length).toEqual(1)
            expect(CCFilesUnderTest[0].fileMeta.fileName).toEqual("FirstFile")
            expect(CCFilesUnderTest[0].fileMeta.fileChecksum).toEqual("invalid-md5-sample")
        })

        it("should select the newly added file", () => {
            const valid2ndFileContent = klona(validFileContent)
            valid2ndFileContent.fileChecksum = "hash_1"

            codeChartaService.loadFiles([{ fileName: "FirstFile", content: validFileContent, fileSize: 42 }])
            codeChartaService.loadFiles([{ fileName: "SecondFile", content: valid2ndFileContent, fileSize: 42 }])

            expect(state.getValue().files[0].selectedAs).toEqual("None")
            expect(state.getValue().files[1].selectedAs).toEqual("Partial")
        })

        it("should show error on invalid file", () => {
            const expectedError: CCFileValidationResult[] = [
                {
                    fileName,
                    errors: [ERROR_MESSAGES.fileIsInvalid],
                    warnings: []
                }
            ]

            expect(() => codeChartaService.loadFiles([{ fileName, content: null, fileSize: 0 }])).toThrow("File(s) could not be loaded")

            expect(state.getValue().files).toHaveLength(0)
            expect(dialog.open).toHaveBeenCalledWith(ErrorDialogComponent, { data: loadFilesValidationToErrorDialog(expectedError) })
        })

        it("should show error on a random string", () => {
            const expectedError: CCFileValidationResult[] = [
                {
                    fileName,
                    errors: [ERROR_MESSAGES.apiVersionIsInvalid],
                    warnings: []
                }
            ]

            expect(() => codeChartaService.loadFiles([{ fileName, fileSize: 42, content: "string" as unknown as ExportCCFile }])).toThrow(
                "File(s) could not be loaded"
            )

            expect(state.getValue().files).toHaveLength(0)
            expect(dialog.open).toHaveBeenCalledWith(ErrorDialogComponent, { data: loadFilesValidationToErrorDialog(expectedError) })
        })

        it("should show error if a file is missing a required property", () => {
            const expectedError: CCFileValidationResult[] = [
                {
                    fileName,
                    errors: ["Required error:  should have required property 'projectName'"],
                    warnings: []
                }
            ]

            const invalidFileContent = validFileContent
            delete invalidFileContent.projectName
            expect(() => codeChartaService.loadFiles([{ fileName, fileSize: 42, content: invalidFileContent }])).toThrow(
                "File(s) could not be loaded"
            )

            expect(state.getValue().files).toHaveLength(0)
            expect(dialog.open).toHaveBeenCalledWith(ErrorDialogComponent, { data: loadFilesValidationToErrorDialog(expectedError) })
        })

        it("should convert old blacklist type", () => {
            validFileContent.blacklist = [{ path: "foo", type: ExportBlacklistType.hide }]

            codeChartaService.loadFiles([
                {
                    fileName,
                    content: validFileContent,
                    fileSize: 42
                }
            ])

            const blacklist = [{ path: "foo", type: "flatten" }]
            expect(getCCFiles(state.getValue().files)[0].settings.fileSettings.blacklist).toEqual(blacklist)
        })

        it("should not show a validation error if filenames are duplicated when their path is different", () => {
            validFileContent.nodes[0].children[0].name = "duplicate"
            validFileContent.nodes[0].children[1].children[0].name = "duplicate"

            codeChartaService.loadFiles([{ fileName, content: validFileContent, fileSize: 42 }])

            expect(dialog.open).toHaveBeenCalledTimes(0)
            expect(state.getValue().files).toHaveLength(1)
        })

        it("should show a validation error if two files in a folder have the same name", () => {
            validFileContent.nodes[0].children[1].children[0].name = "duplicate"
            validFileContent.nodes[0].children[1].children[1].name = "duplicate"
            const expectedError: CCFileValidationResult[] = [
                {
                    fileName,
                    errors: [`${ERROR_MESSAGES.nodesNotUnique} Found duplicate of File with path: /root/Parent Leaf/duplicate`],
                    warnings: []
                }
            ]

            expect(() => codeChartaService.loadFiles([{ fileName, content: validFileContent, fileSize: 42 }])).toThrow(
                "File(s) could not be loaded"
            )

            expect(dialog.open).toHaveBeenCalledWith(ErrorDialogComponent, { data: loadFilesValidationToErrorDialog(expectedError) })
        })

        it("should not show a validation error if two files in a folder have the same name but different type", () => {
            validFileContent.nodes[0].children[1].children[0].name = "duplicate"
            validFileContent.nodes[0].children[1].children[0].type = NodeType.FILE
            validFileContent.nodes[0].children[1].children[1].name = "duplicate"
            validFileContent.nodes[0].children[1].children[1].type = NodeType.FOLDER

            codeChartaService.loadFiles([{ fileName, content: validFileContent, fileSize: 42 }])

            expect(dialog.open).toHaveBeenCalledTimes(0)
            expect(state.getValue().files).toHaveLength(1)
        })

        it("should remove a file", () => {
            codeChartaService.loadFiles([
                { fileName: "FirstFile", content: validFileContent, fileSize: 42 },
                { fileName: "SecondFile", content: validFileContent, fileSize: 42 }
            ])

            store.dispatch(removeFile({ fileName: "FirstFile" }))
            expect(state.getValue().files).toHaveLength(1)
            expect(state.getValue().files[0].file.fileMeta.fileName).toEqual("SecondFile")
        })
    })

    it("should update its ROOT_PATH when reference file is being set to a file", () => {
        codeChartaService.loadFiles([{ fileName: "FirstFile", content: validFileContent, fileSize: 42 }])
        const updateRootDataSpy = jest.spyOn(fileRoot, "updateRoot")

        const newReferenceFile = state.getValue().files[0].file
        store.dispatch(setDeltaReference({ file: newReferenceFile }))
        expect(updateRootDataSpy).toHaveBeenCalledTimes(1)
        expect(updateRootDataSpy).toHaveBeenCalledWith(state.getValue().files[0].file.map.name)

        // set reference file to a partial selected file. Therefore reference file becomes undefined
        store.dispatch(setStandard({ files: [state.getValue().files[0].file] }))
        expect(updateRootDataSpy).toHaveBeenCalledTimes(1)
    })
})
