import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { ShowMetricLabelNodeNameAction, ShowMetricLabelNodeNameActions } from "./showMetricLabelNodeName.actions"
import { ShowMetricLabelNodeNameService } from "./showMetricLabelNodeName.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("ShowMetricLabelNodeNameService", () => {
	let showMetricLabelNodeNameService: ShowMetricLabelNodeNameService
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
		showMetricLabelNodeNameService = new ShowMetricLabelNodeNameService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, showMetricLabelNodeNameService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new showMetricLabelNodeName value", () => {
			const action: ShowMetricLabelNodeNameAction = {
				type: ShowMetricLabelNodeNameActions.SET_SHOW_METRIC_LABEL_NODE_NAME,
				payload: false
			}
			storeService["store"].dispatch(action)

			showMetricLabelNodeNameService.onStoreChanged(ShowMetricLabelNodeNameActions.SET_SHOW_METRIC_LABEL_NODE_NAME)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("show-metric-label-node-name-changed", { showMetricLabelNodeName: false })
		})

		it("should not notify anything on non-show-metric-label-node-name-events", () => {
			showMetricLabelNodeNameService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
