import "./dialog.module"
import "../codeMap/codeMap.module"
import { DialogGlobalSettingsController } from "./dialog.globalSettings.component"
import { SettingsService } from "../../state/settingsService/settings.service"
import { Settings } from "../../codeCharta.model"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { DEFAULT_SETTINGS } from "../../util/dataMocks"
import { IRootScopeService } from "angular"
import _ from "lodash"
import { StoreService } from "../../state/store.service"

describe("DialogGlobalSettingsController", () => {
	let dialogGlobalSettingsController: DialogGlobalSettingsController
	let $mdDialog
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let settingsService: SettingsService
	let settings: Settings

	beforeEach(() => {
		restartSystem()
		withMockedSettingsService()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.dialog")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$mdDialog = getService("$mdDialog")
		settingsService = getService<SettingsService>("settingsService")
		storeService = getService<StoreService>("storeService")

		settings = _.cloneDeep(DEFAULT_SETTINGS)
	}

	function rebuildController() {
		dialogGlobalSettingsController = new DialogGlobalSettingsController($mdDialog, $rootScope, storeService, settingsService)
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

		it("should call updateSettingsFields", () => {
			jest.spyOn(DialogGlobalSettingsController.prototype as any, "updateSettingsFields")

			rebuildController()

			expect(dialogGlobalSettingsController["updateSettingsFields"]).toHaveBeenCalled()
		})
	})

	describe("updateSettingsFields", () => {
		it("should update viewModel.hideFlatBuildings with appSettings", () => {
			settings.appSettings.hideFlatBuildings = false

			dialogGlobalSettingsController["updateSettingsFields"](settings)

			expect(dialogGlobalSettingsController["_viewModel"].hideFlatBuildings).toBeFalsy()
		})

		it("should update viewModel.isWhiteBackground with appSettings", () => {
			settings.appSettings.isWhiteBackground = true

			dialogGlobalSettingsController["updateSettingsFields"](settings)

			expect(dialogGlobalSettingsController["_viewModel"].isWhiteBackground).toBeTruthy()
		})

		it("should update viewModel.resetCameraIfNewFileIsLoaded with appSettings", () => {
			settings.appSettings.resetCameraIfNewFileIsLoaded = false

			dialogGlobalSettingsController["updateSettingsFields"](settings)

			expect(dialogGlobalSettingsController["_viewModel"].resetCameraIfNewFileIsLoaded).toBeFalsy()
		})
	})

	describe("applySettingsHideFlatBuildings", () => {
		it("should call settingsService.updateSettings", () => {
			settingsService.updateSettings = jest.fn()
			dialogGlobalSettingsController["_viewModel"].hideFlatBuildings = false

			dialogGlobalSettingsController.applySettingsHideFlatBuildings()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ appSettings: { hideFlatBuildings: false } })
			expect(storeService.getState().appSettings.hideFlatBuildings).toBeFalsy()
		})
	})

	describe("applySettingsResetCamera", () => {
		it("should call settingsService.updateSettings", () => {
			settingsService.updateSettings = jest.fn()
			dialogGlobalSettingsController["_viewModel"].resetCameraIfNewFileIsLoaded = false

			dialogGlobalSettingsController.applySettingsResetCamera()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ appSettings: { resetCameraIfNewFileIsLoaded: false } })
			expect(storeService.getState().appSettings.resetCameraIfNewFileIsLoaded).toBeFalsy()
		})
	})

	describe("applySettingsIsWhiteBackground", () => {
		it("should call settingsService.updateSettings", () => {
			settingsService.updateSettings = jest.fn()
			dialogGlobalSettingsController["_viewModel"].isWhiteBackground = false

			dialogGlobalSettingsController.applySettingsIsWhiteBackground()

			expect(settingsService.updateSettings).toHaveBeenCalledWith({ appSettings: { isWhiteBackground: false } })
			expect(storeService.getState().appSettings.isWhiteBackground).toBeFalsy()
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
