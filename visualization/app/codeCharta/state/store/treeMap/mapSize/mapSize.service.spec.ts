import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { MapSizeAction, MapSizeActions } from "./mapSize.actions"
import { MapSizeService } from "./mapSize.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("MapSizeService", () => {
	let mapSizeService: MapSizeService
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
		mapSizeService = new MapSizeService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribeToFilesSelection to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, mapSizeService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new mapSize value", () => {
			const action: MapSizeAction = {
				type: MapSizeActions.SET_MAP_SIZE,
				payload: 42
			}
			storeService["store"].dispatch(action)

			mapSizeService.onStoreChanged(MapSizeActions.SET_MAP_SIZE)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("map-size-changed", { mapSize: 42 })
		})

		it("should not notify anything on non-map-size-events", () => {
			mapSizeService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
