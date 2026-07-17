import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { waitFor } from "@testing-library/angular"
import { Subject } from "rxjs"
import { EDGE_METRIC_DATA } from "../../../mocks/dataMocks"
import { edgeMetricDataSelector } from "../../../renderer/renderModel/edgeMetricData/edgeMetricData.selector"
import { FileStoreReadWindow } from "../../../stores/fileStore/fileStore.facade"
import { MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"
import { setColorMetric, setEdgeMetric } from "../../../stores/mapState/mapState.write.facade"
import { defaultState } from "../../../stores/rootStore/state.manager"
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

        // The effect only writes back when a file query parameter is present.
        window.history.replaceState(null, "", "http://localhost/?file=valid.json")

        TestBed.configureTestingModule({
            imports: [EffectsModule.forRoot([UpdateQueryParametersEffect])],
            providers: [
                {
                    provide: MapStateReadWindow,
                    useValue: { getMapState: () => mockGetState().mapState }
                },
                {
                    provide: FileStoreReadWindow,
                    useValue: { getCurrentFilesAreSampleFiles: () => mockGetState().currentFilesAreSampleFiles }
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
        window.history.replaceState(null, "", "http://localhost/")
    })

    it("should not save metrics in query parameters when file parameter is not specified", async () => {
        window.history.replaceState(null, "", "http://localhost/")
        replaceStateSpy.mockClear()

        actions$.next(setEdgeMetric({ value: "pairingRate" }))

        await waitFor(() => expect(replaceStateSpy).not.toHaveBeenCalled())
    })

    it("should not save edge-metric in query parameters when map does not contain edges", async () => {
        actions$.next(setEdgeMetric({ value: "pairingRate" }))

        await waitFor(() =>
            expect(replaceStateSpy).toHaveBeenCalledWith(null, "", `http://localhost/?file=valid.json&area=rloc&height=mcc&color=functions`)
        )
    })

    it("should remove currentFilesAreSampleFiles query parameter when currentFilesAreSampleFiles is false", async () => {
        window.history.replaceState(
            null,
            "",
            `http://localhost/?file=valid.json&area=rloc&height=mcc&color=functions&currentFilesAreSampleFiles=true`
        )

        actions$.next(setColorMetric({ value: "pairingRate" }))

        await waitFor(() => {
            expect(replaceStateSpy).toHaveBeenLastCalledWith(
                null,
                "",
                `http://localhost/?file=valid.json&area=rloc&height=mcc&color=functions`
            )
        })
    })

    it("should save currentFilesAreSampleFiles in query parameters when currentFilesAreSampleFiles is true", async () => {
        mockGetState.mockReturnValue({
            ...mockState,
            currentFilesAreSampleFiles: true
        })

        actions$.next(setEdgeMetric({ value: "pairingRate" }))

        await waitFor(() =>
            expect(replaceStateSpy).toHaveBeenCalledWith(
                null,
                "",
                `http://localhost/?file=valid.json&area=rloc&height=mcc&color=functions&currentFilesAreSampleFiles=true`
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
                `http://localhost/?file=valid.json&area=rloc&height=mcc&color=functions&edge=pairingRate`
            )
        )
    })

    it("should debounce save metrics in query parameters on multiple actions", async () => {
        replaceStateSpy.mockClear()

        actions$.next(setColorMetric({ value: "pairingRate" }))
        actions$.next(setColorMetric({ value: "avgCommits" }))
        store.refreshState()

        // The whole query string is now written in a single replaceState per debounced update.
        await waitFor(() => expect(replaceStateSpy).toHaveBeenCalledTimes(1))
    })
})
