import "./dialog.module"
import "../codeMap/codeMap.module"
import { DialogGlobalSettingsController } from "./dialog.globalSettings.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { setHideFlatBuildings } from "../../state/store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"
import { setIsWhiteBackground } from "../../state/store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { setResetCameraIfNewFileIsLoaded } from "../../state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { HideFlatBuildingsService } from "../../state/store/appSettings/hideFlatBuildings/hideFlatBuildings.service"
import { IsWhiteBackgroundService } from "../../state/store/appSettings/isWhiteBackground/isWhiteBackground.service"
import { ResetCameraIfNewFileIsLoadedService } from "../../state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.service"
import { ExperimentalFeaturesEnabledService } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import { setExperimentalFeaturesEnabled } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { LayoutAlgorithm, SharpnessMode } from "../../codeCharta.model"
import { ClipboardEnabledService } from "../../state/store/appSettings/enableClipboard/clipboardEnabled.service"
import { setClipboardEnabled } from "../../state/store/appSettings/enableClipboard/clipboardEnabled.actions"

describe("DialogGlobalSettingsController", () => {
	let dialogGlobalSettingsController: DialogGlobalSettingsController
	let $mdDialog
	let $rootScope: IRootScopeService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.dialog")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$mdDialog = getService("$mdDialog")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		dialogGlobalSettingsController = new DialogGlobalSettingsController($mdDialog, $rootScope, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to HideFlatBuildingsService", () => {
			HideFlatBuildingsService.subscribe = jest.fn()

			rebuildController()

			expect(HideFlatBuildingsService.subscribe).toHaveBeenCalledWith($rootScope, dialogGlobalSettingsController)
		})

		it("should subscribe to IsWhiteBackgroundService", () => {
			IsWhiteBackgroundService.subscribe = jest.fn()

			rebuildController()

			expect(IsWhiteBackgroundService.subscribe).toHaveBeenCalledWith($rootScope, dialogGlobalSettingsController)
		})

		it("should subscribe to clipboardEnabled", () => {
			ClipboardEnabledService.subscribe = jest.fn()

			rebuildController()

			expect(ClipboardEnabledService.subscribe).toHaveBeenCalledWith($rootScope, dialogGlobalSettingsController)
		})

		it("should subscribe to ResetCameraIfNewFileIsLoadedService", () => {
			ResetCameraIfNewFileIsLoadedService.subscribe = jest.fn()

			rebuildController()

			expect(ResetCameraIfNewFileIsLoadedService.subscribe).toHaveBeenCalledWith($rootScope, dialogGlobalSettingsController)
		})

		it("should subscribe to ExperimentalFeaturesEnabledService", () => {
			ExperimentalFeaturesEnabledService.subscribe = jest.fn()

			rebuildController()

			expect(ExperimentalFeaturesEnabledService.subscribe).toHaveBeenCalledWith($rootScope, dialogGlobalSettingsController)
		})

		for (const setting of [true, false]) {
			it(`should update viewModel.hideFlatBuildings to ${setting}`, () => {
				storeService.dispatch(setHideFlatBuildings(setting))

				rebuildController()

				expect(dialogGlobalSettingsController["_viewModel"].hideFlatBuildings).toBe(setting)
			})

			it(`should update viewModel.isWhiteBackground to ${setting}`, () => {
				storeService.dispatch(setIsWhiteBackground(setting))

				rebuildController()

				expect(dialogGlobalSettingsController["_viewModel"].isWhiteBackground).toBe(setting)
			})

			it(`should update viewModel.isWhiteBackground to ${setting}`, () => {
				storeService.dispatch(setClipboardEnabled(setting))

				rebuildController()

				expect(dialogGlobalSettingsController["_viewModel"].clipboardEnabled).toBe(setting)
			})

			it(`should update viewModel.resetCameraIfNewFileIsLoaded to ${setting}`, () => {
				storeService.dispatch(setResetCameraIfNewFileIsLoaded(setting))

				rebuildController()

				expect(dialogGlobalSettingsController["_viewModel"].resetCameraIfNewFileIsLoaded).toBe(setting)
			})

			it(`should update viewModel.experimentalFeaturesEnabled to ${setting}`, () => {
				storeService.dispatch(setExperimentalFeaturesEnabled(setting))

				rebuildController()

				expect(dialogGlobalSettingsController["_viewModel"].experimentalFeaturesEnabled).toBe(setting)
			})
		}
	})

	describe("onHideFlatBuildingsChanged", () => {
		it("should update viewModel.hideFlatBuildings", () => {
			dialogGlobalSettingsController.onHideFlatBuildingsChanged(false)

			expect(dialogGlobalSettingsController["_viewModel"].hideFlatBuildings).toBeFalsy()
		})
	})

	describe("onIsWhiteBackgroundChanged", () => {
		it("should update viewModel.isWhiteBackground", () => {
			dialogGlobalSettingsController.onIsWhiteBackgroundChanged(true)

			expect(dialogGlobalSettingsController["_viewModel"].isWhiteBackground).toBeTruthy()
		})
	})

	describe("onClipboardEnabledChanged", () => {
		it("should update viewModel.clipboardEnabled", () => {
			dialogGlobalSettingsController.onClipboardEnabledChanged(true)

			expect(dialogGlobalSettingsController["_viewModel"].clipboardEnabled).toBeTruthy()
		})
	})

	describe("onResetCameraIfNewFileIsLoadedChanged", () => {
		it("should update viewModel.resetCameraIfNewFileIsLoaded", () => {
			dialogGlobalSettingsController.onResetCameraIfNewFileIsLoadedChanged(false)

			expect(dialogGlobalSettingsController["_viewModel"].resetCameraIfNewFileIsLoaded).toBeFalsy()
		})
	})

	describe("onExperimentalFeaturesEnabledChanged", () => {
		it("should update viewModel.experimentalFeaturesEnabled", () => {
			dialogGlobalSettingsController.onExperimentalFeaturesEnabledChanged(true)

			expect(dialogGlobalSettingsController["_viewModel"].experimentalFeaturesEnabled).toBe(true)
		})
	})

	describe("applySettingsHideFlatBuildings", () => {
		it("should update hideFlatBuildings in store", () => {
			dialogGlobalSettingsController["_viewModel"].hideFlatBuildings = false

			dialogGlobalSettingsController.applySettingsHideFlatBuildings()

			expect(storeService.getState().appSettings.hideFlatBuildings).toBeFalsy()
		})
	})

	describe("applySettingsResetCamera", () => {
		it("should update resetCameraIfNewFileIsLoaded in store", () => {
			dialogGlobalSettingsController["_viewModel"].resetCameraIfNewFileIsLoaded = false

			dialogGlobalSettingsController.applySettingsResetCamera()

			expect(storeService.getState().appSettings.resetCameraIfNewFileIsLoaded).toBeFalsy()
		})
	})

	describe("applySettingsIsWhiteBackground", () => {
		it("should update isWhiteBackground in store", () => {
			dialogGlobalSettingsController["_viewModel"].isWhiteBackground = false

			dialogGlobalSettingsController.applySettingsIsWhiteBackground()

			expect(storeService.getState().appSettings.isWhiteBackground).toBeFalsy()
		})
	})

	describe("applySettingsClipboardEnabled", () => {
		it("should update clipboardEnabled in store", () => {
			dialogGlobalSettingsController["_viewModel"].clipboardEnabled = false

			dialogGlobalSettingsController.applySettingsIsWhiteBackground()

			expect(storeService.getState().appSettings.clipboardEnabled).toBeFalsy()
		})
	})

	describe("applyExperimentalFeaturesEnabled", () => {
		it("should update experimentalFeaturesEnabled in store", () => {
			dialogGlobalSettingsController["_viewModel"].experimentalFeaturesEnabled = false

			dialogGlobalSettingsController.applySettingsEnableExperimentalFeatures()

			expect(storeService.getState().appSettings.experimentalFeaturesEnabled).toBe(false)
		})
	})

	describe("applySettingsAlgorithm", () => {
		it("should update layoutAlgorithm in store", () => {
			dialogGlobalSettingsController["_viewModel"].layoutAlgorithm = LayoutAlgorithm.TreeMapStreet

			dialogGlobalSettingsController.applySettingsAlgorithm()

			expect(storeService.getState().appSettings.layoutAlgorithm).toBe(LayoutAlgorithm.TreeMapStreet)
		})
	})

	describe("applySettingsMaxTreeMapFiles", () => {
		it("should update max treemap file number in store", () => {
			dialogGlobalSettingsController["_viewModel"].maxTreeMapFiles = 10

			dialogGlobalSettingsController.applySettingsMaxTreeMapFiles()

			expect(storeService.getState().appSettings.maxTreeMapFiles).toBe(10)
		})
	})

	describe("applySettingsSharpnessMode", () => {
		it("should update sharpness mode in store", () => {
			dialogGlobalSettingsController["_viewModel"].sharpnessMode = SharpnessMode.PixelRatioFXAA

			dialogGlobalSettingsController.applySettingsSharpnessMode()

			expect(storeService.getState().appSettings.sharpnessMode).toBe(SharpnessMode.PixelRatioFXAA)
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
