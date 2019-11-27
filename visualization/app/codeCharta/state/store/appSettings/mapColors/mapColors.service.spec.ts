import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { MapColorsAction, MapColorsActions } from "./mapColors.actions"
import { MapColorsService } from "./mapColors.service"
import { defaultMapColors } from "./mapColors.reducer"

describe("MapColorsService", () => {
	let mapColorsService: MapColorsService
	let storeService: StoreService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildService()
		withMockedEventMethods()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.state")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildService() {
		mapColorsService = new MapColorsService($rootScope, storeService)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, mapColorsService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new mapColors value", () => {
			const action: MapColorsAction = {
				type: MapColorsActions.SET_MAP_COLORS,
				payload: defaultMapColors
			}
			storeService["store"].dispatch(action)

			mapColorsService.onStoreChanged(MapColorsActions.SET_MAP_COLORS)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("map-colors-changed", { mapColors: defaultMapColors })
		})

		it("should not notify anything on non-map-colors-events", () => {
			mapColorsService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
