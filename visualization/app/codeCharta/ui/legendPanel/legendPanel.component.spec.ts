import "./legendPanel.module"

import { LegendPanelController } from "./legendPanel.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { ColorRange } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { ColorRangeService } from "../../state/store/dynamicSettings/colorRange/colorRange.service"
import { IsAttributeSideBarVisibleService } from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.service"
import { ColorMetricService } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"

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
