import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { TrackingDataEnabledService } from "./trackingDataEnabled.service"
import { TrackingDataEnabledAction, TrackingDataEnabledActions } from "./trackingDataEnabled.actions"

describe("TrackingDataEnabledService", () => {
	let trackingDataEnabledService: TrackingDataEnabledService
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
		trackingDataEnabledService = new TrackingDataEnabledService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, trackingDataEnabledService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new trackingDataEnabled value", () => {
			const action: TrackingDataEnabledAction = {
				type: TrackingDataEnabledActions.SET_TRACKING_DATA_ENABLED,
				payload: true
			}
			storeService["store"].dispatch(action)

			trackingDataEnabledService.onStoreChanged(TrackingDataEnabledActions.SET_TRACKING_DATA_ENABLED)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("tracking-data-enabled-changed", {
				trackingDataEnabled: true
			})
		})

		it("should not notify anything on non-tracking-data-enabled-events", () => {
			trackingDataEnabledService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
