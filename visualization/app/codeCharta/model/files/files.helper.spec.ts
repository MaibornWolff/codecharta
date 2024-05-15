import { setupFiles, TEST_DELTA_MAP_A, TEST_DELTA_MAP_B } from "../../util/dataMocks"
import {
    createPNGFileName,
    fileStatesAvailable,
    getCCFiles,
    getFileByFileName,
    getVisibleFiles,
    getVisibleFileStates,
    isDeltaState,
    isPartialState
} from "./files.helper"
import { FileSelectionState, FileState } from "./files"

describe("files", () => {
    let files: FileState[]

    beforeEach(() => {
        files = setupFiles()
    })

    describe("getVisibleFiles", () => {
        it("should return an empty array when no files are selected", () => {
            const result = getVisibleFiles(files)

            expect(result).toEqual([])
            expect(result.length).toBe(0)
        })

        it("should return an array when all files are selected", () => {
            files[0].selectedAs = FileSelectionState.Partial
            files[1].selectedAs = FileSelectionState.Partial

            const result = getVisibleFiles(files)

            expect(result[0]).toEqual(TEST_DELTA_MAP_A)
            expect(result[1]).toEqual(TEST_DELTA_MAP_B)
            expect(result.length).toBe(2)
        })

        it("should return an array when only some files are selected", () => {
            files[0].selectedAs = FileSelectionState.Partial

            const result = getVisibleFiles(files)

            expect(result[0]).toEqual(TEST_DELTA_MAP_A)
            expect(result.length).toBe(1)
        })
    })

    describe("getVisibleFileStates", () => {
        it("should return an empty array when no files are selected", () => {
            const result = getVisibleFileStates(files)

            expect(result).toEqual([])
            expect(result.length).toBe(0)
        })

        it("should return an array when all files are selected", () => {
            files[0].selectedAs = FileSelectionState.Partial
            files[1].selectedAs = FileSelectionState.Partial

            const result = getVisibleFileStates(files)

            expect(result[0]).toEqual(files[0])
            expect(result[1]).toEqual(files[1])
            expect(result.length).toBe(2)
        })

        it("should return an array when only some files are selected", () => {
            files[0].selectedAs = FileSelectionState.Partial

            const result = getVisibleFileStates(files)

            expect(result[0]).toEqual(files[0])
            expect(result.length).toBe(1)
        })
    })

    describe("getFileByFileName", () => {
        it("should return undefined if no files match the fileName", () => {
            const result = getFileByFileName(files, "fileC")

            expect(result).not.toBeDefined()
        })

        it("should return the fileState if a file matches the fileName", () => {
            const result = getFileByFileName(files, TEST_DELTA_MAP_A.fileMeta.fileName)

            expect(result).toEqual(TEST_DELTA_MAP_A)
        })

        it("should return the first fileState found if multiple files match the fileName", () => {
            const expectedFiles = [...files, { file: TEST_DELTA_MAP_A, selectedAs: FileSelectionState.None }]

            const result = getFileByFileName(expectedFiles, TEST_DELTA_MAP_A.fileMeta.fileName)

            expect(result).toEqual(TEST_DELTA_MAP_A)
        })
    })

    describe("isDeltaState", () => {
        it("should return true if fileStates contains COMPARISON and REFERENCE", () => {
            files[0].selectedAs = FileSelectionState.Reference
            files[1].selectedAs = FileSelectionState.Comparison

            const result = isDeltaState(files)

            expect(result).toBeTruthy()
        })

        it("should return false if the filerStates does not contain COMPARISON or REFERENCE", () => {
            const result = isDeltaState(files)

            expect(result).toBeFalsy()
        })

        it("should reset the previous selection", () => {
            files[0].selectedAs = FileSelectionState.Partial
            files[0].selectedAs = FileSelectionState.Reference
            files[1].selectedAs = FileSelectionState.Comparison

            expect(isDeltaState(files)).toBeTruthy()
            expect(isPartialState(files)).toBeFalsy()
        })
    })

    describe("isPartialState", () => {
        it("should return true if fileStates contains PARTIAL", () => {
            files[0].selectedAs = FileSelectionState.Partial
            files[1].selectedAs = FileSelectionState.Partial

            const result = isPartialState(files)

            expect(result).toBeTruthy()
        })

        it("should return false if the first fileSelectionState is not PARTIAL or undefined", () => {
            const result = isPartialState(files)

            expect(result).toBeFalsy()
        })

        it("should reset the previous selection", () => {
            files[0].selectedAs = FileSelectionState.Reference
            files[1].selectedAs = FileSelectionState.Comparison
            files[0].selectedAs = FileSelectionState.Partial
            files[1].selectedAs = FileSelectionState.Partial

            expect(isPartialState(files)).toBeTruthy()
            expect(isDeltaState(files)).toBeFalsy()
        })
    })

    describe("getCCFiles", () => {
        it("should return all added files from fileStates", () => {
            const expected = [TEST_DELTA_MAP_A, TEST_DELTA_MAP_B]

            const result = getCCFiles(files)

            expect(result).toEqual(expected)
            expect(result.length).toBe(2)
        })

        it("should return an empty array if no files are added to fileStates", () => {
            files = []

            const result = getCCFiles(files)

            expect(result).toEqual([])
            expect(result.length).toBe(0)
        })
    })

    describe("fileStatesAvailable", () => {
        it("should be false if no file states available", () => {
            files[0].selectedAs = FileSelectionState.None
            files[1].selectedAs = FileSelectionState.None

            expect(fileStatesAvailable(files)).toBeFalsy()
        })

        it("should be false if file states are available, but non are visible", () => {
            expect(fileStatesAvailable(files)).toBeFalsy()
        })

        it("should be true if visible file states are available", () => {
            files[0].selectedAs = FileSelectionState.Partial

            expect(fileStatesAvailable(files)).toBeTruthy()
        })
    })

    describe("createPNGFileName", () => {
        it("should create the correct PNG filename for partial state and 'legend' suffix", () => {
            files[0].selectedAs = FileSelectionState.Partial
            files[1].selectedAs = FileSelectionState.Partial
            files[0].file.fileMeta.fileName = "file_a.json"
            files[1].file.fileMeta.fileName = "file_b.json"

            const result = createPNGFileName(files, "legend")

            const expectedFileName = "file_a_file_b_legend.png"
            expect(result).toBe(expectedFileName)
        })

        it("should create the correct PNG filename for delta state and 'map' suffix", () => {
            files[0].selectedAs = FileSelectionState.Reference
            files[1].selectedAs = FileSelectionState.Comparison
            files[0].file.fileMeta.fileName = "file_a.json"
            files[1].file.fileMeta.fileName = "file_b.json"
            const result = createPNGFileName(files, "map")

            const expectedFileName = "delta_file_a_file_b_map.png"
            expect(result).toBe(expectedFileName)
        })

        it("should cut off a file name when it is longer than 255 characters", () => {
            files[0].selectedAs = FileSelectionState.Partial
            files[1].selectedAs = FileSelectionState.Partial
            files[0].file.fileMeta.fileName = "filename_of_file_a.json"
            files[1].file.fileMeta.fileName =
                "filename_of_file_b_Lorem_ipsum_dolor_sit_amet_consectetur_adipiscing_elit_Quisque_tristique_lectus_a_nibh_ullamcorper_aliquam_in_et_orci_Cras_tincidunt_imperdiet_massa_sed_ultricies_Nullam_tristique_congue_nisl_id_lacinia_Praesent_varius_interdum_turpis_eget_eleifend.json"

            const result = createPNGFileName(files, "legend")

            expect(result.length).toBe(255)
            expect(result).toMatch(/~legend\.png$/)
        })

        it("should create the correct PNG filename when more than 3 maps are loaded", () => {
            const multipleFiles = [...files, ...files]
            multipleFiles[0].selectedAs = FileSelectionState.Partial
            multipleFiles[3].selectedAs = FileSelectionState.Partial
            multipleFiles[0].file.fileMeta.fileName = "file_a.json"
            multipleFiles[3].file.fileMeta.fileName = "file_d.json"

            const result = createPNGFileName(multipleFiles, "legend")
            const expectedFileName = "file_a_~_file_d_legend.png"
            expect(result).toBe(expectedFileName)
        })

        it("should cutoff the cc-json file-extension correctly", () => {
            files[0].selectedAs = FileSelectionState.Partial
            files[0].file.fileMeta.fileName = "file_d.cc.json"

            const result = createPNGFileName(files, "legend")
            const expectedFileName = "file_d_legend.png"
            expect(result).toBe(expectedFileName)
        })
    })
})
