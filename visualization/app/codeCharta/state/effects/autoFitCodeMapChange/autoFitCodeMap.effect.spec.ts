import { TestBed } from "@angular/core/testing"
import { BehaviorSubject, Subject, of } from "rxjs"
import { ThreeMapControlsService } from "../../../ui/codeMap/threeViewer/threeMapControls.service"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates/visibleFileStates.selector"
import { GlobalSettingsFacade } from "../../../features/globalSettings/facade"
import {
    layoutAlgorithmSelector,
    resetCameraIfNewFileIsLoadedSelector
} from "../../../features/globalSettings/selectors/globalSettings.selectors"
import { focusedNodePathSelector } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.selector"
import { RenderCodeMapEffect } from "../renderCodeMapEffect/renderCodeMap.effect"
import { AutoFitCodeMapEffect } from "./autoFitCodeMap.effect"
import { EffectsModule } from "@ngrx/effects"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { provideMockActions } from "@ngrx/effects/testing"
import { LayoutAlgorithm } from "../../../codeCharta.model"
import { selectorsTriggeringAutoFit } from "./selectorsTriggeringAutoFit"
import { colorRangeSelector } from "../../store/dynamicSettings/colorRange/colorRange.selector"

describe("autoFitCodeMapOnFileSelectionChangeEffect", () => {
    let mockedRenderCodeMap$: Subject<unknown>
    let mockedAutoFitTo: jest.Mock
    let actions$: BehaviorSubject<Action>
    let store: MockStore
    let resetCameraIfNewFileIsLoaded$: BehaviorSubject<boolean>

    beforeEach(() => {
        actions$ = new BehaviorSubject({ type: "" })
        mockedRenderCodeMap$ = new Subject()
        mockedAutoFitTo = jest.fn()
        resetCameraIfNewFileIsLoaded$ = new BehaviorSubject(true)
        const mockedSelectorsTriggeringAutoFit = selectorsTriggeringAutoFit.map(selector => {
            return { selector, value: [] }
        })
        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([AutoFitCodeMapEffect])],
            providers: [
                { provide: RenderCodeMapEffect, useValue: { renderCodeMap$: mockedRenderCodeMap$ } },
                provideMockStore({
                    selectors: [
                        ...mockedSelectorsTriggeringAutoFit,
                        { selector: resetCameraIfNewFileIsLoadedSelector, value: true },
                        { selector: colorRangeSelector, value: { from: 0, to: 0 } }
                    ]
                }),
                provideMockActions(() => actions$),
                { provide: ThreeMapControlsService, useValue: { autoFitTo: mockedAutoFitTo } },
                {
                    provide: GlobalSettingsFacade,
                    useValue: { resetCameraIfNewFileIsLoaded$: () => resetCameraIfNewFileIsLoaded$ }
                }
            ]
        })
        store = TestBed.inject(MockStore)
        // Clear mock after TestBed setup to ensure clean state for each test
        mockedAutoFitTo.mockClear()
    })

    afterEach(() => {
        mockedRenderCodeMap$.complete()
        actions$.complete()
        resetCameraIfNewFileIsLoaded$.complete()
    })

    it("should skip first change", () => {
        mockedRenderCodeMap$.next("")
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(0)
    })

    it("should auto fit map once after render after selected files have changed once", () => {
        store.overrideSelector(visibleFileStatesSelector, [])
        store.refreshState()
        mockedRenderCodeMap$.next("")
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)

        mockedRenderCodeMap$.next("")
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
    })

    it("should do nothing when 'reset camera if new file is loaded' is deactivated", () => {
        resetCameraIfNewFileIsLoaded$.next(false)
        store.overrideSelector(visibleFileStatesSelector, [])
        store.refreshState()
        mockedRenderCodeMap$.next(undefined)
        expect(mockedAutoFitTo).not.toHaveBeenCalled()
    })

    it("should do nothing when color range has changed", () => {
        store.overrideSelector(colorRangeSelector, { from: 1, to: 2 })
        store.refreshState()
        mockedRenderCodeMap$.next(undefined)
        expect(mockedAutoFitTo).not.toHaveBeenCalled()
    })

    it("should auto fit map when focused node paths has changed", () => {
        store.overrideSelector(focusedNodePathSelector, [])
        store.refreshState()
        mockedRenderCodeMap$.next(undefined)
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
    })

    it("should auto fit map when layout algorithm has changed", () => {
        store.overrideSelector(layoutAlgorithmSelector, LayoutAlgorithm.TreeMapStreet)
        store.refreshState()
        mockedRenderCodeMap$.next(undefined)
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
    })

    it("should auto fit map if resetCameraIfNewFileIsLoadedSelector is set to false when starting ", () => {
        actions$.next({ type: "StartWithGlobalOption:resetCameraIfNewFileIsLoadedSetToFalse" })
        mockedRenderCodeMap$.next(undefined)
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
    })
})
