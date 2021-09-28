import "../../../state.module"
import { IRootScopeService } from "angular"
import { StoreService } from "../../../store.service"
import { getService, instantiateModule } from "../../../../../../mocks/ng.mockhelper"
import { ColorModeAction, ColorModeActions } from "./colorMode.actions"
import { ColorModeService } from "./colorMode.service"
import { withMockedEventMethods } from "../../../../util/dataMocks"
import { ColorMode } from "../../../../codeCharta.model"

describe("ColorModeService", () => {
	let colorModeService: ColorModeService
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
		colorModeService = new ColorModeService($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to store", () => {
			StoreService.subscribe = jest.fn()

			rebuildService()

			expect(StoreService.subscribe).toHaveBeenCalledWith($rootScope, colorModeService)
		})
	})

	describe("onStoreChanged", () => {
		it("should notify all subscribers with the new colorMode value", () => {
			const action: ColorModeAction = {
				type: ColorModeActions.SET_COLOR_MODE,
				payload: ColorMode.absolute
			}
			storeService["store"].dispatch(action)

			colorModeService.onStoreChanged(ColorModeActions.SET_COLOR_MODE)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("color-mode-changed", { colorMode: ColorMode.absolute })
		})

		it("should not notify anything on non-color-mode-events", () => {
			colorModeService.onStoreChanged("ANOTHER_ACTION")

			expect($rootScope.$broadcast).not.toHaveBeenCalled()
		})
	})
})
