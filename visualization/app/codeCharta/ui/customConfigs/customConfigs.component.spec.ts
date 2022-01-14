import "./customConfigs.module"
import "../codeMap/threeViewer/threeViewer.module"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { StoreService } from "../../state/store.service"
import { DialogService } from "../dialog/dialog.service"
import { CUSTOM_CONFIG_ITEM_GROUPS, FILE_STATES } from "../../util/dataMocks"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { CustomConfigsController } from "./customConfigs.component"
import { FilesService } from "../../state/store/files/files.service"
import { setFiles } from "../../state/store/files/files.actions"
import { CustomConfigHelper } from "../../util/customConfigHelper"
import { setState } from "../../state/store/state.actions"
import { CustomConfig, ExportCustomConfig } from "../../model/customConfig/customConfig.api.model"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"
import { klona } from "klona"

describe("CustomConfigsController", () => {
	let customConfigsController: CustomConfigsController
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let dialogService: DialogService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let threeCameraService: ThreeCameraService

	function rebuildController() {
		customConfigsController = new CustomConfigsController(
			$rootScope,
			storeService,
			dialogService,
			threeOrbitControlsService,
			threeCameraService
		)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.customConfigs")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		dialogService = getService<DialogService>("dialogService")
		threeOrbitControlsService = getService<ThreeOrbitControlsService>("threeOrbitControlsService")
		threeCameraService = getService<ThreeCameraService>("threeCameraService")

		storeService.dispatch(setFiles(FILE_STATES))
	}

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	describe("constructor", () => {
		it("should subscribe to FilesService to get currently selected CC file name", () => {
			FilesService.subscribe = jest.fn()

			rebuildController()

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, customConfigsController)
		})
	})

	describe("onFileSelectionChanged", () => {
		it("should reset CustomConfigFileStateConnector", () => {
			rebuildController()

			customConfigsController.onFilesSelectionChanged(FILE_STATES)

			expect(customConfigsController["customConfigFileStateConnector"].getSelectedMaps()[0]).toBe("fileA")
		})
	})

	describe("initView", () => {
		it("should load CustomConfigs sorted by applicable-state and mode name", () => {
			CustomConfigHelper.getCustomConfigItemGroups = jest.fn().mockReturnValue(CUSTOM_CONFIG_ITEM_GROUPS)
			CustomConfigHelper.getCustomConfigs = jest.fn().mockReturnValue(new Map())

			customConfigsController["_viewModel"].hasDownloadableConfigs = true
			customConfigsController.initView()

			const customConfigItemGroups = customConfigsController["_viewModel"].dropDownCustomConfigItemGroups.values()
			const customConfigItemGroup1 = customConfigItemGroups.next().value
			const customConfigItemGroup2 = customConfigItemGroups.next().value
			const customConfigItemGroup3 = customConfigItemGroups.next().value

			expect(customConfigItemGroup1).toEqual(CUSTOM_CONFIG_ITEM_GROUPS.get("fileAfileBMultiple"))
			expect(customConfigItemGroup2).toEqual(CUSTOM_CONFIG_ITEM_GROUPS.get("fileAfileBDELTA"))
			expect(customConfigItemGroup3).toEqual(CUSTOM_CONFIG_ITEM_GROUPS.get("fileAfileBSINGLE"))
		})

		it("should not find downloadable Configs", () => {
			CustomConfigHelper.getCustomConfigItemGroups = jest.fn().mockReturnValue(new Map())
			CustomConfigHelper.getCustomConfigs = jest.fn().mockReturnValue(new Map())

			// should be set to false
			customConfigsController["_viewModel"].hasDownloadableConfigs = true

			customConfigsController.initView()

			expect(customConfigsController["_viewModel"].hasDownloadableConfigs).toBe(false)
		})
	})

	describe("showAddCustomConfigSettings", () => {
		it("should call showAddCustomConfigSettings", () => {
			dialogService.showAddCustomConfigSettings = jest.fn()

			customConfigsController.showAddCustomConfigSettings()

			expect(dialogService.showAddCustomConfigSettings).toHaveBeenCalled()
		})
	})

	describe("applyCustomConfig", () => {
		it("should call store.dispatch", () => {
			const customConfigStub = {
				stateSettings: {
					dynamicSettings: {
						margin: 1,
						colorRange: { from: 1, to: 2 }
					}
				}
			} as CustomConfig

			CustomConfigHelper.getCustomConfigSettings = jest.fn().mockReturnValue(customConfigStub)
			storeService.dispatch = jest.fn()
			threeOrbitControlsService.setControlTarget = jest.fn()

			customConfigsController.applyCustomConfig("CustomConfig1")

			expect(storeService.dispatch).toHaveBeenCalledWith(setState(customConfigStub.stateSettings))
		})
	})

	describe("removeCustomConfig", () => {
		it("should call deleteCustomConfig", () => {
			CustomConfigHelper.getCustomConfigItemGroups = jest.fn().mockReturnValue(klona(CUSTOM_CONFIG_ITEM_GROUPS))
			CustomConfigHelper.getCustomConfigs = jest.fn().mockReturnValue(new Map())
			customConfigsController.initView()
			CustomConfigHelper.deleteCustomConfig = jest.fn()
			const configIdToRemove = "SINGLEfileASampleMap View #1"

			customConfigsController.removeCustomConfig(configIdToRemove, 0, 0)

			expect(CustomConfigHelper.deleteCustomConfig).toHaveBeenCalledWith(configIdToRemove)
		})

		it("should delete element from customConfigItemGroup in dropDownCustomConfigItemGroups when removing a custom config", () => {
			const testDropDownConfigItemGroup = [klona(CUSTOM_CONFIG_ITEM_GROUPS.get("fileAfileBSINGLE"))]
			const configIdToRemove = "SINGLEfileASampleMap View #1"

			CustomConfigHelper.getCustomConfigItemGroups = jest.fn().mockReturnValue(testDropDownConfigItemGroup)
			CustomConfigHelper.getCustomConfigs = jest.fn().mockReturnValue(new Map())
			customConfigsController.initView()
			CustomConfigHelper.deleteCustomConfig = jest.fn()

			expect(customConfigsController["_viewModel"].dropDownCustomConfigItemGroups).toHaveLength(1)
			expect(customConfigsController["_viewModel"].dropDownCustomConfigItemGroups[0].customConfigItems).toHaveLength(2)
			expect(customConfigsController["_viewModel"].showNonApplicableButton).toBeTruthy()

			customConfigsController.removeCustomConfig(configIdToRemove, 0, 0)

			expect(CustomConfigHelper.deleteCustomConfig).toHaveBeenCalledWith(configIdToRemove)
			expect(customConfigsController["_viewModel"].dropDownCustomConfigItemGroups).toHaveLength(1)
			expect(customConfigsController["_viewModel"].dropDownCustomConfigItemGroups[0].customConfigItems).toHaveLength(1)
			expect(customConfigsController["_viewModel"].showNonApplicableButton).toBeTruthy()
		})

		it("should delete element from dropDownCustomConfigItemGroups when removing a custom config", () => {
			const testDropDownConfigItemGroup = [klona(CUSTOM_CONFIG_ITEM_GROUPS.get("fileAfileBMultiple"))]
			testDropDownConfigItemGroup[0].customConfigItems.pop()
			const configIdToRemove = "MULTIPLEfileESampleMap View #1"

			CustomConfigHelper.getCustomConfigItemGroups = jest.fn().mockReturnValue([testDropDownConfigItemGroup])
			CustomConfigHelper.getCustomConfigItemGroups = jest.fn().mockReturnValue(testDropDownConfigItemGroup)
			CustomConfigHelper.getCustomConfigs = jest.fn().mockReturnValue(new Map())
			customConfigsController.initView()
			CustomConfigHelper.deleteCustomConfig = jest.fn()

			expect(customConfigsController["_viewModel"].dropDownCustomConfigItemGroups).toHaveLength(1)
			expect(customConfigsController["_viewModel"].dropDownCustomConfigItemGroups[0].customConfigItems).toHaveLength(1)
			expect(customConfigsController["_viewModel"].visibleEntries).toBe(1)
			expect(customConfigsController["_viewModel"].showNonApplicableButton).toBeFalsy()

			customConfigsController.removeCustomConfig(configIdToRemove, 0, 0)

			expect(CustomConfigHelper.deleteCustomConfig).toHaveBeenCalledWith(configIdToRemove)
			expect(customConfigsController["_viewModel"].dropDownCustomConfigItemGroups).toHaveLength(0)
			expect(customConfigsController["_viewModel"].visibleEntries).toBe(0)
			expect(customConfigsController["_viewModel"].showNonApplicableButton).toBeFalsy()
		})
	})

	describe("downloadPreloadedCustomConfigs", () => {
		it("should trigger the download if downloadable Configs are available otherwise not", () => {
			CustomConfigHelper.downloadCustomConfigs = jest.fn()

			customConfigsController.downloadPreloadedCustomConfigs()
			expect(CustomConfigHelper.downloadCustomConfigs).not.toHaveBeenCalled()

			const exportConfig1 = {
				id: "1-invalid-md5-checksum",
				name: "config-to-be-exported-1"
			} as ExportCustomConfig

			customConfigsController["downloadableConfigs"].set(exportConfig1.id, exportConfig1)
			customConfigsController.downloadPreloadedCustomConfigs()

			expect(CustomConfigHelper.downloadCustomConfigs).toHaveBeenCalled()
		})
	})

	describe("prefetchDownloadableConfigsForUploadedMaps", () => {
		it("should clear downloadableConfigs and then collect them again", () => {
			const previouslyPrefetchedExportConfig = {
				id: "0-invalid-md5-checksum",
				name: "config-should-be-cleared-1"
			} as ExportCustomConfig

			customConfigsController["downloadableConfigs"].set(previouslyPrefetchedExportConfig.id, previouslyPrefetchedExportConfig)

			const customConfig1 = {
				id: "1-invalid-md5-checksum",
				name: "downloadable-config-1",
				mapChecksum: "md5-fileA"
			} as CustomConfig

			const customConfig2 = {
				id: "2-invalid-md5-checksum",
				name: "downloadable-config-2",
				mapChecksum: "md5-fileA"
			} as CustomConfig

			const customConfig3 = {
				id: "3-invalid-md5-checksum",
				name: "downloadable-config-3-partially-matching",
				mapChecksum: "md5-fileA;invalid-md5-of-another-uploaded-map"
			} as CustomConfig

			const customConfig4NotApplicable = {
				id: "4-invalid-md5-checksum",
				name: "not-downloadable-config-4",
				mapChecksum: "not-applicable-map"
			} as CustomConfig

			const customConfigs = new Map([
				[customConfig1.id, customConfig1],
				[customConfig2.id, customConfig2],
				[customConfig3.id, customConfig3],
				[customConfig4NotApplicable.id, customConfig4NotApplicable]
			])
			CustomConfigHelper.getCustomConfigs = jest.fn().mockReturnValue(customConfigs)

			customConfigsController.onFilesSelectionChanged(FILE_STATES)

			expect(customConfigsController["downloadableConfigs"].size).toBe(3)
			expect(customConfigsController["downloadableConfigs"].get("1-invalid-md5-checksum").name).toBe("downloadable-config-1")
			expect(customConfigsController["downloadableConfigs"].get("2-invalid-md5-checksum").name).toBe("downloadable-config-2")
			expect(customConfigsController["downloadableConfigs"].get("3-invalid-md5-checksum").name).toBe(
				"downloadable-config-3-partially-matching"
			)

			expect(customConfigsController["_viewModel"].hasDownloadableConfigs).toBe(true)
		})
	})

	describe("collapse and expand non applicable custom configs", () => {
		it("should not show configs that are not applicable by default", () => {
			const testConfigItemGroups = [[...CUSTOM_CONFIG_ITEM_GROUPS][0], [...CUSTOM_CONFIG_ITEM_GROUPS][2]]
			CustomConfigHelper.getCustomConfigItemGroups = jest.fn().mockReturnValue(testConfigItemGroups)
			CustomConfigHelper.getCustomConfigs = jest.fn().mockReturnValue(new Map())

			customConfigsController.initView()

			expect(customConfigsController["_viewModel"].dropDownCustomConfigItemGroups).toHaveLength(2)
			expect(customConfigsController["_viewModel"].visibleEntries).toBe(0)
			expect(customConfigsController["_viewModel"].showNonApplicableButton).toBeTruthy()
		})

		it("should show all configs that are applicable by default", () => {
			CustomConfigHelper.getCustomConfigItemGroups = jest.fn().mockReturnValue(CUSTOM_CONFIG_ITEM_GROUPS)
			CustomConfigHelper.getCustomConfigs = jest.fn().mockReturnValue(new Map())

			customConfigsController.initView()

			expect(customConfigsController["_viewModel"].dropDownCustomConfigItemGroups).toHaveLength(3)
			expect(customConfigsController["_viewModel"].visibleEntries).toBe(1)
			expect(customConfigsController["_viewModel"].showNonApplicableButton).toBeTruthy()
		})

		it("should hide expand button when only applicable custom configs are loaded", () => {
			const testConfigItemGroup = [CUSTOM_CONFIG_ITEM_GROUPS.get("fileAfileBMultiple")]
			CustomConfigHelper.getCustomConfigItemGroups = jest.fn().mockReturnValue(testConfigItemGroup)
			CustomConfigHelper.getCustomConfigs = jest.fn().mockReturnValue(new Map())

			customConfigsController.initView()

			expect(customConfigsController["_viewModel"].dropDownCustomConfigItemGroups).toHaveLength(1)
			expect(customConfigsController["_viewModel"].visibleEntries).toBe(1)
			expect(customConfigsController["_viewModel"].showNonApplicableButton).toBeFalsy()
		})

		it("should show all custom configs when 'show non-applicable CustomConfigs' button is clicked", () => {
			CustomConfigHelper.getCustomConfigItemGroups = jest.fn().mockReturnValue(CUSTOM_CONFIG_ITEM_GROUPS)
			CustomConfigHelper.getCustomConfigs = jest.fn().mockReturnValue(new Map())

			customConfigsController.initView()

			expect(customConfigsController["_viewModel"].dropDownCustomConfigItemGroups).toHaveLength(3)
			expect(customConfigsController["_viewModel"].visibleEntries).toBe(1)
			expect(customConfigsController["_viewModel"].showNonApplicableButton).toBeTruthy()

			customConfigsController.toggleNonApplicableItems()

			expect(customConfigsController["_viewModel"].dropDownCustomConfigItemGroups).toHaveLength(3)
			expect(customConfigsController["_viewModel"].visibleEntries).toBe(3)
			expect(customConfigsController["_viewModel"].showNonApplicableButton).toBeTruthy()
		})

		it("should hide all configs that are not applicable when 'show non-applicable CustomConfigs' button is clicked", () => {
			CustomConfigHelper.getCustomConfigItemGroups = jest.fn().mockReturnValue(CUSTOM_CONFIG_ITEM_GROUPS)
			CustomConfigHelper.getCustomConfigs = jest.fn().mockReturnValue(new Map())

			customConfigsController.initView()

			expect(customConfigsController["_viewModel"].dropDownCustomConfigItemGroups).toHaveLength(3)
			expect(customConfigsController["_viewModel"].visibleEntries).toBe(1)
			expect(customConfigsController["_viewModel"].showNonApplicableButton).toBeTruthy()

			customConfigsController.toggleNonApplicableItems()
			customConfigsController.toggleNonApplicableItems()

			expect(customConfigsController["_viewModel"].dropDownCustomConfigItemGroups).toHaveLength(3)
			expect(customConfigsController["_viewModel"].visibleEntries).toBe(1)
			expect(customConfigsController["_viewModel"].showNonApplicableButton).toBeTruthy()
		})
	})
})
