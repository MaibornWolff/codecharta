import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { SharpnessAction, SharpnessActions } from "./sharpness.actions"
import { SharpnessModeService } from "./sharpness.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { SharpnessMode } from "../../../../codeCharta.model"

describe("SharpnessModeService", () => {
	let sharpnessModeService: SharpnessModeService
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
		sharpnessModeService = new SharpnessModeService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, sharpnessModeService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new sharpnessMode value", () => {
			const action: SharpnessAction = {
				type: SharpnessActions.SET_SHARPNESS_MODE,
				payload: SharpnessMode.PixelRatioAA
			}
			storeService["store"].dispatch(action)

			sharpnessModeService.onStoreChanged(SharpnessActions.SET_SHARPNESS_MODE)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("sharpness-mode-changed", { sharpnessMode: SharpnessMode.PixelRatioAA })
		})

		it("should not notify anything on non-sharpness-mode-events", () => {
			sharpnessModeService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
