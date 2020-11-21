import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { ShowMetricLabelNameValueAction, ShowMetricLabelNameValueActions } from "./showMetricLabelNameValue.actions"
import { LabelShowNodeNameService } from "./labelShowNodeNameService"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("LabelShowNodeNameService", () => {
	let labelShowNodeNameService: LabelShowNodeNameService
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
		labelShowNodeNameService = new LabelShowNodeNameService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, labelShowNodeNameService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new showMetricLabelNameValue value", () => {
			const action: ShowMetricLabelNameValueAction = {
				type: ShowMetricLabelNameValueActions.SET_SHOW_METRIC_LABEL_NAME_VALUE,
				payload: false
			}
			storeService["store"].dispatch(action)

			labelShowNodeNameService.onStoreChanged(ShowMetricLabelNameValueActions.SET_SHOW_METRIC_LABEL_NAME_VALUE)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("show-metric-label-name-value-changed", { showMetricLabelNameValue: false })
		})

		it("should not notify anything on non-show-metric-label-name-value-events", () => {
			labelShowNodeNameService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
