import { TestBed } from "@angular/core/testing"
import { Subject } from "rxjs"
import { ScenariosFacade } from "../../../scenarios/facade"
import { CodeMapRenderService } from "../../codeMap.render.service"
import { ThreeRendererService } from "../../../../renderer/threeViewer/threeRenderer.service"
import { UploadFilesService } from "../../../navBar/facade"
import { wait } from "../../../../util/testUtils/wait"
import { accumulatedDataSelector } from "../../../../renderer/renderModel/accumulatedData/accumulatedData.selector"
import { setInvertArea } from "../../../../stores/mapState/mapState.write.facade"
import { LOADING_INDICATOR_QUIET_PERIOD_MS, maxFPS, RenderCodeMapEffect } from "./renderCodeMap.effect"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { EffectsModule } from "@ngrx/effects"
import { setIsLoadingFile } from "../../../../stores/fileStore/store/isLoadingFile/isLoadingFile.actions"
import { setIsLoadingMap } from "../../../../stores/mapState/mapState.write.facade"

describe("renderCodeMapEffect", () => {
    let actions$: Subject<Action>
    let threeRendererService: ThreeRendererService
    let codeMapRenderService: CodeMapRenderService
    let dispatchSpy: jest.SpyInstance
    let scenariosFacadeMock: { isApplying: boolean }

    beforeEach(() => {
        threeRendererService = { render: jest.fn() } as unknown as ThreeRendererService
        codeMapRenderService = { load: jest.fn() } as unknown as CodeMapRenderService
        scenariosFacadeMock = { isApplying: false }
        actions$ = new Subject<Action>()

        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([RenderCodeMapEffect])],
            providers: [
                { provide: ScenariosFacade, useValue: scenariosFacadeMock },
                { provide: UploadFilesService, useValue: { isUploading: false } },
                { provide: ThreeRendererService, useValue: threeRendererService },
                { provide: CodeMapRenderService, useValue: codeMapRenderService },
                provideMockStore({ selectors: [{ selector: accumulatedDataSelector, value: { unifiedMapNode: {} } }] }),
                provideMockActions(() => actions$)
            ]
        })

        const store = TestBed.inject(MockStore)
        dispatchSpy = jest.spyOn(store, "dispatch")
    })

    afterEach(() => {
        actions$.complete()
    })

    it("should drive the renderer load seam throttled after actions requiring rerender", async () => {
        actions$.next(setInvertArea({ value: true }))
        actions$.next(setInvertArea({ value: true }))
        expect(codeMapRenderService.load).toHaveBeenCalledTimes(0)
        expect(threeRendererService.render).toHaveBeenCalledTimes(0)

        await wait(maxFPS)
        expect(codeMapRenderService.load).toHaveBeenCalledTimes(1)
        expect(threeRendererService.render).toHaveBeenCalledTimes(1)
    })

    it("should remove loading indicators after a quiet period following the render", async () => {
        actions$.next(setInvertArea({ value: true }))
        // Right after the render the indicators must NOT be dismissed yet — the debounce keeps them
        // up until the burst of late renders (blacklist apply, autoFit) settles.
        await wait(maxFPS)
        expect(dispatchSpy).not.toHaveBeenCalledWith(setIsLoadingFile({ value: false }))
        expect(dispatchSpy).not.toHaveBeenCalledWith(setIsLoadingMap({ value: false }))

        // After the quiet period elapses, the indicators are dismissed.
        await wait(LOADING_INDICATOR_QUIET_PERIOD_MS + maxFPS)
        expect(dispatchSpy).toHaveBeenCalledWith(setIsLoadingFile({ value: false }))
        expect(dispatchSpy).toHaveBeenCalledWith(setIsLoadingMap({ value: false }))
    })

    it("should not remove loading indicators after render when a scenario is being applied", async () => {
        // Arrange
        scenariosFacadeMock.isApplying = true

        // Act
        actions$.next(setInvertArea({ value: true }))
        await wait(LOADING_INDICATOR_QUIET_PERIOD_MS + maxFPS)

        // Assert
        expect(dispatchSpy).not.toHaveBeenCalledWith(setIsLoadingFile({ value: false }))
        expect(dispatchSpy).not.toHaveBeenCalledWith(setIsLoadingMap({ value: false }))
    })

    it("should not remove loading indicators after render when a file is still being uploaded", async () => {
        const uploadFileService = TestBed.inject(UploadFilesService)
        uploadFileService.isUploading = true
        actions$.next(setInvertArea({ value: true }))
        await wait(LOADING_INDICATOR_QUIET_PERIOD_MS + maxFPS)
        expect(dispatchSpy).not.toHaveBeenCalledWith(setIsLoadingFile({ value: false }))
        expect(dispatchSpy).not.toHaveBeenCalledWith(setIsLoadingMap({ value: false }))
    })
})
