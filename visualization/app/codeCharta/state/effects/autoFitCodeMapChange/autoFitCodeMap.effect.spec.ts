import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { Subject } from "rxjs"
import { mocked } from "ts-jest/utils"
import { ThreeOrbitControlsService } from "../../../ui/codeMap/threeViewer/threeOrbitControls.service"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { Store } from "../../angular-redux/store"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { layoutAlgorithmSelector } from "../../store/appSettings/layoutAlgorithm/layoutAlgorithm.selector"
import { resetCameraIfNewFileIsLoadedSelector } from "../../store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.selector"
import { focusedNodePathSelector } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.selector"
import { RenderCodeMapEffect } from "../renderCodeMapEffect/renderCodeMap.effect"
import { AutoFitCodeMapEffect } from "./autoFitCodeMap.effect"

jest.mock("../../store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.selector", () => ({
	resetCameraIfNewFileIsLoadedSelector: jest.fn()
}))
const mockedResetCameraIfNewFileIsLoadedSelector = mocked(resetCameraIfNewFileIsLoadedSelector)

describe("autoFitCodeMapOnFileSelectionChangeEffect", () => {
	let mockedRenderCodeMap$: Subject<unknown>
	let mockedVisibleFileStates$: Subject<unknown>
	let mockedFocusedNodePath$: Subject<unknown>
	let mockedLayoutAlgorithm$: Subject<unknown>
	const mockedStore = {
		select: (selector: unknown) => {
			switch (selector) {
				case visibleFileStatesSelector:
					return mockedVisibleFileStates$
				case focusedNodePathSelector:
					return mockedFocusedNodePath$
				case layoutAlgorithmSelector:
					return mockedLayoutAlgorithm$
				default:
					throw new Error("selector is not mocked")
			}
		},
		dispatch: jest.fn()
	}
	let mockedAutoFitTo: jest.Mock

	beforeEach(async () => {
		mockedRenderCodeMap$ = new Subject()
		mockedVisibleFileStates$ = new Subject()
		mockedFocusedNodePath$ = new Subject()
		mockedLayoutAlgorithm$ = new Subject()
		mockedAutoFitTo = jest.fn()
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([AutoFitCodeMapEffect])],
			providers: [
				{ provide: RenderCodeMapEffect, useValue: { renderCodeMap$: mockedRenderCodeMap$ } },
				{ provide: Store, useValue: mockedStore },
				{ provide: ThreeOrbitControlsService, useValue: { autoFitTo: mockedAutoFitTo } }
			]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise

		mockedVisibleFileStates$.next("")
		mockedFocusedNodePath$.next("")
		mockedLayoutAlgorithm$.next("")
		mockedRenderCodeMap$.next("")
	})

	afterEach(() => {
		mockedRenderCodeMap$.complete()
		mockedVisibleFileStates$.complete()
		mockedFocusedNodePath$.complete()
		mockedLayoutAlgorithm$.complete()
	})

	it("should skip first change", () => {
		mockedResetCameraIfNewFileIsLoadedSelector.mockImplementation(() => true)
		mockedRenderCodeMap$.next("")
		expect(mockedAutoFitTo).toHaveBeenCalledTimes(0)
	})

	it("should auto fit map once after render after selected files have changed", () => {
		mockedResetCameraIfNewFileIsLoadedSelector.mockImplementation(() => true)
		mockedVisibleFileStates$.next("")
		mockedRenderCodeMap$.next("")
		expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)

		mockedRenderCodeMap$.next("")
		expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
	})

	it("should switch and not concat inner observable, so auto fit map gets called only once", () => {
		mockedResetCameraIfNewFileIsLoadedSelector.mockImplementation(() => true)
		mockedVisibleFileStates$.next("")
		mockedFocusedNodePath$.next("")
		mockedRenderCodeMap$.next("")
		expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)

		mockedRenderCodeMap$.next("")
		expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
	})

	it("should do nothing when 'reset camera if new file is loaded' is deactivated", () => {
		mockedResetCameraIfNewFileIsLoadedSelector.mockImplementation(() => false)
		mockedVisibleFileStates$.next("")
		mockedRenderCodeMap$.next("")
		expect(mockedAutoFitTo).not.toHaveBeenCalled()
	})

	it("should auto fit map when focused node paths has changed", () => {
		mockedResetCameraIfNewFileIsLoadedSelector.mockImplementation(() => true)
		mockedFocusedNodePath$.next("")
		mockedRenderCodeMap$.next("")
		expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
	})

	it("should auto fit map when layout algorithm has changed", () => {
		mockedResetCameraIfNewFileIsLoadedSelector.mockImplementation(() => true)
		mockedLayoutAlgorithm$.next("")
		mockedRenderCodeMap$.next("")
		expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
	})
})
