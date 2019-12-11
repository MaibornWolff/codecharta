import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { InvertColorRangeAction, InvertColorRangeActions } from "./invertColorRange.actions"
import { InvertColorRangeService } from "./invertColorRange.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"

describe("InvertColorRangeService", () => {
	let invertColorRangeService: InvertColorRangeService
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
		invertColorRangeService = new InvertColorRangeService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, invertColorRangeService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new invertColorRange value", () => {
			const action: InvertColorRangeAction = {
				type: InvertColorRangeActions.SET_INVERT_COLOR_RANGE,
				payload: true
			}
			storeService["store"].dispatch(action)

			invertColorRangeService.onStoreChanged(InvertColorRangeActions.SET_INVERT_COLOR_RANGE)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("invert-color-range-changed", { invertColorRange: true })
		})

		it("should not notify anything on non-invert-color-range-events", () => {
			invertColorRangeService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
