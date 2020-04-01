import "./nodePathPanel.module"
import { NodePathPanelController } from "./nodePathPanel.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"

describe("NodePathPanelController", () => {
	let nodePathPanelController: NodePathPanelController
	let $rootScope: IRootScopeService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.nodePathPanel")

		$rootScope = getService<IRootScopeService>("$rootScope")
	}

	function rebuildController() {
		nodePathPanelController = new NodePathPanelController($rootScope)
	}

	describe("constructor", () => {
		it("should subscribe to Building-Hovered", () => {
			CodeMapMouseEventService.subscribeToBuildingHovered = jest.fn()

			rebuildController()

			expect(CodeMapMouseEventService.subscribeToBuildingHovered).toHaveBeenCalledWith($rootScope, nodePathPanelController)
		})

		it("should subscribe to Building-Unhovered", () => {
			CodeMapMouseEventService.subscribeToBuildingUnhovered = jest.fn()

			rebuildController()

			expect(CodeMapMouseEventService.subscribeToBuildingUnhovered).toHaveBeenCalledWith($rootScope, nodePathPanelController)
		})
	})

	describe("onBuildingHovered", () => {
		const dataHovered = {
			node: {
				path: "/root/my/path",
				isLeaf: true
			}
		} as CodeMapBuilding

		it("should update the viewModel when hovering", () => {
			nodePathPanelController.onBuildingHovered(dataHovered)

			expect(nodePathPanelController["_viewModel"].hoveredNodePath).toEqual(["root", "my", "path"])
		})

		it("should update the hoveredNodeIsFile when hovering", () => {
			nodePathPanelController.onBuildingHovered(dataHovered)

			expect(nodePathPanelController["_viewModel"].hoveredNodeIsFile).toEqual(true)
		})
	})

	describe("onBuildingUnhovered", () => {
		it("should update the viewModel when unhovering", () => {
			nodePathPanelController.onBuildingUnhovered()

			expect(nodePathPanelController["_viewModel"].hoveredNodePath).toEqual([])
		})
	})
})
