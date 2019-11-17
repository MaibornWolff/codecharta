import "./toolBar.module"
import { ToolBarController } from "./toolBar.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"

describe("ToolBarController", () => {
	let $rootScope: IRootScopeService
	let toolBarController: ToolBarController

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.toolBar")

		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	function rebuildController() {
		toolBarController = new ToolBarController($rootScope)
	}

	describe("onBuildingHovered", () => {
		it("should set nodeHovered to true if node is hovered", () => {
			const dataHovered = ({ node: {} } as unknown) as CodeMapBuilding

			toolBarController.onBuildingHovered(dataHovered)

			expect(toolBarController["_viewModel"].nodeHovered).toBe(true)
		})
	})

	describe("onBuildingUnhovered", () => {
		it("should set nodeHovered to false if no node is hovered", () => {
			toolBarController.onBuildingUnhovered()

			expect(toolBarController["_viewModel"].nodeHovered).toBe(false)
		})
	})
})
