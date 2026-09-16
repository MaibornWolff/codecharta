import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { Store, StoreModule } from "@ngrx/store"
import stringify from "safe-stable-stringify"
import { RenderCodeMapEffect } from "../../../features/codeMap/effects/renderCodeMapEffect/renderCodeMap.effect"
import { TEST_FILE_CONTENT } from "../../../mocks/dataMocks"
import { CcState } from "../../../model/codeCharta.model"
import { LoadFileService } from "../../../stores/fileStore/fileStore.facade"
import { setFiles, setStandardByNames } from "../../../stores/fileStore/store/files.actions"
import { setIsLoadingFile } from "../../../stores/fileStore/store/isLoadingFile/isLoadingFile.actions"
import { appReducers, setStateMiddleware } from "../../../stores/rootStore/store"
import { createCCFileInput } from "./createCCFileInput"
import { UploadFilesService } from "./uploadFiles.service"

jest.mock("./createCCFileInput")

describe("UploadFilesService", () => {
    let _loadFileService: LoadFileService
    let uploadFilesService: UploadFilesService
    let store: Store<CcState>
    let dispatchSpy: jest.SpyInstance
    let mockFileInput: HTMLInputElement

    beforeEach(() => {
        restartSystem()
        rebuildServices()

        dispatchSpy = jest.spyOn(store, "dispatch")

        mockFileInput = {
            files: [new File([stringify(TEST_FILE_CONTENT)], "test.cc.json", { type: "application/json" })],
            click: jest.fn(),
            addEventListener: jest.fn((_event, _callback) => {})
        } as unknown as HTMLInputElement
        ;(createCCFileInput as jest.Mock).mockReturnValue(mockFileInput)
    })

    afterEach(() => {})

    function restartSystem() {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] }),
                EffectsModule.forRoot([RenderCodeMapEffect])
            ],
            providers: [UploadFilesService, LoadFileService]
        })
        store = TestBed.inject(Store)
    }

    function rebuildServices() {
        uploadFilesService = TestBed.inject(UploadFilesService)
        _loadFileService = TestBed.inject(LoadFileService)
    }

    async function flushMicrotasks() {
        await new Promise(resolve => setTimeout(resolve, 0))
    }

    it("should read the next file only after the previous one is parsed", async () => {
        // Arrange
        const contentBytes = new TextEncoder().encode(stringify(TEST_FILE_CONTENT)).buffer
        let resolveFirstFile: (bytes: ArrayBuffer) => void
        const firstFile = {
            name: "first.cc.json",
            size: 1,
            arrayBuffer: jest.fn(() => new Promise<ArrayBuffer>(resolve => (resolveFirstFile = resolve)))
        }
        const secondFile = { name: "second.cc.json", size: 1, arrayBuffer: jest.fn(async () => contentBytes) }
        const fileInput = { ...mockFileInput, files: [firstFile, secondFile] } as unknown as HTMLInputElement

        // Act
        const upload = uploadFilesService["uploadFilesOnEvent"](fileInput)
        await flushMicrotasks()
        const secondFileReadBeforeFirstParsed = secondFile.arrayBuffer.mock.calls.length
        resolveFirstFile(contentBytes)
        await upload

        // Assert
        expect(secondFileReadBeforeFirstParsed).toBe(0)
        expect(secondFile.arrayBuffer).toHaveBeenCalledTimes(1)
    })

    it("should upload file", async () => {
        uploadFilesService.uploadFiles()

        expect(mockFileInput.click).toHaveBeenCalled()
        await uploadFilesService["uploadFilesOnEvent"](mockFileInput)

        expect(dispatchSpy).toHaveBeenCalledWith(setFiles({ value: [expect.anything()] }))
        expect(dispatchSpy).toHaveBeenCalledWith(setStandardByNames({ fileNames: ["test.cc.json"] }))
    })

    it("should raise the loading indicator before the files are read", async () => {
        // Act
        await uploadFilesService["uploadFilesOnEvent"](mockFileInput)

        // Assert
        expect(dispatchSpy).toHaveBeenNthCalledWith(1, setIsLoadingFile({ value: true }))
    })

    it("should still commit an already loaded file so that the loading indicator is cleared by the render", async () => {
        // Arrange
        await uploadFilesService["uploadFilesOnEvent"](mockFileInput)
        dispatchSpy.mockClear()

        // Act
        await uploadFilesService["uploadFilesOnEvent"](mockFileInput)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setStandardByNames({ fileNames: ["test.cc.json"] }))
        expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: "FILES_LOADED", source: "upload" }))
        expect(dispatchSpy).not.toHaveBeenCalledWith(setIsLoadingFile({ value: false }))
    })
})
