import { TestBed } from "@angular/core/testing"
import { Subject } from "rxjs"
import { Vector3 } from "three"
import { CodeMapRenderService } from "../../../ui/codeMap/codeMap.render.service"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRenderer.service"
import { UploadFilesService } from "../../../ui/toolBar/uploadFilesButton/uploadFiles.service"
import { wait } from "../../../util/testUtils/wait"
import { accumulatedDataSelector } from "../../selectors/accumulatedData/accumulatedData.selector"
import { setInvertArea } from "../../store/appSettings/invertArea/invertArea.actions"
import { setScaling } from "../../store/appSettings/scaling/scaling.actions"
import { maxFPS, RenderCodeMapEffect } from "./renderCodeMap.effect"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { EffectsModule } from "@ngrx/effects"

describe("renderCodeMapEffect", () => {
	let actions$: Subject<Action>
	let threeRendererService: ThreeRendererService
	let codeMapRenderService: CodeMapRenderService

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
	})

	afterEach(() => {
		actions$.complete()
	})

	it("should render once initially and throttled after actions requiring rerender, but not scale map", async () => {
		actions$.next(setInvertArea({ value: true }))
		actions$.next(setInvertArea({ value: true }))
		actions$.next(setInvertArea({ value: true }))
		expect(codeMapRenderService.render).toHaveBeenCalledTimes(0)
		expect(threeRendererService.render).toHaveBeenCalledTimes(0)

		await wait(maxFPS)
		expect(codeMapRenderService.render).toHaveBeenCalledTimes(2)
		expect(threeRendererService.render).toHaveBeenCalledTimes(2)
		expect(codeMapRenderService.scaleMap).not.toHaveBeenCalled()
	})

	it("should scale map when scaling changes", async () => {
		actions$.next(setScaling({ value: new Vector3(1, 1, 1) }))
		await wait(maxFPS)
		expect(codeMapRenderService.scaleMap).toHaveBeenCalledTimes(1)
	})

	// it("should remove loading indicators after render", async () => {
	// 	actions$.next(setInvertArea({ value: true }))
	// 	await wait(maxFPS)
	// 	expect(mockedStore.dispatch).toHaveBeenCalledWith(setIsLoadingFile({ value: false }))
	// 	expect(mockedStore.dispatch).toHaveBeenCalledWith(setIsLoadingMap({ value: false }))
	// })

	// it("should not remove loading indicators after render when a file is still being uploaded", async () => {
	// 	const uploadFileService = TestBed.inject(UploadFilesService)
	// 	uploadFileService.isUploading = true
	// 	actions$.next(setInvertArea({ value: true }))
	// 	await wait(maxFPS)
	// 	expect(mockedStore.dispatch).not.toHaveBeenCalledWith(setIsLoadingFile({ value: false }))
	// 	expect(mockedStore.dispatch).not.toHaveBeenCalledWith(setIsLoadingMap({ value: false }))
	// })
})
