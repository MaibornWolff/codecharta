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

		it("should subscribe to ResetCameraIfNewFileIsLoadedService", () => {
			ResetCameraIfNewFileIsLoadedService.subscribe = jest.fn()

			rebuildController()

			expect(ResetCameraIfNewFileIsLoadedService.subscribe).toHaveBeenCalledWith($rootScope, dialogGlobalSettingsController)
		})

		it("should call initDialogOnClick", () => {
			jest.spyOn(DialogGlobalSettingsController.prototype as any, "initDialogOnClick")

			rebuildController()

			expect(dialogGlobalSettingsController["initDialogOnClick"]).toHaveBeenCalled()
		})
	})

	describe("initDialogOnClick", () => {
		it("should update viewModel.hideFlatBuildings", () => {
			storeService.dispatch(setHideFlatBuildings(false))

			dialogGlobalSettingsController["initDialogOnClick"]()

			expect(dialogGlobalSettingsController["_viewModel"].hideFlatBuildings).toBeFalsy()
		})

		it("should update viewModel.isWhiteBackground", () => {
			storeService.dispatch(setIsWhiteBackground(true))

			dialogGlobalSettingsController["initDialogOnClick"]()

			expect(dialogGlobalSettingsController["_viewModel"].isWhiteBackground).toBeTruthy()
		})

		it("should update viewModel.resetCameraIfNewFileIsLoaded", () => {
			storeService.dispatch(setResetCameraIfNewFileIsLoaded(false))

			dialogGlobalSettingsController["initDialogOnClick"]()

			expect(dialogGlobalSettingsController["_viewModel"].resetCameraIfNewFileIsLoaded).toBeFalsy()
		})
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

	describe("onResetCameraIfNewFileIsLoadedChanged", () => {
		it("should update viewModel.resetCameraIfNewFileIsLoaded", () => {
			dialogGlobalSettingsController.onResetCameraIfNewFileIsLoadedChanged(false)

			expect(dialogGlobalSettingsController["_viewModel"].resetCameraIfNewFileIsLoaded).toBeFalsy()
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

	describe("hide", () => {
		it("should call $mdDialog.hide", () => {
			$mdDialog.hide = jest.fn()

			dialogGlobalSettingsController.hide()

			expect($mdDialog.hide).toHaveBeenCalled()
		})
	})
})
