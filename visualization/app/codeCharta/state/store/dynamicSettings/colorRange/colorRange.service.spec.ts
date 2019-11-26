import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { ColorRangeAction, ColorRangeActions } from "../../dynamicSettings/colorRange/colorRange.actions"
import { ColorRangeService } from "./colorRange.service"

describe("ColorRangeService", () => {
	let colorRangeService: ColorRangeService
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
		colorRangeService = new ColorRangeService($rootScope, storeService)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, colorRangeService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new colorRange value", () => {
			const action: ColorRangeAction = {
				type: ColorRangeActions.SET_COLOR_RANGE,
				payload: { from: 33, to: 66 }
			}
			storeService["store"].dispatch(action)

			colorRangeService.onStoreChanged(ColorRangeActions.SET_COLOR_RANGE)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("color-range-changed", { colorRange: { from: 33, to: 66 } })
		})

		it("should not notify anything on non-color-range-events", () => {
			colorRangeService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
