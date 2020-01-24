import "./legendPanel.module"

import { LegendPanelController, PackageList } from "./legendPanel.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { FileStateService } from "../../state/fileState.service"
import { IRootScopeService } from "angular"
import { CCFile, ColorRange } from "../../model/codeCharta.model"
import { TEST_FILE_DATA } from "../../util/dataMocks"
import _ from "lodash"
import { StoreService } from "../../state/store.service"
import { ColorRangeService } from "../../state/store/dynamicSettings/colorRange/colorRange.service"
import { InvertColorRangeService } from "../../state/store/appSettings/invertColorRange/invertColorRange.service"
import { InvertDeltaColorsService } from "../../state/store/appSettings/invertDeltaColors/invertDeltaColors.service"
import { WhiteColorBuildingsService } from "../../state/store/appSettings/whiteColorBuildings/whiteColorBuildings.service"
import { MarkedPackagesService } from "../../state/store/fileSettings/markedPackages/markedPackages.service"
import { AttributeSideBarService } from "../attributeSideBar/attributeSideBar.service"

describe("LegendPanelController", () => {
	let legendPanelController: LegendPanelController
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let fileStateService: FileStateService

	let file: CCFile

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.legendPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		fileStateService = getService<FileStateService>("fileStateService")

		file = _.cloneDeep(TEST_FILE_DATA)
	}

	function rebuildController() {
		legendPanelController = new LegendPanelController($rootScope, storeService, fileStateService)
	}

	describe("constructor", () => {
		it("should subscribe to colorRange", () => {
			ColorRangeService.subscribe = jest.fn()

			rebuildController()

			expect(ColorRangeService.subscribe).toHaveBeenCalledWith($rootScope, legendPanelController)
		})

		it("should subscribe to invertColorRange", () => {
			InvertColorRangeService.subscribe = jest.fn()

			rebuildController()

			expect(InvertColorRangeService.subscribe).toHaveBeenCalledWith($rootScope, legendPanelController)
		})

		it("should subscribe to attributeSideBar", () => {
			AttributeSideBarService.subscribe = jest.fn()

			rebuildController()

			expect(AttributeSideBarService.subscribe).toHaveBeenCalledWith($rootScope, legendPanelController)
		})

		it("should subscribe to markedPackages", () => {
			MarkedPackagesService.subscribe = jest.fn()

			rebuildController()

			expect(MarkedPackagesService.subscribe).toHaveBeenCalledWith($rootScope, legendPanelController)
		})

		it("should subscribe to whiteColorBuildings", () => {
			WhiteColorBuildingsService.subscribe = jest.fn()

			rebuildController()

			expect(WhiteColorBuildingsService.subscribe).toHaveBeenCalledWith($rootScope, legendPanelController)
		})

		it("should subscribe to invertDeltaColors", () => {
			InvertDeltaColorsService.subscribe = jest.fn()

			rebuildController()

			expect(InvertDeltaColorsService.subscribe).toHaveBeenCalledWith($rootScope, legendPanelController)
		})
	})

	describe("onMarkedPackagesChanged", () => {
		beforeEach(() => {
			fileStateService["fileStates"].push({ file, selectedAs: null })
		})

		it("set correct markingPackage in Legend", () => {
			const markedPackages = [{ color: "#FF0000", path: "/root", attributes: {} }]
			const expectedPackageLists: PackageList[] = [
				{
					colorPixel: "data:image/gif;base64,R0lGODlhAQABAPAAAP8AAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
					markedPackages: [{ color: "#FF0000", path: "/root", attributes: { name: "/root" } }]
				}
			]

			legendPanelController.onMarkedPackagesChanged(markedPackages)

			expect(legendPanelController["_viewModel"].packageLists).toEqual(expectedPackageLists)
		})

		it("shorten too long pathName in middle of the string for legendPanel", () => {
			const markedPackages = [{ color: "#FF0000", path: "/root/a/longNameToBeShortenedInLegend", attributes: {} }]
			const shortenedPathname = "longNameToBe...enedInLegend"

			legendPanelController.onMarkedPackagesChanged(markedPackages)
			expect(legendPanelController["_viewModel"].packageLists[0].markedPackages[0].attributes["name"]).toEqual(shortenedPathname)
		})

		it("shorten too long pathName at beginning of the string for legendPanel", () => {
			const markedPackages = [{ color: "#FF0000", path: "/root/a/andAnotherLongNameToShorten", attributes: {} }]
			const shortenedPathname = ".../andAnotherLongNameToShorten"

			legendPanelController.onMarkedPackagesChanged(markedPackages)
			expect(legendPanelController["_viewModel"].packageLists[0].markedPackages[0].attributes["name"]).toEqual(shortenedPathname)
		})
		it("should update the ColorRange when it is changed", () => {
			const newColorRange: ColorRange = { from: 13, to: 33 }

			legendPanelController.onColorRangeChanged(newColorRange)

			expect(legendPanelController["_viewModel"].colorRange).toEqual(newColorRange)
		})
	})

	describe("onColorRangeChanged", () => {
		it("should update the color range and pixels in viewModel when it is changed", () => {
			const newColorRange: ColorRange = { from: 13, to: 33 }

			legendPanelController.onColorRangeChanged(newColorRange)

			expect(legendPanelController["_viewModel"].colorRange).toEqual(newColorRange)
			expect(legendPanelController["_viewModel"].colorIcons).toMatchSnapshot()
		})
	})

	describe("onInvertColorRangeChanged", () => {
		it("should update the invertColorRange and pixels in viewModel when it is changed", () => {
			legendPanelController.onInvertColorRangeChanged(true)

			expect(legendPanelController["_viewModel"].invertColorRange).toBeTruthy()
			expect(legendPanelController["_viewModel"].colorIcons).toMatchSnapshot()
		})
	})

	describe("onInvertDeltaColors", () => {
		it("should update the pixels in viewModel when it is changed", () => {
			legendPanelController.onInvertDeltaColorsChanged(true)

			expect(legendPanelController["_viewModel"].colorIcons).toMatchSnapshot()
		})
	})

	describe("onAttributeSideBarVisibilityChanged", () => {
		it("should set the sideBarVisibility in viewModel", () => {
			legendPanelController.onAttributeSideBarVisibilityChanged(true)

			expect(legendPanelController["_viewModel"].isSideBarVisible).toBeTruthy()
		})
	})

	describe("onWhiteColorBuildings", () => {
		it("should update the pixels in viewModel when it is changed", () => {
			legendPanelController.onWhiteColorBuildingsChanged(true)

			expect(legendPanelController["_viewModel"].colorIcons).toMatchSnapshot()
		})
	})

	describe("toggle", () => {
		it("should toggle the legendPanel visibility", () => {
			legendPanelController["_viewModel"].isLegendVisible = false

			legendPanelController.toggle()

			expect(legendPanelController["_viewModel"].isLegendVisible).toBeTruthy()

			legendPanelController.toggle()

			expect(legendPanelController["_viewModel"].isLegendVisible).toBeFalsy()
		})
	})
})
