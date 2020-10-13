import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { ShowLabelMetricNameValueAction, ShowLabelMetricNameValueActions } from "./showLabelMetricNameValue.actions"
import { ShowLabelMetricNameValueService } from "./showLabelMetricNameValue.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("ShowLabelMetricNameValueService", () => {
	let showLabelMetricNameValueService: ShowLabelMetricNameValueService
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
		showLabelMetricNameValueService = new ShowLabelMetricNameValueService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, showLabelMetricNameValueService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new showLabelMetricNameValue value", () => {
			const action: ShowLabelMetricNameValueAction = {
				type: ShowLabelMetricNameValueActions.SET_SHOW_LABEL_METRIC_NAME_VALUE,
				payload: true
			}
			storeService["store"].dispatch(action)

			showLabelMetricNameValueService.onStoreChanged(ShowLabelMetricNameValueActions.SET_SHOW_LABEL_METRIC_NAME_VALUE)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("show-label-metric-name-value-changed", { showLabelMetricNameValue: true })
		})

		it("should not notify anything on non-show-label-metric-name-value-events", () => {
			showLabelMetricNameValueService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
