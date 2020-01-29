import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { IsLoadingMapAction, IsLoadingMapActions } from "./isLoadingMap.actions"
import { IsLoadingMapService } from "./isLoadingMap.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("IsLoadingMapService", () => {
	let isLoadingMapService: IsLoadingMapService
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
		isLoadingMapService = new IsLoadingMapService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, isLoadingMapService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new isLoadingMap value", () => {
			const action: IsLoadingMapAction = {
				type: IsLoadingMapActions.SET_IS_LOADING_MAP,
				payload: true
			}
			storeService["store"].dispatch(action)

			isLoadingMapService.onStoreChanged(IsLoadingMapActions.SET_IS_LOADING_MAP)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("is-loading-map-changed", { isLoadingMap: true })
		})

		it("should not notify anything on non-is-loading-map-events", () => {
			isLoadingMapService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
