import "./customViews.module"
import "../codeMap/threeViewer/threeViewer.module"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { StoreService } from "../../state/store.service"
import { DialogService } from "../dialog/dialog.service"
import {CUSTOM_VIEW_ITEM_GROUPS, FILE_STATES} from "../../util/dataMocks"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { CustomViewsController } from "./customViews.component"
import { FilesService } from "../../state/store/files/files.service"
import { setFiles } from "../../state/store/files/files.actions"
import { CustomViewHelper } from "../../util/customViewHelper"
import { setState } from "../../state/store/state.actions"
import { CustomView } from "../../model/customView/customView.api.model"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"

describe("CustomViewsController", () => {
	let customViewsController: CustomViewsController
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let dialogService: DialogService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let threeCameraService: ThreeCameraService

	function rebuildController() {
		customViewsController = new CustomViewsController(
			$rootScope,
			storeService,
			dialogService,
			threeOrbitControlsService,
			threeCameraService
		)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.customViews")

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

			expect(FilesService.subscribe).toHaveBeenCalledWith($rootScope, customViewsController)
		})
	})

	describe("onFileSelectionChanged", () => {
		it("should reset CustomViewFileStateConnector", () => {
			rebuildController()

			customViewsController.onFilesSelectionChanged(FILE_STATES)

			expect(customViewsController["customViewFileStateConnector"].getSelectedMaps()[0]).toBe("fileA")
		})
	})

	describe("loadCustomViews", () => {
		it("should load CustomViews, sort them by applicable-state and mode name ASC and set the dropDownCustomViewItemGroups ", () => {
			CustomViewHelper.getCustomViewItemGroups = jest.fn().mockReturnValue(CUSTOM_VIEW_ITEM_GROUPS)

			customViewsController.loadCustomViews()

			const customViewItemGroups = customViewsController["_viewModel"].dropDownCustomViewItemGroups.values()
			const customViewItemGroup1 = customViewItemGroups.next().value
			const customViewItemGroup2 = customViewItemGroups.next().value
			const customViewItemGroup3 = customViewItemGroups.next().value

			expect(customViewItemGroup1).toEqual(CUSTOM_VIEW_ITEM_GROUPS.get("fileAfileBMultiple"))
			expect(customViewItemGroup2).toEqual(CUSTOM_VIEW_ITEM_GROUPS.get("fileAfileBDELTA"))
			expect(customViewItemGroup3).toEqual(CUSTOM_VIEW_ITEM_GROUPS.get("fileAfileBSINGLE"))
		})
	})

	describe("showAddCustomViewSettings", () => {
		it("should call showAddCustomViewSettings", () => {
			dialogService.showAddCustomViewSettings = jest.fn()

			customViewsController.showAddCustomViewSettings()

			expect(dialogService.showAddCustomViewSettings).toHaveBeenCalled()
		})
	})

	describe("applyCustomView", () => {
		it("should call store.dispatch", () => {
			const customViewStub = {
				stateSettings: {
					dynamicSettings: {
						margin: 1,
						colorRange: { from: 1, to: 2 }
					}
				}
			} as CustomView
			CustomViewHelper.getCustomViewSettings = jest.fn().mockReturnValue(customViewStub)
			storeService.dispatch = jest.fn()
			threeOrbitControlsService.setControlTarget = jest.fn()

			customViewsController.applyCustomView("CustomView1")

			expect(storeService.dispatch).toHaveBeenCalledWith(setState(customViewStub.stateSettings))
		})
	})

	describe("removeCustomView", () => {
		it("should call deleteCustomView and show ErrorDialog afterwards", () => {
			CustomViewHelper.deleteCustomView = jest.fn()
			dialogService.showErrorDialog = jest.fn()

			const viewNameToRemove = "CustomViewName1"
			const viewIdToRemove = 1
			customViewsController.removeCustomView(viewIdToRemove, viewNameToRemove)

			expect(CustomViewHelper.deleteCustomView).toHaveBeenCalledWith(viewIdToRemove)
			expect(dialogService.showErrorDialog).toHaveBeenCalledWith(expect.stringContaining(`${viewNameToRemove} deleted`), "Info")
		})
	})
})
