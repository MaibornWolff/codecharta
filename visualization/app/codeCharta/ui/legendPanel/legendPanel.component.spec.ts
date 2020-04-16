import "./legendPanel.module"

import { LegendPanelController, PackageList } from "./legendPanel.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { ColorRange } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { ColorRangeService } from "../../state/store/dynamicSettings/colorRange/colorRange.service"
import { InvertColorRangeService } from "../../state/store/appSettings/invertColorRange/invertColorRange.service"
import { InvertDeltaColorsService } from "../../state/store/appSettings/invertDeltaColors/invertDeltaColors.service"
import { WhiteColorBuildingsService } from "../../state/store/appSettings/whiteColorBuildings/whiteColorBuildings.service"
import { MarkedPackagesService } from "../../state/store/fileSettings/markedPackages/markedPackages.service"
import { IsAttributeSideBarVisibleService } from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.service"

describe("LegendPanelController", () => {
	let legendPanelController: LegendPanelController
	let $rootScope: IRootScopeService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.legendPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		legendPanelController = new LegendPanelController($rootScope, storeService)
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

		it("should subscribe to IsAttributeSideBarVisibleService", () => {
			IsAttributeSideBarVisibleService.subscribe = jest.fn()

			rebuildController()

			expect(IsAttributeSideBarVisibleService.subscribe).toHaveBeenCalledWith($rootScope, legendPanelController)
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
		it("set correct markingPackage in Legend", () => {
			const markedPackages = [{ color: "#FF0000", path: "/root" }]
			const expectedPackageLists: PackageList[] = [
				{
					colorPixel: "data:image/gif;base64,R0lGODlhAQABAPAAAP8AAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
					markedPackages: [{ color: "#FF0000", path: "/root" }]
				}
			]

			legendPanelController.onMarkedPackagesChanged(markedPackages)

			expect(legendPanelController["_viewModel"].packageLists).toEqual(expectedPackageLists)
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

	describe("onIsAttributeSideBarVisibleChanged", () => {
		it("should set the sideBarVisibility in viewModel", () => {
			legendPanelController.onIsAttributeSideBarVisibleChanged(true)

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
