import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { BehaviorSubject, Subject } from "rxjs"
import { LayoutAlgorithm } from "../../../../model/codeCharta.model"
import { ThreeMapControlsService } from "../../../../renderer/threeViewer/threeMapControls.service"
import { filesLoaded } from "../../../../stores/fileStore/fileStore.facade"
import { visibleFileStatesSelector } from "../../../../stores/fileStore/store/visibleFileStates.selector"
import { layoutAlgorithmSelector } from "../../../../stores/mapState/mapState.read.facade"
import { colorRangeSelector } from "../../../../stores/mapState/store/colorRange/colorRange.selector"
import { resetCameraIfNewFileIsLoadedSelector } from "../../../../stores/preferences/preferences.read.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { focusedNodePathSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { NO_URL_METRICS } from "../../../../util/queryParameter/queryParameter"
import { GlobalSettingsFacade } from "../../../globalSettings/facade"
import { RenderCodeMapEffect } from "../renderCodeMapEffect/renderCodeMap.effect"
import { AutoFitCodeMapEffect } from "./autoFitCodeMap.effect"
import { viewSelectorsTriggeringAutoFit } from "./selectorsTriggeringAutoFit"

const aFilesLoaded = (forceAutoFit = false) =>
    filesLoaded({
        source: "url",
        areSampleFiles: false,
        urlMetrics: NO_URL_METRICS,
        forceAutoFit,
        forceDefaultMetrics: false,
        restoredSettings: null
    })

describe("autoFitCodeMapEffect", () => {
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
        const mockedSelectorsTriggeringAutoFit = viewSelectorsTriggeringAutoFit.map(selector => {
            return { selector, value: [] }
        })
        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([AutoFitCodeMapEffect])],
            providers: [
                { provide: RenderCodeMapEffect, useValue: { renderCodeMap$: mockedRenderCodeMap$ } },
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        ...mockedSelectorsTriggeringAutoFit,
                        { selector: visibleFileStatesSelector, value: [] },
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
        store.resetSelectors()
    })

    it("should skip first change", () => {
        // Act
        mockedRenderCodeMap$.next("")

        // Assert
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(0)
    })

    it("should auto fit the map once after the render that a load causes", () => {
        // Act
        actions$.next(aFilesLoaded())
        mockedRenderCodeMap$.next("")

        // Assert
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)

        // Act — a later render must not fit again
        mockedRenderCodeMap$.next("")

        // Assert
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
    })

    it("should auto fit the map once after the visible file set changed", () => {
        // Act
        store.overrideSelector(visibleFileStatesSelector, [{}] as never)
        store.refreshState()
        mockedRenderCodeMap$.next("")

        // Assert
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
    })

    it("should do nothing when 'reset camera if new file is loaded' is deactivated", () => {
        // Arrange
        resetCameraIfNewFileIsLoaded$.next(false)

        // Act
        actions$.next(aFilesLoaded())
        mockedRenderCodeMap$.next(undefined)

        // Assert
        expect(mockedAutoFitTo).not.toHaveBeenCalled()
    })

    it("should do nothing when color range has changed", () => {
        // Act
        store.overrideSelector(colorRangeSelector, { from: 1, to: 2 })
        store.refreshState()
        mockedRenderCodeMap$.next(undefined)

        // Assert
        expect(mockedAutoFitTo).not.toHaveBeenCalled()
    })

    it("should auto fit map when focused node paths has changed", () => {
        // Act
        store.overrideSelector(focusedNodePathSelector, [])
        store.refreshState()
        mockedRenderCodeMap$.next(undefined)

        // Assert
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
    })

    it("should auto fit map when layout algorithm has changed", () => {
        // Act
        store.overrideSelector(layoutAlgorithmSelector, LayoutAlgorithm.TreeMapStreet)
        store.refreshState()
        mockedRenderCodeMap$.next(undefined)

        // Assert
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
    })

    it("should auto fit the map when the load forces it even though the camera reset is deactivated", () => {
        // Arrange
        resetCameraIfNewFileIsLoaded$.next(false)

        // Act
        actions$.next(aFilesLoaded(true))
        mockedRenderCodeMap$.next(undefined)

        // Assert
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
    })
})
