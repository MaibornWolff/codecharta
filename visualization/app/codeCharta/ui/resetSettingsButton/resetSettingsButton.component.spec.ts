import "./resetSettingsButton.module"

import { ResetSettingsButtonController } from "./resetSettingsButton.component"
import { SettingsService } from "../../state/settings.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"

describe("resetSettingsButtonController", () => {
	let settingsService: SettingsService
	let resetSettingsButtonController: ResetSettingsButtonController

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedSettingsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.resetSettingsButton")
		settingsService = getService<SettingsService>("settingsService")
	}

	function rebuildController() {
		resetSettingsButtonController = new ResetSettingsButtonController(settingsService)
	}

	function withMockedSettingsService() {
		settingsService = resetSettingsButtonController["settingsService"] = jest.fn<SettingsService>(() => {
			return {
				updateSettings: jest.fn(),
				getDefaultSettings: jest.fn(() => {
					return { treeMapSettings: { mapSize: 700 } }
				})
			}
		})()
	}

	describe("onClick", () => {
		it("should call updateSettings", () => {
			resetSettingsButtonController.updateSettings = jest.fn()

			resetSettingsButtonController.onClick()

			expect(resetSettingsButtonController.updateSettings).toHaveBeenCalledTimes(1)
		})
	})

	describe("updateSettings", () => {
		it("should do something, but always returns an empty object", () => {
			resetSettingsButtonController["settingsNames"] =
				"appSettings.enableEdgeArrows, appSettings.hideFlatBuildings, appSettings.maximizeDetailPanel, appSettings.isWhiteBackground"
			resetSettingsButtonController.updateSettings()

			expect(settingsService.getDefaultSettings).toHaveBeenCalledTimes(1)
			expect(settingsService.updateSettings).toHaveBeenCalledTimes(1)
			expect(settingsService.updateSettings).toHaveBeenCalledWith({})
		})
	})

	xit(",,?", () => {
		settingsService.settings.mode = KindOfMap.Single
		resetSettingsButtonController.settingsNames = ",,"
		settingsService.getDefaultSettings.mockReturnValue({
			mode: KindOfMap.Delta
		})
		resetSettingsButtonController.updateSettings()
		expect(settingsService.settings.mode).toBe(KindOfMap.Single)
	})

	xit(" ?", () => {
		settingsService.settings.mode = KindOfMap.Single
		resetSettingsButtonController.settingsNames = " "
		settingsService.getDefaultSettings.mockReturnValue({
			mode: KindOfMap.Delta
		})
		resetSettingsButtonController.updateSettings()
		expect(settingsService.settings.mode).toBe(KindOfMap.Single)
	})

	xit("settingsName not in settingsservice?", () => {
		settingsService.settings.mode = {}
		resetSettingsButtonController.settingsNames = "deltas.something.bla"
		settingsService.getDefaultSettings.mockReturnValue({
			mode: KindOfMap.Delta
		})
		resetSettingsButtonController.updateSettings()
		expect(settingsService.settings.mode).toEqual({})
	})

	xit("settingsName not directly in settingsservice?", () => {
		settingsService.settings.mode = {
			hello: {
				notBla: 12
			}
		}
		resetSettingsButtonController.settingsNames = "deltas.hello.bla"
		settingsService.getDefaultSettings.mockReturnValue({
			mode: {
				hello: {}
			}
		})
		resetSettingsButtonController.updateSettings()
		expect(settingsService.settings.mode).toEqual({
			hello: {
				notBla: 12
			}
		})
	})

	xit("updateSettings should update setting in service", () => {
		settingsService.settings.mode = KindOfMap.Single
		resetSettingsButtonController.settingsNames = "mode"
		settingsService.getDefaultSettings.mockReturnValue({
			mode: KindOfMap.Delta
		})
		resetSettingsButtonController.updateSettings()
		expect(resetSettingsButtonController.settingsService.settings.mode).toBe(KindOfMap.Delta)
	})

	xit("updateSettings should update settings in service", () => {
		settingsService.settings.mode = KindOfMap.Single
		settingsService.settings.something = 13
		resetSettingsButtonController.settingsNames = "mode,something"
		settingsService.getDefaultSettings.mockReturnValue({
			mode: KindOfMap.Delta,
			something: 32
		})
		resetSettingsButtonController.updateSettings()
		expect(settingsService.settings.something).toBe(32)
	})

	xit("updateSettings should update nested settings in service", () => {
		settingsService.settings.something = {
			neutralColorRange: {
				from: 1,
				to: 1,
				flipped: false
			}
		}
		resetSettingsButtonController.settingsNames = "neutralColorRange.from, neutralColorRange.to, neutralColorRange.flipped"
		settingsService.getDefaultSettings.mockReturnValue({
			neutralColorRange: {
				from: 11,
				to: 12,
				flipped: false
			}
		})
		resetSettingsButtonController.updateSettings()
		expect(settingsService.settings.neutralColorRange.from).toBe(11)
		expect(settingsService.settings.neutralColorRange.to).toBe(12)
		expect(settingsService.settings.neutralColorRange.flipped).toBe(false)
	})

	xit("updateSettings should allow blankspace", () => {
		settingsService.settings.mode = KindOfMap.Single
		settingsService.settings.something = 13
		resetSettingsButtonController.settingsNames = "mode, something"
		settingsService.getDefaultSettings.mockReturnValue({
			mode: KindOfMap.Delta,
			something: 32
		})
		resetSettingsButtonController.updateSettings()
		expect(settingsService.settings.something).toBe(32)
	})

	xit("updateSettings should allow nl", () => {
		settingsService.settings.mode = KindOfMap.Single
		settingsService.settings.something = 13
		resetSettingsButtonController.settingsNames = "mode,\nsomething"
		settingsService.getDefaultSettings.mockReturnValue({
			mode: KindOfMap.Delta,
			something: 32
		})
		resetSettingsButtonController.updateSettings()
		expect(settingsService.settings.something).toBe(32)
	})
})
