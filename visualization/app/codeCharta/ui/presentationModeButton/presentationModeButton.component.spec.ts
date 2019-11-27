import "./presentationModeButton.module"
import { PresentationModeButtonController } from "./presentationModeButton.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { StoreService } from "../../state/store.service"
import { IRootScopeService } from "angular"

describe("PresentationModeButtonController", () => {
	let presentationModeButtonController: PresentationModeButtonController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.presentationModeButton")

		storeService = getService<StoreService>("storeService")
		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	function rebuildController() {
		presentationModeButtonController = new PresentationModeButtonController($rootScope, storeService)
	}

	describe("toggleMode", () => {
		it("should change isEnabled from true to false", () => {
			presentationModeButtonController["_viewModel"].isEnabled = true

			presentationModeButtonController.toggleMode()

			expect(presentationModeButtonController["_viewModel"].isEnabled).toBeFalsy()
		})

		it("should change isEnabled from false to true", () => {
			presentationModeButtonController["_viewModel"].isEnabled = false

			presentationModeButtonController.toggleMode()

			expect(presentationModeButtonController["_viewModel"].isEnabled).toBeTruthy()
		})

		it("should update isPresentationMode in SettingsService", () => {
			presentationModeButtonController["_viewModel"].isEnabled = false

			presentationModeButtonController.toggleMode()

			expect(storeService.getState().appSettings.isPresentationMode).toBeTruthy()
		})
	})

	describe("onPresentationModeChanged", () => {
		it("should update the viewModel", () => {
			presentationModeButtonController["_viewModel"].isEnabled = false

			presentationModeButtonController.onPresentationModeChanged(true)

			expect(presentationModeButtonController["_viewModel"].isEnabled).toBeTruthy()
		})
	})
})
