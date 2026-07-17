import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { BehaviorSubject, Subject } from "rxjs"
import { LayoutAlgorithm } from "../../../../model/codeCharta.model"
import { ThreeMapControlsService } from "../../../../renderer/threeViewer/threeMapControls.service"
import { ThreeSceneService } from "../../../../renderer/threeViewer/threeSceneService"
import { filesLoaded } from "../../../../stores/fileStore/fileStore.facade"
import { visibleFileStatesSelector } from "../../../../stores/fileStore/store/visibleFileStates.selector"
import { layoutAlgorithmSelector } from "../../../../stores/mapState/mapState.read.facade"
import { colorRangeSelector } from "../../../../stores/mapState/store/colorRange/colorRange.selector"
import { resetCameraIfNewFileIsLoadedSelector } from "../../../../stores/preferences/preferences.read.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { focusedNodePathSelector } from "../../../../stores/sharedView/sharedView.read.facade"
import { NO_URL_METRICS } from "../../../../util/queryParameter/queryParameter"
import { GlobalSettingsFacade } from "../../../globalSettings/facade"
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
    let mockedMapMeshChanged$: Subject<void>
    let mockedAutoFitTo: jest.Mock
    let actions$: BehaviorSubject<Action>
    let store: MockStore
    let resetCameraIfNewFileIsLoaded$: BehaviorSubject<boolean>

    // Standing in for the scene: signal that a new map mesh has been placed, which is what the fit waits for.
    const emitMapMeshChanged = () => {
        mockedMapMeshChanged$.next()
    }

    beforeEach(() => {
        actions$ = new BehaviorSubject({ type: "" })
        mockedMapMeshChanged$ = new Subject()
        mockedAutoFitTo = jest.fn()
        resetCameraIfNewFileIsLoaded$ = new BehaviorSubject(true)
        const mockedSelectorsTriggeringAutoFit = viewSelectorsTriggeringAutoFit.map(selector => {
            return { selector, value: [] }
        })
        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([AutoFitCodeMapEffect])],
            providers: [
                { provide: ThreeSceneService, useValue: { mapMeshChanged$: mockedMapMeshChanged$ } },
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
        emitMapMeshChanged()

        // Assert
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(0)
    })

    it("should auto fit the map once after the mesh a load produces is placed", () => {
        // Act
        actions$.next(aFilesLoaded())
        emitMapMeshChanged()

        // Assert
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)

        // Act — a later mesh swap must not fit again
        emitMapMeshChanged()

        // Assert
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
    })

    it("should collapse a burst of triggers from a single load into exactly one fit", () => {
        // Act — a load emits the action and makes the file/view selectors emit, all synchronously
        actions$.next(aFilesLoaded())
        store.overrideSelector(visibleFileStatesSelector, [{}] as never)
        store.refreshState()
        store.overrideSelector(focusedNodePathSelector, [])
        store.refreshState()
        emitMapMeshChanged()

        // Assert
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
    })

    it("should still fit when the mesh is placed before the trigger settles into a later frame", () => {
        // Act — the request is registered first, the mesh swap arrives afterwards (the load ordering)
        actions$.next(aFilesLoaded())

        // Assert — nothing fits until the mesh is actually in the scene
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(0)

        // Act
        emitMapMeshChanged()

        // Assert
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
    })

    it("should auto fit the map once after the visible file set changed", () => {
        // Act
        store.overrideSelector(visibleFileStatesSelector, [{}] as never)
        store.refreshState()
        emitMapMeshChanged()

        // Assert
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
    })

    it("should do nothing when 'reset camera if new file is loaded' is deactivated", () => {
        // Arrange
        resetCameraIfNewFileIsLoaded$.next(false)

        // Act
        actions$.next(aFilesLoaded())
        emitMapMeshChanged()

        // Assert
        expect(mockedAutoFitTo).not.toHaveBeenCalled()
    })

    it("should do nothing when color range has changed", () => {
        // Act
        store.overrideSelector(colorRangeSelector, { from: 1, to: 2 })
        store.refreshState()
        emitMapMeshChanged()

        // Assert
        expect(mockedAutoFitTo).not.toHaveBeenCalled()
    })

    it("should auto fit map when focused node paths has changed", () => {
        // Act
        store.overrideSelector(focusedNodePathSelector, [])
        store.refreshState()
        emitMapMeshChanged()

        // Assert
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
    })

    it("should auto fit map when layout algorithm has changed", () => {
        // Act
        store.overrideSelector(layoutAlgorithmSelector, LayoutAlgorithm.TreeMapStreet)
        store.refreshState()
        emitMapMeshChanged()

        // Assert
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
    })

    it("should auto fit the map when the load forces it even though the camera reset is deactivated", () => {
        // Arrange
        resetCameraIfNewFileIsLoaded$.next(false)

        // Act
        actions$.next(aFilesLoaded(true))
        emitMapMeshChanged()

        // Assert
        expect(mockedAutoFitTo).toHaveBeenCalledTimes(1)
    })
})
