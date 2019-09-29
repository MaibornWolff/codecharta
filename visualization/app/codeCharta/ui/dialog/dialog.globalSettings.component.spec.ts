import "./dialog.module"
import "../codeMap/codeMap.module"
import { DialogGlobalSettingsController } from "./dialog.globalSettings.component"
import { SettingsService } from "../../state/settingsService/settings.service"
import { Settings } from "../../codeCharta.model"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { DEFAULT_SETTINGS } from "../../util/dataMocks"
import { IRootScopeService } from "angular"
import _ from "lodash"

describe("DialogGlobalSettingsController", () => {
	let dialogGlobalSettingsController: DialogGlobalSettingsController
	let $mdDialog
	let settingsService: SettingsService
	let $rootScope: IRootScopeService
	let settings: Settings

	beforeEach(() => {
		restartSystem()
		withMockedSettingsService()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.dialog")

		$mdDialog = getService("$mdDialog")
		settingsService = getService<SettingsService>("settingsService")
		$rootScope = getService<IRootScopeService>("$rootScope")

		settings = _.cloneDeep(DEFAULT_SETTINGS)
	}

	function rebuildController() {
		dialogGlobalSettingsController = new DialogGlobalSettingsController($mdDialog, $rootScope, settingsService)
	}

	function withMockedSettingsService(mockSettings: Settings = settings) {
		settingsService = jest.fn<SettingsService>(() => {
			return {
				getSettings: jest.fn().mockReturnValue(mockSettings)
			}
		})()
	}

	describe("constructor", () => {
		it("should subscribe to SettingsService Events", () => {
			SettingsService.subscribe = jest.fn()

			rebuildController()

			expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, dialogGlobalSettingsController)
		})
	})

	describe("updateSettingsFields", () => {
		it("should update viewModel.hideFlatBuildings with appSettings", () => {
			dialogGlobalSettingsController["_viewModel"] = { hideFlatBuildings: null } as any
			settings.appSettings.hideFlatBuildings = false

			dialogGlobalSettingsController.updateSettingsFields(settings)

			expect(dialogGlobalSettingsController["_viewModel"].hideFlatBuildings).toBeFalsy()
		})

		it("should update viewModel.isWhiteBackground with appSettings", () => {
			dialogGlobalSettingsController["_viewModel"] = { isWhiteBackground: null } as any
			settings.appSettings.isWhiteBackground = true

			dialogGlobalSettingsController.updateSettingsFields(settings)

			expect(dialogGlobalSettingsController["_viewModel"].isWhiteBackground).toBeTruthy()
		})

		it("should update viewModel.resetCameraIfNewFileIsLoaded with appSettings", () => {
			dialogGlobalSettingsController["_viewModel"] = { resetCameraIfNewFileIsLoaded: null } as any
			settings.appSettings.resetCameraIfNewFileIsLoaded = false

			dialogGlobalSettingsController.updateSettingsFields(settings)

			expect(dialogGlobalSettingsController["_viewModel"].resetCameraIfNewFileIsLoaded).toBeFalsy()
		})
	})

	describe("applySettings", () => {
		it("should call settingsService.updateSettings", () => {
			settingsService.updateSettings = jest.fn()
			const viewModel = { hideFlatBuildings: false, resetCameraIfNewFileIsLoaded: false }
			dialogGlobalSettingsController["_viewModel"] = viewModel as any

			dialogGlobalSettingsController.applySettings()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ appSettings: viewModel })
		})
	})

	describe("hide", () => {
		it("should call $mdDialog.hide", () => {
			$mdDialog.hide = jest.fn()

			dialogGlobalSettingsController.hide()

			expect($mdDialog.hide).toHaveBeenCalled()
		})
	})
})
