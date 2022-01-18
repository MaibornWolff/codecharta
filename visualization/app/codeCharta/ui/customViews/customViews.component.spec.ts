import "./customViews.module"
import "../codeMap/threeViewer/threeViewer.module"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { StoreService } from "../../state/store.service"
import { DialogService } from "../dialog/dialog.service"
import { CUSTOM_VIEW_ITEM_GROUPS, FILE_STATES } from "../../util/dataMocks"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"
import { CustomViewsController } from "./customViews.component"
import { FilesService } from "../../state/store/files/files.service"
import { setFiles } from "../../state/store/files/files.actions"
import { CustomViewHelper } from "../../util/customViewHelper"
import { setState } from "../../state/store/state.actions"
import { CustomView, ExportCustomView } from "../../model/customView/customView.api.model"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCameraService"
import { klona } from "klona"

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

	describe("initView", () => {
		it("should load CustomViews sorted by applicable-state and mode name", () => {
			CustomViewHelper.getCustomViewItemGroups = jest.fn().mockReturnValue(CUSTOM_VIEW_ITEM_GROUPS)
			CustomViewHelper.getCustomViews = jest.fn().mockReturnValue(new Map())

			customViewsController["_viewModel"].hasDownloadableViews = true
			customViewsController.initView()

			const customViewItemGroups = customViewsController["_viewModel"].dropDownCustomViewItemGroups.values()
			const customViewItemGroup1 = customViewItemGroups.next().value
			const customViewItemGroup2 = customViewItemGroups.next().value
			const customViewItemGroup3 = customViewItemGroups.next().value

			expect(customViewItemGroup1).toEqual(CUSTOM_VIEW_ITEM_GROUPS.get("fileAfileBMultiple"))
			expect(customViewItemGroup2).toEqual(CUSTOM_VIEW_ITEM_GROUPS.get("fileAfileBDELTA"))
			expect(customViewItemGroup3).toEqual(CUSTOM_VIEW_ITEM_GROUPS.get("fileAfileBSINGLE"))
		})

		it("should not find downloadable Views", () => {
			CustomViewHelper.getCustomViewItemGroups = jest.fn().mockReturnValue(new Map())
			CustomViewHelper.getCustomViews = jest.fn().mockReturnValue(new Map())

			// should be set to false
			customViewsController["_viewModel"].hasDownloadableViews = true

			customViewsController.initView()

			expect(customViewsController["_viewModel"].hasDownloadableViews).toBe(false)
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
		it("should call deleteCustomView", () => {
			CustomViewHelper.getCustomViewItemGroups = jest.fn().mockReturnValue(klona(CUSTOM_VIEW_ITEM_GROUPS))
			CustomViewHelper.getCustomViews = jest.fn().mockReturnValue(new Map())
			customViewsController.initView()
			CustomViewHelper.deleteCustomView = jest.fn()
			const viewIdToRemove = "SINGLEfileASampleMap View #1"

			customViewsController.removeCustomView(viewIdToRemove, 0, 0)

			expect(CustomViewHelper.deleteCustomView).toHaveBeenCalledWith(viewIdToRemove)
		})

		it("should delete element from customViewItemGroup in dropDownCustomViewItemGroups when removing a custom view", () => {
			const testDropDownViewItemGroup = [klona(CUSTOM_VIEW_ITEM_GROUPS.get("fileAfileBSINGLE"))]
			const viewIdToRemove = "SINGLEfileASampleMap View #1"

			CustomViewHelper.getCustomViewItemGroups = jest.fn().mockReturnValue(testDropDownViewItemGroup)
			CustomViewHelper.getCustomViews = jest.fn().mockReturnValue(new Map())
			customViewsController.initView()
			CustomViewHelper.deleteCustomView = jest.fn()

			expect(customViewsController["_viewModel"].dropDownCustomViewItemGroups).toHaveLength(1)
			expect(customViewsController["_viewModel"].dropDownCustomViewItemGroups[0].customViewItems).toHaveLength(2)
			expect(customViewsController["_viewModel"].showNonApplicableButton).toBeTruthy()

			customViewsController.removeCustomView(viewIdToRemove, 0, 0)

			expect(CustomViewHelper.deleteCustomView).toHaveBeenCalledWith(viewIdToRemove)
			expect(customViewsController["_viewModel"].dropDownCustomViewItemGroups).toHaveLength(1)
			expect(customViewsController["_viewModel"].dropDownCustomViewItemGroups[0].customViewItems).toHaveLength(1)
			expect(customViewsController["_viewModel"].showNonApplicableButton).toBeTruthy()
		})

		it("should delete element from dropDownCustomViewItemGroups when removing a custom view", () => {
			const testDropDownViewItemGroup = [klona(CUSTOM_VIEW_ITEM_GROUPS.get("fileAfileBMultiple"))]
			testDropDownViewItemGroup[0].customViewItems.pop()
			const viewIdToRemove = "MULTIPLEfileESampleMap View #1"

			CustomViewHelper.getCustomViewItemGroups = jest.fn().mockReturnValue([testDropDownViewItemGroup])
			CustomViewHelper.getCustomViewItemGroups = jest.fn().mockReturnValue(testDropDownViewItemGroup)
			CustomViewHelper.getCustomViews = jest.fn().mockReturnValue(new Map())
			customViewsController.initView()
			CustomViewHelper.deleteCustomView = jest.fn()

			expect(customViewsController["_viewModel"].dropDownCustomViewItemGroups).toHaveLength(1)
			expect(customViewsController["_viewModel"].dropDownCustomViewItemGroups[0].customViewItems).toHaveLength(1)
			expect(customViewsController["_viewModel"].visibleEntries).toBe(1)
			expect(customViewsController["_viewModel"].showNonApplicableButton).toBeFalsy()

			customViewsController.removeCustomView(viewIdToRemove, 0, 0)

			expect(CustomViewHelper.deleteCustomView).toHaveBeenCalledWith(viewIdToRemove)
			expect(customViewsController["_viewModel"].dropDownCustomViewItemGroups).toHaveLength(0)
			expect(customViewsController["_viewModel"].visibleEntries).toBe(0)
			expect(customViewsController["_viewModel"].showNonApplicableButton).toBeFalsy()
		})
	})

	describe("downloadPreloadedCustomViews", () => {
		it("should trigger the download if downloadable Views are available otherwise not", () => {
			CustomViewHelper.downloadCustomViews = jest.fn()

			customViewsController.downloadPreloadedCustomViews()
			expect(CustomViewHelper.downloadCustomViews).not.toHaveBeenCalled()

			const exportView1 = {
				id: "1-invalid-md5-checksum",
				name: "view-to-be-exported-1"
			} as ExportCustomView

			customViewsController["downloadableViews"].set(exportView1.id, exportView1)
			customViewsController.downloadPreloadedCustomViews()

			expect(CustomViewHelper.downloadCustomViews).toHaveBeenCalled()
		})
	})

	describe("prefetchDownloadableViewsForUploadedMaps", () => {
		it("should clear downloadableViews and then collect them again", () => {
			const previouslyPrefetchedExportView = {
				id: "0-invalid-md5-checksum",
				name: "view-should-be-cleared-1"
			} as ExportCustomView

			customViewsController["downloadableViews"].set(previouslyPrefetchedExportView.id, previouslyPrefetchedExportView)

			const customView1 = {
				id: "1-invalid-md5-checksum",
				name: "downloadable-view-1",
				mapChecksum: "md5-fileA"
			} as CustomView

			const customView2 = {
				id: "2-invalid-md5-checksum",
				name: "downloadable-view-2",
				mapChecksum: "md5-fileA"
			} as CustomView

			const customView3 = {
				id: "3-invalid-md5-checksum",
				name: "downloadable-view-3-partially-matching",
				mapChecksum: "md5-fileA;invalid-md5-of-another-uploaded-map"
			} as CustomView

			const customView4NotApplicable = {
				id: "4-invalid-md5-checksum",
				name: "not-downloadable-view-4",
				mapChecksum: "not-applicable-map"
			} as CustomView

			const customViews = new Map([
				[customView1.id, customView1],
				[customView2.id, customView2],
				[customView3.id, customView3],
				[customView4NotApplicable.id, customView4NotApplicable]
			])
			CustomViewHelper.getCustomViews = jest.fn().mockReturnValue(customViews)

			customViewsController.onFilesSelectionChanged(FILE_STATES)

			expect(customViewsController["downloadableViews"].size).toBe(3)
			expect(customViewsController["downloadableViews"].get("1-invalid-md5-checksum").name).toBe("downloadable-view-1")
			expect(customViewsController["downloadableViews"].get("2-invalid-md5-checksum").name).toBe("downloadable-view-2")
			expect(customViewsController["downloadableViews"].get("3-invalid-md5-checksum").name).toBe(
				"downloadable-view-3-partially-matching"
			)

			expect(customViewsController["_viewModel"].hasDownloadableViews).toBe(true)
		})
	})

	describe("collapse and expand non applicable custom views", () => {
		it("should not show views that are not applicable by default", () => {
			const testViewItemGroups = [[...CUSTOM_VIEW_ITEM_GROUPS][0], [...CUSTOM_VIEW_ITEM_GROUPS][2]]
			CustomViewHelper.getCustomViewItemGroups = jest.fn().mockReturnValue(testViewItemGroups)
			CustomViewHelper.getCustomViews = jest.fn().mockReturnValue(new Map())

			customViewsController.initView()

			expect(customViewsController["_viewModel"].dropDownCustomViewItemGroups).toHaveLength(2)
			expect(customViewsController["_viewModel"].visibleEntries).toBe(0)
			expect(customViewsController["_viewModel"].showNonApplicableButton).toBeTruthy()
		})

		it("should show all views that are applicable by default", () => {
			CustomViewHelper.getCustomViewItemGroups = jest.fn().mockReturnValue(CUSTOM_VIEW_ITEM_GROUPS)
			CustomViewHelper.getCustomViews = jest.fn().mockReturnValue(new Map())

			customViewsController.initView()

			expect(customViewsController["_viewModel"].dropDownCustomViewItemGroups).toHaveLength(3)
			expect(customViewsController["_viewModel"].visibleEntries).toBe(1)
			expect(customViewsController["_viewModel"].showNonApplicableButton).toBeTruthy()
		})

		it("should hide expand button when only applicable custom views are loaded", () => {
			const testViewItemGroup = [CUSTOM_VIEW_ITEM_GROUPS.get("fileAfileBMultiple")]
			CustomViewHelper.getCustomViewItemGroups = jest.fn().mockReturnValue(testViewItemGroup)
			CustomViewHelper.getCustomViews = jest.fn().mockReturnValue(new Map())

			customViewsController.initView()

			expect(customViewsController["_viewModel"].dropDownCustomViewItemGroups).toHaveLength(1)
			expect(customViewsController["_viewModel"].visibleEntries).toBe(1)
			expect(customViewsController["_viewModel"].showNonApplicableButton).toBeFalsy()
		})

		it("should show all custom views when 'show non-applicable Custom Views' button is clicked", () => {
			CustomViewHelper.getCustomViewItemGroups = jest.fn().mockReturnValue(CUSTOM_VIEW_ITEM_GROUPS)
			CustomViewHelper.getCustomViews = jest.fn().mockReturnValue(new Map())

			customViewsController.initView()

			expect(customViewsController["_viewModel"].dropDownCustomViewItemGroups).toHaveLength(3)
			expect(customViewsController["_viewModel"].visibleEntries).toBe(1)
			expect(customViewsController["_viewModel"].showNonApplicableButton).toBeTruthy()

			customViewsController.toggleNonApplicableItems()

			expect(customViewsController["_viewModel"].dropDownCustomViewItemGroups).toHaveLength(3)
			expect(customViewsController["_viewModel"].visibleEntries).toBe(3)
			expect(customViewsController["_viewModel"].showNonApplicableButton).toBeTruthy()
		})

		it("should hide all views that are not applicable when 'show non-applicable Custom Views' button is clicked", () => {
			CustomViewHelper.getCustomViewItemGroups = jest.fn().mockReturnValue(CUSTOM_VIEW_ITEM_GROUPS)
			CustomViewHelper.getCustomViews = jest.fn().mockReturnValue(new Map())

			customViewsController.initView()

			expect(customViewsController["_viewModel"].dropDownCustomViewItemGroups).toHaveLength(3)
			expect(customViewsController["_viewModel"].visibleEntries).toBe(1)
			expect(customViewsController["_viewModel"].showNonApplicableButton).toBeTruthy()

			customViewsController.toggleNonApplicableItems()
			customViewsController.toggleNonApplicableItems()

			expect(customViewsController["_viewModel"].dropDownCustomViewItemGroups).toHaveLength(3)
			expect(customViewsController["_viewModel"].visibleEntries).toBe(1)
			expect(customViewsController["_viewModel"].showNonApplicableButton).toBeTruthy()
		})
	})
})
