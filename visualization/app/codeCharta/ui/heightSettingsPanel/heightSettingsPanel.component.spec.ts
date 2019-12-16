import "./heightSettingsPanel.module"

import { Vector3 } from "three"
import { HeightSettingsPanelController } from "./heightSettingsPanel.component"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { FileStateService } from "../../state/fileState.service"
import { Settings } from "../../codeCharta.model"
import { SETTINGS } from "../../util/dataMocks"
import { FileStateHelper } from "../../util/fileStateHelper"
import { StoreService } from "../../state/store.service"

describe("HeightSettingsPanelController", () => {
	let heightSettingsPanelController: HeightSettingsPanelController
	let $rootScope: IRootScopeService
	let settingsService: SettingsService
	let storeService: StoreService

	let settings: Settings
	let SOME_EXTRA_TIME = 400

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedSettingsService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.heightSettingsPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		settingsService = getService<SettingsService>("settingsService")
		storeService = getService<StoreService>("storeService")

		settings = JSON.parse(JSON.stringify(SETTINGS))
	}

	function rebuildController() {
		heightSettingsPanelController = new HeightSettingsPanelController($rootScope, settingsService, storeService)
	}

	function withMockedSettingsService() {
		settingsService = heightSettingsPanelController["settingsService"] = jest.fn().mockReturnValue({
			updateSettings: jest.fn(),
			getSettings: jest.fn().mockReturnValue({ appSettings: { scaling: new Vector3(1, 1, 1) } })
		})()
	}

	describe("constructor", () => {
		beforeEach(() => {
			SettingsService.subscribe = jest.fn()
			FileStateService.subscribe = jest.fn()
		})

		it("should subscribe to SettingsService", () => {
			rebuildController()

			expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, heightSettingsPanelController)
		})

		it("should subscribe to FileStateService", () => {
			rebuildController()

			expect(FileStateService.subscribe).toHaveBeenCalledWith($rootScope, heightSettingsPanelController)
		})
	})

	describe("onSettingsChanged", () => {
		it("should set amountOfTopTables in viewModel", () => {
			heightSettingsPanelController.onSettingsChanged(settings, undefined)

			expect(heightSettingsPanelController["_viewModel"].amountOfTopLabels).toBe(31)
		})

		it("should set scalingY in viewModel", () => {
			heightSettingsPanelController.onSettingsChanged(settings, undefined)

			expect(heightSettingsPanelController["_viewModel"].scalingY).toBe(1.8)
		})

		it("should set invertHeight in viewModel", () => {
			heightSettingsPanelController.onSettingsChanged(settings, undefined)

			expect(heightSettingsPanelController["_viewModel"].invertHeight).toBeTruthy()
		})
	})

	describe("onFileSelectionStateChanged", () => {
		beforeEach(() => {
			FileStateHelper.isDeltaState = jest.fn().mockReturnValue(true)
		})

		it("should set isDeltaState in viewModel", () => {
			heightSettingsPanelController.onFileSelectionStatesChanged([])

			expect(heightSettingsPanelController["_viewModel"].isDeltaState).toBe(true)
		})

		it("should call isDeltaState with empty array", () => {
			heightSettingsPanelController.onFileSelectionStatesChanged([])

			expect(FileStateHelper.isDeltaState).toHaveBeenCalledWith([])
		})
	})

	describe("applySettingsAmountOfTopLabels", () => {
		it("should call updateSettings", done => {
			heightSettingsPanelController["_viewModel"].amountOfTopLabels = 12
			const expected = {
				appSettings: {
					amountOfTopLabels: 12
				}
			}

			heightSettingsPanelController.applySettingsAmountOfTopLabels()

			expect(settingsService.updateSettings).toHaveBeenCalledWith(expected)

			setTimeout(() => {
				expect(storeService.getState().appSettings.amountOfTopLabels).toBe(12)
				done()
			}, HeightSettingsPanelController["DEBOUNCE_TIME"] + SOME_EXTRA_TIME)
		})
	})

	describe("applySettingsInvertHeight", () => {
		it("should call updateSettings", () => {
			heightSettingsPanelController["_viewModel"].invertHeight = true
			const expected = {
				appSettings: {
					invertHeight: true
				}
			}

			heightSettingsPanelController.applySettingsInvertHeight()

			expect(settingsService.updateSettings).toHaveBeenCalledWith(expected)
			expect(storeService.getState().appSettings.invertHeight).toBeTruthy()
		})
	})

	describe("applySettingsScaling", () => {
		it("should call updateSettings", done => {
			heightSettingsPanelController["_viewModel"].scalingY = 1.8
			const expected = {
				appSettings: {
					scaling: new Vector3(1, 1.8, 1)
				}
			}

			heightSettingsPanelController.applySettingsScaling()

			expect(settingsService.updateSettings).toHaveBeenCalledWith(expected)

			setTimeout(() => {
				expect(storeService.getState().appSettings.scaling).toEqual(new Vector3(1, 1.8, 1))
				done()
			}, HeightSettingsPanelController["DEBOUNCE_TIME"] + SOME_EXTRA_TIME)
		})
	})
})
