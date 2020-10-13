import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { ShowLabelMetricAction, ShowLabelMetricActions } from "./showLabelMetric.actions"
import { ShowLabelMetricService } from "./showLabelMetric.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("ShowLabelMetricService", () => {
	let showLabelMetricService: ShowLabelMetricService
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
		showLabelMetricService = new ShowLabelMetricService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, showLabelMetricService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new showLabelMetric value", () => {
			const action: ShowLabelMetricAction = {
				type: ShowLabelMetricActions.SET_SHOW_LABEL_METRIC,
				payload: false
			}
			storeService["store"].dispatch(action)

			showLabelMetricService.onStoreChanged(ShowLabelMetricActions.SET_SHOW_LABEL_METRIC)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("show-label-metric-changed", { showLabelMetric: false })
		})

		it("should not notify anything on non-show-label-metric-events", () => {
			showLabelMetricService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
