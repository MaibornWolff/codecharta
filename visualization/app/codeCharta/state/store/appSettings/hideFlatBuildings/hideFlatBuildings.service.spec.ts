import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { HideFlatBuildingsAction, HideFlatBuildingsActions } from "./hideFlatBuildings.actions"
import { HideFlatBuildingsService } from "./hideFlatBuildings.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("HideFlatBuildingsService", () => {
	let hideFlatBuildingsService: HideFlatBuildingsService
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
		hideFlatBuildingsService = new HideFlatBuildingsService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, hideFlatBuildingsService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new hideFlatBuildings value", () => {
			const action: HideFlatBuildingsAction = {
				type: HideFlatBuildingsActions.SET_HIDE_FLAT_BUILDINGS,
				payload: false
			}
			storeService["store"].dispatch(action)

			hideFlatBuildingsService.onStoreChanged(HideFlatBuildingsActions.SET_HIDE_FLAT_BUILDINGS)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("hide-flat-buildings-changed", { hideFlatBuildings: false })
		})

		it("should not notify anything on non-hide-flat-buildings-events", () => {
			hideFlatBuildingsService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
