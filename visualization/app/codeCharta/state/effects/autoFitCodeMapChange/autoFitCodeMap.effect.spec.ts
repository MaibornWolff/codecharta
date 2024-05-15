import { TestBed } from "@angular/core/testing"
import { BehaviorSubject, Subject } from "rxjs"
import { ThreeOrbitControlsService } from "../../../ui/codeMap/threeViewer/threeOrbitControls.service"
import { visibleFileStatesSelector } from "../../selectors/visibleFileStates.selector"
import { layoutAlgorithmSelector } from "../../store/appSettings/layoutAlgorithm/layoutAlgorithm.selector"
import { resetCameraIfNewFileIsLoadedSelector } from "../../store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.selector"
import { focusedNodePathSelector } from "../../store/dynamicSettings/focusedNodePath/focusedNodePath.selector"
import { RenderCodeMapEffect } from "../renderCodeMapEffect/renderCodeMap.effect"
import { AutoFitCodeMapEffect } from "./autoFitCodeMap.effect"
import { EffectsModule } from "@ngrx/effects"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { provideMockActions } from "@ngrx/effects/testing"
import { LayoutAlgorithm } from "../../../codeCharta.model"

describe("autoFitCodeMapOnFileSelectionChangeEffect", () => {
    let mockedRenderCodeMap$: Subject<unknown>
    let mockedAutoFitTo: jest.Mock
    let actions$: BehaviorSubject<Action>
    let store: MockStore

    beforeEach(() => {
        actions$ = new BehaviorSubject({ type: "" })
        mockedRenderCodeMap$ = new Subject()
        mockedAutoFitTo = jest.fn()
        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([AutoFitCodeMapEffect])],
            providers: [
                { provide: RenderCodeMapEffect, useValue: { renderCodeMap$: mockedRenderCodeMap$ } },
                provideMockStore({
                    selectors: [
                        { selector: visibleFileStatesSelector, value: [] },
                        { selector: focusedNodePathSelector, value: [] },
                        { selector: layoutAlgorithmSelector, value: LayoutAlgorithm.StreetMap },
                        { selector: resetCameraIfNewFileIsLoadedSelector, value: true }
                    ]
                }),
                provideMockActions(() => actions$),
                { provide: ThreeOrbitControlsService, useValue: { autoFitTo: mockedAutoFitTo } }
            ]
        })
        store = TestBed.inject(MockStore)
    })

    afterEach(() => {
        mockedRenderCodeMap$.complete()
        actions$.complete()
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
        store.overrideSelector(resetCameraIfNewFileIsLoadedSelector, false)
        store.refreshState()
        store.overrideSelector(visibleFileStatesSelector, [])
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
})
