import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { Subject } from "rxjs"
import { mocked } from "ts-jest/utils"
import { ThreeOrbitControlsService } from "../../../ui/codeMap/threeViewer/threeOrbitControlsService"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { Store } from "../../angular-redux/store"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { resetCameraIfNewFileIsLoadedSelector } from "../../store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.selector"
import { RenderCodeMapEffect } from "../renderCodeMapEffect/renderCodeMap.effect"
import { AutoFitCodeMapOnFileSelectionChangeEffect } from "./autoFitCodeMapOnFileSelectionChange.effect"

jest.mock("../../store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.selector", () => ({
	resetCameraIfNewFileIsLoadedSelector: jest.fn()
}))
const mockedResetCameraIfNewFileIsLoadedSelector = mocked(resetCameraIfNewFileIsLoadedSelector)

describe("autoFitCodeMapOnFileSelectionChangeEffect", () => {
	const mockedRenderCodeMap$ = new Subject()
	const mockedVisibleFileStates$ = new Subject()
	const mockedStore = {
		select: (selector: unknown) => {
			switch (selector) {
				case visibleFileStatesSelector:
					return mockedVisibleFileStates$
				default:
					throw new Error("selector is not mocked")
			}
		},
		dispatch: jest.fn()
	}

	beforeEach(async () => {
		ThreeOrbitControlsService.instance = { autoFitTo: jest.fn() } as unknown as ThreeOrbitControlsService

		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([AutoFitCodeMapOnFileSelectionChangeEffect])],
			providers: [
				{ provide: RenderCodeMapEffect, useValue: { renderCodeMap$: mockedRenderCodeMap$ } },
				{ provide: Store, useValue: mockedStore }
			]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	it("should auto fit map after first render after selected files changed", () => {
		mockedResetCameraIfNewFileIsLoadedSelector.mockImplementation(() => true)
		mockedVisibleFileStates$.next("")
		mockedVisibleFileStates$.next("")
		expect(ThreeOrbitControlsService.instance.autoFitTo).not.toHaveBeenCalled()

		mockedRenderCodeMap$.next("")
		expect(ThreeOrbitControlsService.instance.autoFitTo).toHaveBeenCalledTimes(1)

		mockedRenderCodeMap$.next("")
		expect(ThreeOrbitControlsService.instance.autoFitTo).toHaveBeenCalledTimes(1)
	})

	it("should skip first change", () => {
		mockedResetCameraIfNewFileIsLoadedSelector.mockImplementation(() => true)
		mockedVisibleFileStates$.next("")
		mockedRenderCodeMap$.next("")
		expect(ThreeOrbitControlsService.instance.autoFitTo).toHaveBeenCalledTimes(1)
	})

	it("should do nothing when reset camera if new file is loaded is deactivated", () => {
		mockedResetCameraIfNewFileIsLoadedSelector.mockImplementation(() => false)
		mockedVisibleFileStates$.next("")
		mockedVisibleFileStates$.next("")
		mockedRenderCodeMap$.next("")
		expect(ThreeOrbitControlsService.instance.autoFitTo).not.toHaveBeenCalled()
	})
})
