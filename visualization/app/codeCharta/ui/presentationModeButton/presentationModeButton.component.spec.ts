import "./presentationModeButton.module"
import { PresentationModeButtonController } from "./presentationModeButton.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { SettingsService } from "../../state/settingsService/settings.service"

describe("PresentationModeButtonController", () => {
	let presentationModeButtonController: PresentationModeButtonController
	let settingsService: SettingsService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedSettingsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.presentationModeButton")

		settingsService = getService<SettingsService>("settingsService")
	}

	function rebuildController() {
		presentationModeButtonController = new PresentationModeButtonController(settingsService)
	}

	function withMockedSettingsService() {
		settingsService = presentationModeButtonController["settingsService"] = jest.fn().mockReturnValue({
			updateSettings: jest.fn()
		})()
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

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ appSettings: { isPresentationMode: true } }, true)
		})
	})
})
