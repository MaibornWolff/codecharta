import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { ShowMetricLabelNodeNameAction, ShowMetricLabelNodeNameActions } from "./showMetricLabelNodeName.actions"
import { LabelShowMetricValueService } from "./labelShowMetricValueService"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("LabelShowMetricValueService", () => {
	let labelShowMetricValueService: LabelShowMetricValueService
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
		labelShowMetricValueService = new LabelShowMetricValueService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, labelShowMetricValueService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new showMetricLabelNodeName value", () => {
			const action: ShowMetricLabelNodeNameAction = {
				type: ShowMetricLabelNodeNameActions.SET_SHOW_METRIC_LABEL_NODE_NAME,
				payload: false
			}
			storeService["store"].dispatch(action)

			labelShowMetricValueService.onStoreChanged(ShowMetricLabelNodeNameActions.SET_SHOW_METRIC_LABEL_NODE_NAME)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("show-metric-label-node-name-changed", { showMetricLabelNodeName: false })
		})

		it("should not notify anything on non-show-metric-label-node-name-events", () => {
			labelShowMetricValueService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
