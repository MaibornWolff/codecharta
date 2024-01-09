import { TestBed } from "@angular/core/testing"
import { Subject } from "rxjs"
import { CodeMapRenderService } from "../../../ui/codeMap/codeMap.render.service"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRenderer.service"
import { UploadFilesService } from "../../../ui/toolBar/uploadFilesButton/uploadFiles.service"
import { wait } from "../../../util/testUtils/wait"
import { accumulatedDataSelector } from "../../selectors/accumulatedData/accumulatedData.selector"
import { setInvertArea } from "../../store/appSettings/invertArea/invertArea.actions"
import { maxFPS, RenderCodeMapEffect } from "./renderCodeMap.effect"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { EffectsModule } from "@ngrx/effects"
import { setIsLoadingFile } from "../../store/appSettings/isLoadingFile/isLoadingFile.actions"
import { setIsLoadingMap } from "../../store/appSettings/isLoadingMap/isLoadingMap.actions"

describe("renderCodeMapEffect", () => {
	let actions$: Subject<Action>
	let threeRendererService: ThreeRendererService
	let codeMapRenderService: CodeMapRenderService
	let dispatchSpy: jest.SpyInstance

	beforeEach(() => {
		threeRendererService = { render: jest.fn() } as unknown as ThreeRendererService
		codeMapRenderService = { render: jest.fn(), scaleMap: jest.fn() } as unknown as CodeMapRenderService
		actions$ = new Subject<Action>()

		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([RenderCodeMapEffect])],
			providers: [
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

	it("should render throttled after actions requiring rerender and scale map", async () => {
		actions$.next(setInvertArea({ value: true }))
		actions$.next(setInvertArea({ value: true }))
		expect(codeMapRenderService.render).toHaveBeenCalledTimes(0)
		expect(threeRendererService.render).toHaveBeenCalledTimes(0)

		await wait(maxFPS)
		expect(codeMapRenderService.render).toHaveBeenCalledTimes(1)
		expect(threeRendererService.render).toHaveBeenCalledTimes(1)
		expect(codeMapRenderService.scaleMap).toHaveBeenCalledTimes(1)
	})

	it("should remove loading indicators after render", async () => {
		actions$.next(setInvertArea({ value: true }))
		await wait(maxFPS)
		expect(dispatchSpy).toHaveBeenCalledWith(setIsLoadingFile({ value: false }))
		expect(dispatchSpy).toHaveBeenCalledWith(setIsLoadingMap({ value: false }))
	})

	it("should not remove loading indicators after render when a file is still being uploaded", async () => {
		const uploadFileService = TestBed.inject(UploadFilesService)
		uploadFileService.isUploading = true
		actions$.next(setInvertArea({ value: true }))
		await wait(maxFPS)
		expect(dispatchSpy).not.toHaveBeenCalledWith(setIsLoadingFile({ value: false }))
		expect(dispatchSpy).not.toHaveBeenCalledWith(setIsLoadingMap({ value: false }))
	})
})
