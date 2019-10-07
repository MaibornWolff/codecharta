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

	function setEmptyViewModel() {
		dialogGlobalSettingsController["_viewModel"] = {
			hideFlatBuildings: null,
			maximizeDetailPanel: null,
			isWhiteBackground: null,
			resetCameraIfNewFileIsLoaded: null
		}
	}

	describe("constructor", () => {
		it("should subscribe to SettingsService Events", () => {
			SettingsService.subscribe = jest.fn()

			rebuildController()

			expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, dialogGlobalSettingsController)
		})

		it("should call updateSettingsFields", () => {
			jest.spyOn(DialogGlobalSettingsController.prototype as any, "updateSettingsFields")

			rebuildController()

			expect(dialogGlobalSettingsController["updateSettingsFields"]).toHaveBeenCalled()
		})
	})

	describe("updateSettingsFields", () => {
		it("should update viewModel.hideFlatBuildings with appSettings", () => {
			setEmptyViewModel()
			settings.appSettings.hideFlatBuildings = false

			dialogGlobalSettingsController["updateSettingsFields"](settings)

			expect(dialogGlobalSettingsController["_viewModel"].hideFlatBuildings).toBeFalsy()
		})

		it("should update viewModel.isWhiteBackground with appSettings", () => {
			setEmptyViewModel()
			settings.appSettings.isWhiteBackground = true

			dialogGlobalSettingsController["updateSettingsFields"](settings)

			expect(dialogGlobalSettingsController["_viewModel"].isWhiteBackground).toBeTruthy()
		})

		it("should update viewModel.resetCameraIfNewFileIsLoaded with appSettings", () => {
			setEmptyViewModel()
			settings.appSettings.resetCameraIfNewFileIsLoaded = false

			dialogGlobalSettingsController["updateSettingsFields"](settings)

			expect(dialogGlobalSettingsController["_viewModel"].resetCameraIfNewFileIsLoaded).toBeFalsy()
		})
	})

	describe("applySettings", () => {
		it("should call settingsService.updateSettings", () => {
			settingsService.updateSettings = jest.fn()
			setEmptyViewModel()
			dialogGlobalSettingsController["_viewModel"].hideFlatBuildings = false
			dialogGlobalSettingsController["_viewModel"].resetCameraIfNewFileIsLoaded = false

			dialogGlobalSettingsController.applySettings()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ appSettings: dialogGlobalSettingsController["_viewModel"] })
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
