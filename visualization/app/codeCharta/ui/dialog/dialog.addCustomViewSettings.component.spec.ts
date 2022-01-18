import "./dialog.module.ts"
import { StoreService } from "../../state/store.service"
import { DialogAddCustomViewSettingsComponent } from "./dialog.addCustomViewSettings.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { FilesService } from "../../state/store/files/files.service"
import { setFiles } from "../../state/store/files/files.actions"
import { FILE_STATES } from "../../util/dataMocks"
import { CustomViewHelper } from "../../util/customViewHelper"
import * as CustomViewBuilder from "../../util/customViewBuilder"
import { CustomView } from "../../model/customView/customView.api.model"
import { DialogService } from "./dialog.service"

describe("DialogAddScenarioSettingsComponent", () => {
	let dialogAddCustomViewSettings: DialogAddCustomViewSettingsComponent
	let $mdDialog
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let dialogService: DialogService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function rebuildController() {
		dialogAddCustomViewSettings = new DialogAddCustomViewSettingsComponent($rootScope, $mdDialog, storeService, dialogService)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.dialog")

		$mdDialog = getService("$mdDialog")
		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		dialogService = getService<DialogService>("dialogService")

		storeService.dispatch(setFiles(FILE_STATES))
	}

	describe("constructor", () => {
		it("should subscribe to FilesService to get currently selected CC file name", () => {
			FilesService.subscribe = jest.fn()

			rebuildController()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, dialogAddCustomViewSettings)
		})
	})

	describe("onFilesSelectionChanged", () => {
		it("event handler should register new name of selected map file", () => {
			dialogAddCustomViewSettings.onFilesSelectionChanged(FILE_STATES)
			expect(dialogAddCustomViewSettings["_viewModel"].customViewName).toBe("fileA #1")
		})
	})

	describe("hide", () => {
		it("should hide dialog properly", () => {
			$mdDialog.hide = jest.fn()

			dialogAddCustomViewSettings.hide()

			expect($mdDialog.hide).toHaveBeenCalled()
		})
	})

	describe("addCustomView", () => {
		it("should create CustomView object and add it", () => {
			// @ts-ignore
			CustomViewBuilder.buildCustomViewFromState = jest.fn()
			CustomViewHelper.addCustomView = jest.fn()
			$mdDialog.hide = jest.fn()

			dialogAddCustomViewSettings["_viewModel"].customViewName = "mockedConfigName"
			dialogAddCustomViewSettings.addCustomView()

			expect(CustomViewBuilder.buildCustomViewFromState).toHaveBeenCalledWith("mockedConfigName", storeService.getState())
			expect($mdDialog.hide).toHaveBeenCalled()
		})
	})

	describe("validateCustomViewName", () => {
		it("should clear info message, ifcustom view is valid to be added", () => {
			CustomViewHelper.hasCustomViewByName = jest.fn().mockReturnValue(false)

			dialogAddCustomViewSettings["_viewModel"].addErrorMessage = "to_be_cleared"
			dialogAddCustomViewSettings.validateCustomViewName()

			expect(dialogAddCustomViewSettings["_viewModel"].addErrorMessage).toBe("")
		})

		it("should set warning message, if acustom view with the same name already exists", () => {
			CustomViewHelper.hasCustomViewByName = jest.fn().mockReturnValue(true)

			dialogAddCustomViewSettings.validateCustomViewName()

			expect(dialogAddCustomViewSettings["_viewModel"].addErrorMessage).toContain("already exists")
		})
	})

	describe("purgeOldViews", () => {
		it("should trigger deletion if purgeable Views are available otherwise not", () => {
			CustomViewHelper.deleteCustomViews = jest.fn()

			dialogAddCustomViewSettings["purgeableViews"].clear()

			dialogAddCustomViewSettings.purgeOldViews()
			expect(CustomViewHelper.deleteCustomViews).not.toHaveBeenCalled()

			const purgableView = {
				id: "invalid-md5-checksum-id",
				name: "this-one-should-be-purged"
			} as CustomView

			dialogAddCustomViewSettings["purgeableViews"].add(purgableView)

			dialogAddCustomViewSettings.purgeOldViews()
			expect(CustomViewHelper.deleteCustomViews).toHaveBeenCalled()
		})
	})

	describe("downloadAndCollectPurgeableOldViews", () => {
		it("should not trigger the download if no Custom Views could be found to be downloaded", () => {
			CustomViewHelper.downloadCustomViews = jest.fn()
			CustomViewHelper.getCustomViews = jest.fn().mockReturnValue(new Map())

			const clearedView = {
				id: "invalid-md5-checksum-id",
				name: "this-one-should-be-cleared-before-starting-the-collect"
			} as CustomView

			dialogAddCustomViewSettings["purgeableViews"].add(clearedView)
			dialogAddCustomViewSettings.downloadAndCollectPurgeableOldViews()

			expect(CustomViewHelper.downloadCustomViews).not.toHaveBeenCalled()
		})

		it("should download 6 month oldcustom views", () => {
			CustomViewHelper.downloadCustomViews = jest.fn()

			const monthInMs = 30 * 24 * 60 * 60 * 1000

			const sevenMonthOldCustomView = {
				id: "invalid-md5-checksum-id-7-month",
				name: "this-one-should-be-cleared",
				creationTime: Date.now() - 7 * monthInMs
			} as CustomView

			const fourMonthOldCustomView = {
				id: "invalid-md5-checksum-id-four-month",
				name: "this-one-should-NOT-be-cleared",
				creationTime: Date.now() - 4 * monthInMs
			} as CustomView

			const newlyCreatedCustomView = {
				id: "invalid-md5-checksum-id-newly",
				name: "missingCreationTimePropertyWillBeAddedInRuntime"
			} as CustomView

			const customViewsToDownload: Map<string, CustomView> = new Map()
			customViewsToDownload.set(sevenMonthOldCustomView.id, sevenMonthOldCustomView)
			customViewsToDownload.set(fourMonthOldCustomView.id, fourMonthOldCustomView)
			customViewsToDownload.set(newlyCreatedCustomView.id, newlyCreatedCustomView)

			CustomViewHelper.getCustomViews = jest.fn().mockReturnValue(customViewsToDownload)

			dialogAddCustomViewSettings.downloadAndCollectPurgeableOldViews()

			expect(CustomViewHelper.downloadCustomViews).toHaveBeenCalled()
			expect(dialogAddCustomViewSettings["purgeableViews"].size).toBe(1)
			expect(dialogAddCustomViewSettings["purgeableViews"].values().next().value.id).toBe("invalid-md5-checksum-id-7-month")
		})
	})

	describe("isNewCustomViewValid", () => {
		it("should return true for not emptycustom view names and empty warning message", () => {
			dialogAddCustomViewSettings["_viewModel"].addErrorMessage = ""
			dialogAddCustomViewSettings["_viewModel"].customViewName = "some valid name here"

			expect(dialogAddCustomViewSettings.isNewCustomViewValid()).toBe(true)
		})

		it("should return false for emptycustom view names or given warning message", () => {
			dialogAddCustomViewSettings["_viewModel"].customViewName = ""
			expect(dialogAddCustomViewSettings.isNewCustomViewValid()).toBe(false)

			dialogAddCustomViewSettings["_viewModel"].customViewName = "Valid custom view name."
			dialogAddCustomViewSettings["_viewModel"].addErrorMessage = "warning message is set"
			expect(dialogAddCustomViewSettings.isNewCustomViewValid()).toBe(false)
		})
	})

	describe("validateLocalStorageSize", () => {
		it("should return true for not emptycustom view names and empty warning message", () => {
			localStorage.clear()
			dialogAddCustomViewSettings["_viewModel"].localStorageSizeWarningMessage = ""

			// Per default the localStorage has an overhead of 3KB
			dialogAddCustomViewSettings["customLocalStorageLimitInKB"] = 3

			// local Storage limit is not exceeded yet
			dialogAddCustomViewSettings.validateLocalStorageSize()
			expect(dialogAddCustomViewSettings["_viewModel"].localStorageSizeWarningMessage.length).toBe(0)

			// Add some more bytes to be bigger than the limit of 3KB
			localStorage.setItem("4444", "2222")

			dialogAddCustomViewSettings.validateLocalStorageSize()
			expect(dialogAddCustomViewSettings["_viewModel"].localStorageSizeWarningMessage).toContain("purge old unused Views")
		})
	})
})
