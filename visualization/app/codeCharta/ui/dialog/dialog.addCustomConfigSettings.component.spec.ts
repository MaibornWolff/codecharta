import "./dialog.module.ts"
import { StoreService } from "../../state/store.service"
import { DialogAddCustomConfigSettingsComponent } from "./dialog.addCustomConfigSettings.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { FilesService } from "../../state/store/files/files.service"
import { setFiles } from "../../state/store/files/files.actions"
import { FILE_STATES } from "../../util/dataMocks"
import { CustomConfigHelper } from "../../util/customConfigHelper"
import * as CustomConfigBuilder from "../../util/customConfigBuilder"
import { CustomConfig } from "../../model/customConfig/customConfig.api.model"
import { DialogService } from "./dialog.service"

describe("DialogAddScenarioSettingsComponent", () => {
	let dialogAddCustomConfigSettings: DialogAddCustomConfigSettingsComponent
	let $mdDialog
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let dialogService: DialogService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function rebuildController() {
		dialogAddCustomConfigSettings = new DialogAddCustomConfigSettingsComponent($rootScope, $mdDialog, storeService, dialogService)
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

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, dialogAddCustomConfigSettings)
		})
	})

	describe("onFilesSelectionChanged", () => {
		it("event handler should register new name of selected map file", () => {
			dialogAddCustomConfigSettings.onFilesSelectionChanged(FILE_STATES)
			expect(dialogAddCustomConfigSettings["_viewModel"].customConfigName).toBe("fileA #1")
		})
	})

	describe("hide", () => {
		it("should hide dialog properly", () => {
			$mdDialog.hide = jest.fn()

			dialogAddCustomConfigSettings.hide()

			expect($mdDialog.hide).toHaveBeenCalled()
		})
	})

	describe("addCustomConfig", () => {
		it("should create CustomConfig object and add it", () => {
			// @ts-ignore
			CustomConfigBuilder.buildCustomConfigFromState = jest.fn()
			CustomConfigHelper.addCustomConfig = jest.fn()
			$mdDialog.hide = jest.fn()

			dialogAddCustomConfigSettings["_viewModel"].customConfigName = "mockedConfigName"
			dialogAddCustomConfigSettings.addCustomConfig()

			expect(CustomConfigBuilder.buildCustomConfigFromState).toHaveBeenCalledWith("mockedConfigName", storeService.getState())
			expect($mdDialog.hide).toHaveBeenCalled()
		})
	})

	describe("validateCustomConfigName", () => {
		it("should clear info message, if config is valid to be added", () => {
			CustomConfigHelper.hasCustomConfigByName = jest.fn().mockReturnValue(false)

			dialogAddCustomConfigSettings["_viewModel"].addErrorMessage = "to_be_cleared"
			dialogAddCustomConfigSettings.validateCustomConfigName()

			expect(dialogAddCustomConfigSettings["_viewModel"].addErrorMessage).toBe("")
		})

		it("should set warning message, if a config with the same name already exists", () => {
			CustomConfigHelper.hasCustomConfigByName = jest.fn().mockReturnValue(true)

			dialogAddCustomConfigSettings.validateCustomConfigName()

			expect(dialogAddCustomConfigSettings["_viewModel"].addErrorMessage).toContain("already exists")
		})
	})

	describe("purgeOldConfigs", () => {
		it("should trigger deletion if purgeableConfigs are available otherwise not", () => {
			CustomConfigHelper.deleteCustomConfigs = jest.fn()

			dialogAddCustomConfigSettings["purgeableConfigs"].clear()

			dialogAddCustomConfigSettings.purgeOldConfigs()
			expect(CustomConfigHelper.deleteCustomConfigs).not.toHaveBeenCalled()

			const purgableConfig = {
				id: "invalid-md5-checksum-id",
				name: "this-one-should-be-purged"
			} as CustomConfig

			dialogAddCustomConfigSettings["purgeableConfigs"].add(purgableConfig)

			dialogAddCustomConfigSettings.purgeOldConfigs()
			expect(CustomConfigHelper.deleteCustomConfigs).toHaveBeenCalled()
		})
	})

	describe("downloadAndCollectPurgeableOldConfigs", () => {
		it("should not trigger the download if no customConfigs could be found to be downloaded", () => {
			CustomConfigHelper.downloadCustomConfigs = jest.fn()
			CustomConfigHelper.getCustomConfigs = jest.fn().mockReturnValue(new Map())

			const clearedConfig = {
				id: "invalid-md5-checksum-id",
				name: "this-one-should-be-cleared-before-starting-the-collect"
			} as CustomConfig

			dialogAddCustomConfigSettings["purgeableConfigs"].add(clearedConfig)
			dialogAddCustomConfigSettings.downloadAndCollectPurgeableOldConfigs()

			expect(CustomConfigHelper.downloadCustomConfigs).not.toHaveBeenCalled()
		})

		it("should download 6 month old configs", () => {
			CustomConfigHelper.downloadCustomConfigs = jest.fn()

			const monthInMs = 30 * 24 * 60 * 60 * 1000

			const sevenMonthOldConfig = {
				id: "invalid-md5-checksum-id-7-month",
				name: "this-one-should-be-cleared",
				creationTime: Date.now() - 7 * monthInMs
			} as CustomConfig

			const fourMonthOldConfig = {
				id: "invalid-md5-checksum-id-four-month",
				name: "this-one-should-NOT-be-cleared",
				creationTime: Date.now() - 4 * monthInMs
			} as CustomConfig

			const newlyCreatedConfig = {
				id: "invalid-md5-checksum-id-newly",
				name: "missingCreationTimePropertyWillBeAddedInRuntime"
			} as CustomConfig

			const configsToDownload: Map<string, CustomConfig> = new Map()
			configsToDownload.set(sevenMonthOldConfig.id, sevenMonthOldConfig)
			configsToDownload.set(fourMonthOldConfig.id, fourMonthOldConfig)
			configsToDownload.set(newlyCreatedConfig.id, newlyCreatedConfig)

			CustomConfigHelper.getCustomConfigs = jest.fn().mockReturnValue(configsToDownload)

			dialogAddCustomConfigSettings.downloadAndCollectPurgeableOldConfigs()

			expect(CustomConfigHelper.downloadCustomConfigs).toHaveBeenCalled()
			expect(dialogAddCustomConfigSettings["purgeableConfigs"].size).toBe(1)
			expect(dialogAddCustomConfigSettings["purgeableConfigs"].values().next().value.id).toBe("invalid-md5-checksum-id-7-month")
		})
	})

	describe("isNewCustomConfigValid", () => {
		it("should return true for not empty config names and empty warning message", () => {
			dialogAddCustomConfigSettings["_viewModel"].addErrorMessage = ""
			dialogAddCustomConfigSettings["_viewModel"].customConfigName = "some valid name here"

			expect(dialogAddCustomConfigSettings.isNewCustomConfigValid()).toBe(true)
		})

		it("should return false for empty config names or given warning message", () => {
			dialogAddCustomConfigSettings["_viewModel"].customConfigName = ""
			expect(dialogAddCustomConfigSettings.isNewCustomConfigValid()).toBe(false)

			dialogAddCustomConfigSettings["_viewModel"].customConfigName = "Valid custom config name."
			dialogAddCustomConfigSettings["_viewModel"].addErrorMessage = "warning message is set"
			expect(dialogAddCustomConfigSettings.isNewCustomConfigValid()).toBe(false)
		})
	})

	describe("validateLocalStorageSize", () => {
		it("should return true for not empty config names and empty warning message", () => {
			localStorage.clear()
			dialogAddCustomConfigSettings["_viewModel"].localStorageSizeWarningMessage = ""

			// Per default the localStorage has an overhead of 3KB
			dialogAddCustomConfigSettings["customLocalStorageLimitInKB"] = 3

			// local Storage limit is not exceeded yet
			dialogAddCustomConfigSettings.validateLocalStorageSize()
			expect(dialogAddCustomConfigSettings["_viewModel"].localStorageSizeWarningMessage.length).toBe(0)

			// Add some more bytes to be bigger than the limit of 3KB
			localStorage.setItem("4444", "2222")

			dialogAddCustomConfigSettings.validateLocalStorageSize()
			expect(dialogAddCustomConfigSettings["_viewModel"].localStorageSizeWarningMessage).toContain("purge old unused Configs")
		})
	})
})
