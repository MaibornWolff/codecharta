import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action, State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { waitFor } from "@testing-library/angular"
import { Subject } from "rxjs"
import { LoadInitialFileService } from "../../../fileStore/fileStore.facade"
import { EDGE_METRIC_DATA } from "../../../mocks/dataMocks"
import { edgeMetricDataSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { setColorMetric, setEdgeMetric } from "../../../mapState/mapState.facade"
import { defaultState } from "../../store/state.manager"
import { UpdateQueryParametersEffect } from "./updateQueryParameters.effect"

describe("UpdateQueryParametersEffect", () => {
    const mockMapState = {
        ...defaultState.mapState,
        areaMetric: "rloc",
        heightMetric: "mcc",
        colorMetric: "functions",
        edgeMetric: "pairingRate"
    }
    const mockState = { ...defaultState, mapState: mockMapState }
    let mockGetState

    let actions$: Subject<Action>
    let store
    let replaceStateSpy

    beforeEach(async () => {
        actions$ = new Subject()
        mockGetState = jest.fn()

        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([UpdateQueryParametersEffect])],
            providers: [
                {
                    provide: LoadInitialFileService,
                    useValue: {
                        setRenderStateFromUrl: jest.fn(),
                        checkFileQueryParameterPresent: jest.fn(() => true)
                    }
                },
                {
                    provide: State,
                    useValue: { getValue: mockGetState }
                },
                provideMockStore({
                    selectors: [{ selector: edgeMetricDataSelector, value: [] }]
                }),
                provideMockActions(() => actions$)
            ]
        })

        store = TestBed.inject(MockStore)
        replaceStateSpy = jest.spyOn(global.window.history, "replaceState")

        mockGetState.mockReturnValue(mockState)
    })

    afterEach(() => {
        actions$.complete()
        jest.restoreAllMocks()
    })

    it("should not save metrics in query parameters when file parameter is not specified", async () => {
        const loadInitialFileService = TestBed.inject(LoadInitialFileService)
        jest.spyOn(loadInitialFileService, "checkFileQueryParameterPresent").mockImplementation(() => false)

        actions$.next(setEdgeMetric({ value: "pairingRate" }))

        await waitFor(() => expect(replaceStateSpy).not.toHaveBeenCalled())
    })

    it("should not save edge-metric in query parameters when map does not contain edges", async () => {
        actions$.next(setEdgeMetric({ value: "pairingRate" }))

        await waitFor(() =>
            expect(replaceStateSpy).toHaveBeenCalledWith(null, "", `http://localhost/?area=rloc&height=mcc&color=functions`)
        )
    })

    it("should remove currentFilesAreSampleFiles query parameter when currentFilesAreSampleFiles is false", async () => {
        global.window.history.replaceState(
            null,
            "",
            `http://localhost/?area=rloc&height=mcc&color=functions&currentFilesAreSampleFiles=true`
        )

        actions$.next(setColorMetric({ value: "pairingRate" }))

        await waitFor(() => {
            expect(replaceStateSpy).toHaveBeenLastCalledWith(null, "", `http://localhost/?area=rloc&height=mcc&color=functions`) // Now it checks for the latest state
        })
    })

    it("should save currentFilesAreSampleFiles in query parameters when currentFilesAreSampleFiles is true", async () => {
        mockGetState.mockReturnValue({
            ...mockState,
            appStatus: { ...mockState.appStatus, currentFilesAreSampleFiles: true }
        })

        actions$.next(setEdgeMetric({ value: "pairingRate" }))

        await waitFor(() =>
            expect(replaceStateSpy).toHaveBeenCalledWith(
                null,
                "",
                `http://localhost/?area=rloc&height=mcc&color=functions&currentFilesAreSampleFiles=true`
            )
        )
    })

    it("should save edge-metric in query parameters when map contains edges", async () => {
        store.overrideSelector(edgeMetricDataSelector, EDGE_METRIC_DATA)
        store.refreshState()

        actions$.next(setEdgeMetric({ value: "pairingRate" }))

        await waitFor(() =>
            expect(replaceStateSpy).toHaveBeenCalledWith(
                null,
                "",
                `http://localhost/?area=rloc&height=mcc&color=functions&edge=pairingRate`
            )
        )
    })

    it("should debounce save metrics in query parameters on multiple actions", async () => {
        actions$.next(setColorMetric({ value: "pairingRate" }))
        actions$.next(setColorMetric({ value: "avgCommits" }))
        store.refreshState()

        await waitFor(() => expect(replaceStateSpy).toHaveBeenCalledTimes(5))
    })
})
