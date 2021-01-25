import "./legendPanel.module"

import { LegendPanelController } from "./legendPanel.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { ColorRange } from "../../codeCharta.model"
import { ColorRangeService } from "../../state/store/dynamicSettings/colorRange/colorRange.service"
import { IsAttributeSideBarVisibleService } from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.service"
import { ColorMetricService } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"
import { FilesService } from "../../state/store/files/files.service"

describe("LegendPanelController", () => {
	let legendPanelController: LegendPanelController
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.legendPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	function rebuildController() {
		legendPanelController = new LegendPanelController($rootScope)
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
	})

	describe("onColorMetricChanged", () => {
		it("should update the color metric when it is changed", () => {
			const newColorMetric = "new_color_metric"

			legendPanelController.onColorMetricChanged(newColorMetric)

			expect(legendPanelController["_viewModel"].colorMetric).toEqual(newColorMetric)
		})
	})

	describe("onColorRangeChanged", () => {
		it("should update the ColorRange when it is changed", () => {
			const newColorRange: ColorRange = { from: 13, to: 33 }

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
