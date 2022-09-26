import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { Action } from "redux"
import { BehaviorSubject, Subject } from "rxjs"
import { Vector3 } from "three"
import { CodeMapRenderService } from "../../../ui/codeMap/codeMap.render.service"
import { ThreeRendererService } from "../../../ui/codeMap/threeViewer/threeRenderer.service"
import { UploadFilesService } from "../../../ui/toolBar/uploadFilesButton/uploadFiles.service"
import { wait } from "../../../util/testUtils/wait"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { Store } from "../../angular-redux/store"
import { accumulatedDataSelector } from "../../selectors/accumulatedData/accumulatedData.selector"
import { setInvertArea } from "../../store/appSettings/invertArea/invertArea.actions"
import { setIsLoadingFile } from "../../store/appSettings/isLoadingFile/isLoadingFile.actions"
import { setIsLoadingMap } from "../../store/appSettings/isLoadingMap/isLoadingMap.actions"
import { setScaling } from "../../store/appSettings/scaling/scaling.actions"
import { maxFPS, RenderCodeMapEffect } from "./renderCodeMap.effect"

describe("renderCodeMapEffect", () => {
	let mockedStore
	let threeRendererRenderSpy: jest.Mock

	beforeEach(async () => {
		mockedStore = {
			select: (selector: unknown) => {
				switch (selector) {
					case accumulatedDataSelector:
						return new BehaviorSubject({ unifiedMapNode: {} })
					default:
						throw new Error("selector is not mocked")
				}
			},
			dispatch: jest.fn()
		}
		threeRendererRenderSpy = jest.fn()

		CodeMapRenderService.instance = { render: jest.fn(), scaleMap: jest.fn() } as unknown as CodeMapRenderService
		EffectsModule.actions$ = new Subject<Action>()

		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([RenderCodeMapEffect])],
			providers: [
				{ provide: Store, useValue: mockedStore },
				{ provide: UploadFilesService, useValue: { isUploading: false } },
				{ provide: ThreeRendererService, useValue: { render: threeRendererRenderSpy } }
			]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	afterEach(() => {
		EffectsModule.actions$.complete()
	})

	it("should render once throttled after actions requiring rerender, but not scale map", async () => {
		EffectsModule.actions$.next(setInvertArea(true))
		EffectsModule.actions$.next(setInvertArea(true))
		expect(CodeMapRenderService.instance.render).toHaveBeenCalledTimes(0)
		expect(threeRendererRenderSpy).toHaveBeenCalledTimes(0)

		await wait(maxFPS)
		expect(CodeMapRenderService.instance.render).toHaveBeenCalledTimes(1)
		expect(threeRendererRenderSpy).toHaveBeenCalledTimes(1)
		expect(CodeMapRenderService.instance.scaleMap).not.toHaveBeenCalled()
	})

	it("should scale map when scaling changes", async () => {
		EffectsModule.actions$.next(setScaling(new Vector3(1, 1, 1)))
		await wait(maxFPS)
		expect(CodeMapRenderService.instance.scaleMap).toHaveBeenCalledTimes(1)
	})

	it("should remove loading indicators after render", async () => {
		EffectsModule.actions$.next(setInvertArea(true))
		await wait(maxFPS)
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setIsLoadingFile(false))
		expect(mockedStore.dispatch).toHaveBeenCalledWith(setIsLoadingMap(false))
	})

	it("should not remove loading indicators after render when a file is still being uploaded", async () => {
		const uploadFileService = TestBed.inject(UploadFilesService)
		uploadFileService.isUploading = true
		EffectsModule.actions$.next(setInvertArea(true))
		await wait(maxFPS)
		expect(mockedStore.dispatch).not.toHaveBeenCalledWith(setIsLoadingFile(false))
		expect(mockedStore.dispatch).not.toHaveBeenCalledWith(setIsLoadingMap(false))
	})
})
