import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { AreaMetricService } from "./areaMetric.service"
import { AreaMetricAction, AreaMetricActions } from "./areaMetric.actions"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("AreaMetricService", () => {
	let areaMetricService: AreaMetricService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods($rootScope)
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		areaMetricService = new AreaMetricService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, areaMetricService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new areaMetric value", () => {
			const action: AreaMetricAction = {
				type: AreaMetricActions.SET_AREA_METRIC,
				payload: "another_area_metric"
			}
			storeService["store"].dispatch(action)

			areaMetricService.onStoreChanged(AreaMetricActions.SET_AREA_METRIC)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("area-metric-changed", { areaMetric: "another_area_metric" })
		})

		it("should not notify anything on non-area-metric-events", () => {
			areaMetricService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
