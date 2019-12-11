import "./resetSettingsButton.module"

import { Vector3 } from "three"
import { ResetSettingsButtonController } from "./resetSettingsButton.component"
import { SettingsService } from "../../state/settingsService/settings.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { RecursivePartial, Settings } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { setScaling } from "../../state/store/appSettings/scaling/scaling.actions"

describe("resetSettingsButtonController", () => {
	let resetSettingsButtonController: ResetSettingsButtonController
	let settingsService: SettingsService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedSettingsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.resetSettingsButton")

		settingsService = getService<SettingsService>("settingsService")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		resetSettingsButtonController = new ResetSettingsButtonController(settingsService, storeService)
	}

	function withMockedSettingsService() {
		settingsService = resetSettingsButtonController["settingsService"] = jest.fn<SettingsService>(() => {
			return {
				updateSettings: jest.fn(),
				getDefaultSettings: jest.fn(() => {
					return {
						appSettings: { hideFlatBuildings: false, invertColorRange: true }
					}
				}),
				getSettings: jest.fn()
			}
		})()
	}

	describe("applyDefaultSettings", () => {
		it("should call updateSettings with available default settings objects", () => {
			resetSettingsButtonController["settingsNames"] =
				"appSettings.invertColorRange, appSettings.hideFlatBuildings, appSettings.notInAppSettings, notInSettings.something"

			resetSettingsButtonController.applyDefaultSettings()

			expect(settingsService.getDefaultSettings).toHaveBeenCalledTimes(1)
			expect(settingsService.updateSettings).toHaveBeenCalledTimes(1)
			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				appSettings: { invertColorRange: true, hideFlatBuildings: false }
			})
			expect(storeService.getState().appSettings.invertColorRange).toBeTruthy()
			expect(storeService.getState().appSettings.hideFlatBuildings).toBeFalsy()
		})

		it("settingsNames should allow blank-space", () => {
			resetSettingsButtonController["settingsNames"] = "appSettings.invertColorRange, appSettings.hideFlatBuildings"

			resetSettingsButtonController.applyDefaultSettings()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				appSettings: { invertColorRange: true, hideFlatBuildings: false }
			})
			expect(storeService.getState().appSettings.invertColorRange).toBeTruthy()
			expect(storeService.getState().appSettings.hideFlatBuildings).toBeFalsy()
		})

		it("settingsNames should allow newline", () => {
			resetSettingsButtonController["settingsNames"] = "appSettings.invertColorRange,\nappSettings.hideFlatBuildings"

			resetSettingsButtonController.applyDefaultSettings()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({
				appSettings: { invertColorRange: true, hideFlatBuildings: false }
			})
			expect(storeService.getState().appSettings.invertColorRange).toBeTruthy()
			expect(storeService.getState().appSettings.hideFlatBuildings).toBeFalsy()
		})

		it("should do nothing if settingsNames only contains comma characters", () => {
			storeService.dispatch = jest.fn()
			resetSettingsButtonController["settingsNames"] = ",,"

			resetSettingsButtonController.applyDefaultSettings()

			expect(settingsService.updateSettings).not.toHaveBeenCalled()
			expect(storeService.dispatch).not.toHaveBeenCalled()
		})

		it("should do nothing if settingsNames only contains space characters", () => {
			storeService.dispatch = jest.fn()
			resetSettingsButtonController["settingsNames"] = " "

			resetSettingsButtonController.applyDefaultSettings()

			expect(settingsService.updateSettings).not.toHaveBeenCalled()
			expect(storeService.dispatch).not.toHaveBeenCalled()
		})

		it("should do nothing if settingsName not in defaultSettings", () => {
			storeService.dispatch = jest.fn()
			resetSettingsButtonController["settingsNames"] = "deltas.something.bla"

			resetSettingsButtonController.applyDefaultSettings()

			expect(settingsService.updateSettings).not.toHaveBeenCalled()
			expect(storeService.dispatch).not.toHaveBeenCalled()
		})

		it("should update nested settings in service", () => {
			const newSettings: RecursivePartial<Settings> = {
				appSettings: { scaling: new Vector3(42, 42, 42) }
			}
			settingsService.updateSettings({
				appSettings: { scaling: new Vector3(1, 1, 1) }
			})
			storeService.dispatch(setScaling(new Vector3(1, 1, 1)))
			resetSettingsButtonController["settingsNames"] = "appSettings.scaling.x, appSettings.scaling.y, appSettings.scaling.z"
			settingsService.getDefaultSettings = jest.fn(() => newSettings)

			resetSettingsButtonController.applyDefaultSettings()

			expect(settingsService.updateSettings).toHaveBeenCalledWith(newSettings)
			expect(storeService.getState().appSettings.scaling).toEqual(newSettings.appSettings.scaling)
		})
	})
})
