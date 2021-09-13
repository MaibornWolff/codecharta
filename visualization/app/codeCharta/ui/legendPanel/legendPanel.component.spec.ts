import "./legendPanel.module"

import { LegendPanelController } from "./legendPanel.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { ColorRange } from "../../codeCharta.model"
import { ColorRangeService } from "../../state/store/dynamicSettings/colorRange/colorRange.service"
import { IsAttributeSideBarVisibleService } from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.service"
import { ColorMetricService } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"
import { FilesService } from "../../state/store/files/files.service"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { StoreService } from "../../state/store.service"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"

describe("LegendPanelController", () => {
	let legendPanelController: LegendPanelController
	let $rootScope: IRootScopeService
	let nodeMetricDataService: NodeMetricDataService
	let storeService: StoreService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.legendPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
		nodeMetricDataService = getService<NodeMetricDataService>("nodeMetricDataService")
		storeService = getService<StoreService>("storeService")
	}

	function rebuildController() {
		legendPanelController = new LegendPanelController($rootScope, nodeMetricDataService, storeService)
	}

	describe("constructor", () => {
		it("should subscribe to colorMetric", () => {
			ColorMetricService.subscribe = jest.fn()

			rebuildController()

			expect(ColorMetricService.subscribe).toHaveBeenCalledWith($rootScope, legendPanelController)
		})

		it("should subscribe to colorRange", () => {
			ColorRangeService.subscribe = jest.fn()

			rebuildController()

			expect(ColorRangeService.subscribe).toHaveBeenCalledWith($rootScope, legendPanelController)
		})

		it("should subscribe to IsAttributeSideBarVisibleService", () => {
			IsAttributeSideBarVisibleService.subscribe = jest.fn()

			rebuildController()

			expect(IsAttributeSideBarVisibleService.subscribe).toHaveBeenCalledWith($rootScope, legendPanelController)
		})

		it("should subscribe to BlackListService", () => {
			BlacklistService.subscribe = jest.fn()

			rebuildController()

			expect(BlacklistService.subscribe).toHaveBeenCalledWith($rootScope, legendPanelController)
		})

		it("should subscribe to FilesService", () => {
			const fileServiceSubscribeSpy = jest.spyOn(FilesService, "subscribe").mockImplementation(jest.fn())

			rebuildController()

			expect(fileServiceSubscribeSpy).toHaveBeenCalled()
		})
	})

	describe("onFilesSelectionChanged", () => {
		it("should update its _viewModel.isDeltaState", () => {
			legendPanelController["_viewModel"].isDeltaState = true
			legendPanelController.onFilesSelectionChanged([])

			expect(legendPanelController["_viewModel"].isDeltaState).toBe(false)
		})

		it("should update _viewModel.maxMetricValue", () => {
			nodeMetricDataService.getMaxMetricByMetricName = jest.fn(() => 34)

			legendPanelController.onFilesSelectionChanged([])

			expect(legendPanelController["_viewModel"].maxMetricValue).toBe(34)
		})
	})

	describe("onColorMetricChanged", () => {
		it("should update the color metric when it is changed", () => {
			const newColorMetric = "new_color_metric"

			legendPanelController.onColorMetricChanged(newColorMetric)

			expect(legendPanelController["_viewModel"].colorMetric).toEqual(newColorMetric)
		})

		it("should update _viewModel.maxMetricValue", () => {
			nodeMetricDataService.getMaxMetricByMetricName = jest.fn(() => 34)

			legendPanelController.onFilesSelectionChanged([])

			expect(legendPanelController["_viewModel"].maxMetricValue).toBe(34)
		})
	})

	describe("onBlackListChanged", () => {
		it("should update _viewModel.maxMetricValue", () => {
			nodeMetricDataService.getMaxMetricByMetricName = jest.fn(() => 34)

			legendPanelController.onBlacklistChanged()

			expect(legendPanelController["_viewModel"].maxMetricValue).toBe(34)
		})
	})

	describe("onColorRangeChanged", () => {
		it("should update the ColorRange when it is changed", () => {
			const newColorRange: ColorRange = { from: 13, to: 33, min: 1, max: 10 }

			legendPanelController.onColorRangeChanged(newColorRange)

			expect(legendPanelController["_viewModel"].colorRange).toEqual(newColorRange)
		})
	})

	describe("onIsAttributeSideBarVisibleChanged", () => {
		it("should set the sideBarVisibility in viewModel", () => {
			legendPanelController.onIsAttributeSideBarVisibleChanged(true)

			expect(legendPanelController["_viewModel"].isSideBarVisible).toBeTruthy()
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
