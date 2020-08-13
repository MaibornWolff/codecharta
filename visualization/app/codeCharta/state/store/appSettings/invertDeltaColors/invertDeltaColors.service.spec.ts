import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { InvertDeltaColorsAction, InvertDeltaColorsActions } from "./invertDeltaColors.actions"
import { InvertDeltaColorsService } from "./invertDeltaColors.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("InvertDeltaColorsService", () => {
	let invertDeltaColorsService: InvertDeltaColorsService
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
		invertDeltaColorsService = new InvertDeltaColorsService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, invertDeltaColorsService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new invertDeltaColors value", () => {
			const action: InvertDeltaColorsAction = {
				type: InvertDeltaColorsActions.SET_INVERT_DELTA_COLORS,
				payload: true
			}
			storeService["store"].dispatch(action)

			invertDeltaColorsService.onStoreChanged(InvertDeltaColorsActions.SET_INVERT_DELTA_COLORS)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("invert-delta-colors-changed", {
				invertDeltaColors: true
			})
		})

		it("should not notify anything on non-invert-delta-colors-events", () => {
			invertDeltaColorsService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
