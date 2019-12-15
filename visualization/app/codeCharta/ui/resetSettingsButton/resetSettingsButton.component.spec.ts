import "./resetSettingsButton.module"

import { Vector3 } from "three"
import { ResetSettingsButtonController } from "./resetSettingsButton.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { StoreService } from "../../state/store.service"
import { setScaling } from "../../state/store/appSettings/scaling/scaling.actions"
import { setInvertColorRange } from "../../state/store/appSettings/invertColorRange/invertColorRange.actions"

describe("resetSettingsButtonController", () => {
	let resetSettingsButtonController: ResetSettingsButtonController
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.resetSettingsButton")

		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		resetSettingsButtonController = new ResetSettingsButtonController(storeService)
	}

	describe("applyDefaultSettings", () => {
		it("should call updateSettings with available default settings objects", () => {
			resetSettingsButtonController["settingsNames"] =
				"appSettings.invertColorRange, appSettings.hideFlatBuildings, appSettings.notInAppSettings, notInSettings.something"
			storeService.dispatch(setInvertColorRange(true))
			storeService.dispatch(setInvertColorRange(true))

			resetSettingsButtonController.applyDefaultSettings()

			expect(storeService.getState().appSettings.invertColorRange).toBeFalsy()
			expect(storeService.getState().appSettings.hideFlatBuildings).toBeFalsy()
		})

		it("settingsNames should allow newline", () => {
			resetSettingsButtonController["settingsNames"] = "appSettings.invertColorRange,\nappSettings.hideFlatBuildings"

			resetSettingsButtonController.applyDefaultSettings()

			expect(storeService.getState().appSettings.invertColorRange).toBeFalsy()
			expect(storeService.getState().appSettings.hideFlatBuildings).toBeFalsy()
		})

		it("should do nothing if settingsNames only contains comma characters", () => {
			storeService.dispatch = jest.fn()
			resetSettingsButtonController["settingsNames"] = ",,"

			resetSettingsButtonController.applyDefaultSettings()

			expect(storeService.dispatch).not.toHaveBeenCalled()
		})

		it("should do nothing if settingsNames only contains space characters", () => {
			storeService.dispatch = jest.fn()
			resetSettingsButtonController["settingsNames"] = " "

			resetSettingsButtonController.applyDefaultSettings()

			expect(storeService.dispatch).not.toHaveBeenCalled()
		})

		it("should do nothing if settingsName not in defaultSettings", () => {
			storeService.dispatch = jest.fn()
			resetSettingsButtonController["settingsNames"] = "deltas.something.bla"

			resetSettingsButtonController.applyDefaultSettings()

			expect(storeService.dispatch).not.toHaveBeenCalled()
		})

		it("should update nested settings in service", () => {
			storeService.dispatch(setScaling(new Vector3(2, 2, 2)))
			resetSettingsButtonController["settingsNames"] = "appSettings.scaling.x, appSettings.scaling.y, appSettings.scaling.z"

			resetSettingsButtonController.applyDefaultSettings()

			expect(storeService.getState().appSettings.scaling).toEqual(new Vector3(1, 1, 1))
		})
	})
})
