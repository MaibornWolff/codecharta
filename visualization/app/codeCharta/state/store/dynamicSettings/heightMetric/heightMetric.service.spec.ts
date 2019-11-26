import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { HeightMetricAction, HeightMetricActions } from "../../dynamicSettings/heightMetric/heightMetric.actions"
import { HeightMetricService } from "./heightMetric.service"

describe("HeightMetricService", () => {
	let heightMetricService: HeightMetricService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		heightMetricService = new HeightMetricService($rootScope, storeService)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, heightMetricService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new heightMetric value", () => {
			const action: HeightMetricAction = {
				type: HeightMetricActions.SET_HEIGHT_METRIC,
				payload: "another_height_metric"
			}
			storeService["store"].dispatch(action)

			heightMetricService.onStoreChanged(HeightMetricActions.SET_HEIGHT_METRIC)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("height-metric-changed", { heightMetric: "another_height_metric" })
		})

		it("should not notify anything on non-height-metric-events", () => {
			heightMetricService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
