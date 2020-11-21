import "./toolBar.module"
import { ToolBarController } from "./toolBar.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CodeChartaMouseEventService } from "../../codeCharta.mouseEvent.service"

describe("ToolBarController", () => {
	let $rootScope: IRootScopeService
	let toolBarController: ToolBarController
	let codeChartaMouseEventService: CodeChartaMouseEventService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.toolBar")

		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	function rebuildController() {
		toolBarController = new ToolBarController($rootScope, codeChartaMouseEventService)
	}

	describe("onBuildingHovered", () => {
		it("should set isNodeHovered to true if node is hovered", () => {
			toolBarController.onBuildingHovered()

			expect(toolBarController["_viewModel"].isNodeHovered).toBe(true)
		})
	})

	describe("onBuildingUnhovered", () => {
		it("should set isNodeHovered to false if no node is hovered", () => {
			toolBarController.onBuildingUnhovered()

			expect(toolBarController["_viewModel"].isNodeHovered).toBe(false)
		})
	})
})
