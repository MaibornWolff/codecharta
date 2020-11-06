import "./customConfigs.module"
import "../codeMap/threeViewer/threeViewer.module"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { StoreService } from "../../state/store.service"
import { DialogService } from "../dialog/dialog.service"
import { CUSTOM_VIEW_ITEM_GROUPS, FILE_STATES } from "../../util/dataMocks"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { CustomConfigsController } from "./customConfigs.component"
import { FilesService } from "../../state/store/files/files.service"
import { setFiles } from "../../state/store/files/files.actions"
import { CustomConfigHelper } from "../../util/customConfigHelper"
import { setState } from "../../state/store/state.actions"
import { CustomConfig } from "../../model/customConfig/customConfig.api.model"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"

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

	describe("loadCustomConfigs", () => {
		it("should load CustomConfigs, sort them by applicable-state and mode name ASC and set the dropDownCustomConfigItemGroups ", () => {
			CustomConfigHelper.getCustomConfigItemGroups = jest.fn().mockReturnValue(CUSTOM_VIEW_ITEM_GROUPS)

			customConfigsController.loadCustomConfigs()

			const customConfigItemGroups = customConfigsController["_viewModel"].dropDownCustomConfigItemGroups.values()
			const customConfigItemGroup1 = customConfigItemGroups.next().value
			const customConfigItemGroup2 = customConfigItemGroups.next().value
			const customConfigItemGroup3 = customConfigItemGroups.next().value

			expect(customConfigItemGroup1).toEqual(CUSTOM_VIEW_ITEM_GROUPS.get("fileAfileBMultiple"))
			expect(customConfigItemGroup2).toEqual(CUSTOM_VIEW_ITEM_GROUPS.get("fileAfileBDELTA"))
			expect(customConfigItemGroup3).toEqual(CUSTOM_VIEW_ITEM_GROUPS.get("fileAfileBSINGLE"))
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
		it("should call deleteCustomConfig and show InfoDialog afterwards", () => {
			CustomConfigHelper.deleteCustomConfig = jest.fn()
			dialogService.showInfoDialog = jest.fn()

			const viewNameToRemove = "CustomConfigName1"
			const viewIdToRemove = 1
			customConfigsController.removeCustomConfig(viewIdToRemove, viewNameToRemove)

			expect(CustomConfigHelper.deleteCustomConfig).toHaveBeenCalledWith(viewIdToRemove)
			expect(dialogService.showInfoDialog).toHaveBeenCalledWith(expect.stringContaining(`${viewNameToRemove} deleted`))
		})
	})
})
