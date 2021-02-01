import "./sharpnessModeSelector.module"
import { SharpnessModeSelectorController } from "./sharpnessModeSelector.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { SharpnessModeService } from "../../state/store/appSettings/sharpnessMode/sharpnessMode.service"
import _ from "lodash"
import { SharpnessMode } from "../../codeCharta.model"

describe("SharpnessModeSelectorController", () => {
	let sharpnessModeSelectorController: SharpnessModeSelectorController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule(	"app.codeCharta.ui.sharpnessModeSelector")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		sharpnessModeSelectorController = new SharpnessModeSelectorController($rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to SharpnessModeService Events", () => {
			SharpnessModeService.subscribe = jest.fn()

			rebuildController()

			expect(SharpnessModeService.subscribe).toHaveBeenCalledWith($rootScope, sharpnessModeSelectorController)
		})

		it("should initialise viewModel sharpnessModes", () => {
			rebuildController()

			expect(sharpnessModeSelectorController["_viewModel"].sharpnessModes).toEqual(_.values(SharpnessMode))
		})
	})

	describe("onSharpnessModeChanged", () => {
		it("should update viewModel", () => {
			sharpnessModeSelectorController["_viewModel"].sharpnessMode = null

			sharpnessModeSelectorController.onSharpnessModeChanged(SharpnessMode.PixelRatioAA)

			expect(sharpnessModeSelectorController["_viewModel"].sharpnessMode).toEqual(SharpnessMode.PixelRatioAA)
		})
	})

	describe("applySharpnessMode", () => {
		it("should set new sharpnessMode into redux store", () => {
			sharpnessModeSelectorController["_viewModel"].sharpnessMode = SharpnessMode.PixelRatioFXAA

			sharpnessModeSelectorController.applySharpnessMode()

			expect(storeService.getState().appSettings.sharpnessMode).toEqual(SharpnessMode.PixelRatioFXAA)
		})
	})
})
