import { TestBed } from "@angular/core/testing"
import { EffectsModule } from "@ngrx/effects"
import { provideMockActions } from "@ngrx/effects/testing"
import { Action, State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { waitFor } from "@testing-library/angular"
import { Subject } from "rxjs"
import { LoadInitialFileService } from "../../../services/loadInitialFile/loadInitialFile.service"
import { metricDataSelector } from "../../selectors/accumulatedData/metricData/metricData.selector"
import { setEdgeMetric } from "../../store/dynamicSettings/edgeMetric/edgeMetric.actions"
import { defaultState } from "../../store/state.manager"
import { SaveMetricsInQueryParametersEffect } from "./saveMetricsInQueryParameters.effect"
import { EDGE_METRIC_DATA, METRIC_DATA } from "../../../util/dataMocks"

describe("SaveMetricsInQueryParametersEffect", () => {
	let actions$: Subject<Action>
	let store
	let replaceStateSpy

	beforeEach(async () => {
		actions$ = new Subject()
		const mockDynamicSettings = {
			...defaultState.dynamicSettings,
			areaMetric: "rloc",
			heightMetric: "mcc",
			colorMetric: "functions",
			edgeMetric: "pairingRate"
		}

		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([SaveMetricsInQueryParametersEffect])],
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
					useValue: {
						getValue: () => {
							return { ...defaultState, dynamicSettings: mockDynamicSettings }
						}
					}
				},
				provideMockStore({
					selectors: [
						{ selector: metricDataSelector, value: { nodeMetricData: [], edgeMetricData: [], nodeEdgeMetricsMap: null } }
					]
				}),
				provideMockActions(() => actions$)
			]
		})

		store = TestBed.inject(MockStore)
		replaceStateSpy = jest.spyOn(global.window.history, "replaceState")
	})

	afterEach(() => {
		actions$.complete()
		jest.restoreAllMocks()
	})

	it("should not save metrics in query parameters when file parameter is not specified", async () => {
		const loadInitialFileService = TestBed.inject(LoadInitialFileService)
		jest.spyOn(loadInitialFileService, "checkFileQueryParameterPresent").mockImplementation(() => false)

		actions$.next(setEdgeMetric({ value: "pairingRate" }))
		store.refreshState()

		await waitFor(() => expect(replaceStateSpy).not.toHaveBeenCalled())
	})

	it("should not save edge-metric in query parameters when map does not contain edges", async () => {
		actions$.next(setEdgeMetric({ value: "pairingRate" }))
		store.refreshState()

		await waitFor(() =>
			expect(replaceStateSpy).toHaveBeenCalledWith(null, "", `http://localhost/?area=rloc&height=mcc&color=functions`)
		)
	})

	it("should save edge-metric in query parameters when map contains edges", async () => {
		store.overrideSelector(metricDataSelector, {
			edgeMetricData: EDGE_METRIC_DATA,
			nodeEdgeMetricsMap: null,
			nodeMetricData: METRIC_DATA
		})
		store.refreshState()

		actions$.next(setEdgeMetric({ value: "pairingRate" }))
		store.refreshState()

		await waitFor(() =>
			expect(replaceStateSpy).toHaveBeenCalledWith(
				null,
				"",
				`http://localhost/?area=rloc&height=mcc&color=functions&edge=pairingRate`
			)
		)
	})

	it("should debounce save metrics in query parameters on multiple actions", async () => {
		actions$.next(setEdgeMetric({ value: "pairingRate" }))
		actions$.next(setEdgeMetric({ value: "avgCommits" }))
		store.refreshState()

		await waitFor(() => expect(replaceStateSpy).toHaveBeenCalledTimes(3))
	})
})
