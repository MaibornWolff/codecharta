import { TestBed } from "@angular/core/testing"
import { UploadFilesService } from "./uploadFiles.service"
import { LoadFileService } from "../../../services/loadFile/loadFile.service"
import { setIsLoadingFile } from "../../../state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { setIsLoadingMap } from "../../../state/store/appSettings/isLoadingMap/isLoadingMap.actions"
import { createCCFileInput } from "../../../util/uploadFiles/createCCFileInput"
import { TEST_FILE_CONTENT } from "../../../util/dataMocks"
import stringify from "safe-stable-stringify"
import { EffectsModule } from "@ngrx/effects"
import { Store, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"
import { MatDialog } from "@angular/material/dialog"
import { CcState } from "../../../codeCharta.model"
import { RenderCodeMapEffect } from "../../../state/effects/renderCodeMapEffect/renderCodeMap.effect"
import { setFiles, setStandardByNames } from "../../../state/store/files/files.actions"
import { UnfocusNodesEffect } from "../../../state/effects/unfocusNodes/unfocusNodes.effect"

jest.mock("../../../util/uploadFiles/createCCFileInput")

describe("UploadFilesService", () => {
    let loadFileService: LoadFileService
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

    afterEach(() => {
        loadFileService.referenceFileSubscription.unsubscribe()
    })

    function restartSystem() {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] }),
                EffectsModule.forRoot([RenderCodeMapEffect, UnfocusNodesEffect])
            ],
            providers: [UploadFilesService, LoadFileService, MatDialog]
        })
        store = TestBed.inject(Store)
    }

    function rebuildServices() {
        uploadFilesService = TestBed.inject(UploadFilesService)
        loadFileService = TestBed.inject(LoadFileService)
    }

    it("should upload file", async () => {
        uploadFilesService.uploadFiles()

        expect(mockFileInput.click).toHaveBeenCalled()
        await uploadFilesService["uploadFilesOnEvent"](mockFileInput)

        expect(dispatchSpy).toHaveBeenCalledWith(setFiles({ value: [expect.anything()] }))
        expect(dispatchSpy).toHaveBeenCalledWith(setStandardByNames({ fileNames: ["test.cc.json"] }))
    })

    it("should dispatch loading false if already loaded file is uploaded", async () => {
        uploadFilesService.uploadFiles()

        expect(mockFileInput.click).toHaveBeenCalled()
        await uploadFilesService["uploadFilesOnEvent"](mockFileInput)
        dispatchSpy.mockClear()

        uploadFilesService.uploadFiles()

        expect(mockFileInput.click).toHaveBeenCalled()
        await uploadFilesService["uploadFilesOnEvent"](mockFileInput)

        expect(dispatchSpy).toHaveBeenNthCalledWith(4, setStandardByNames({ fileNames: ["test.cc.json"] }))
        expect(dispatchSpy).toHaveBeenNthCalledWith(5, setIsLoadingFile({ value: false }))
        expect(dispatchSpy).toHaveBeenNthCalledWith(6, setIsLoadingMap({ value: false }))
    })
})
