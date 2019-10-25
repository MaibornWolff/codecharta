import "./nodePathPanel.module"
import { NodePathPanelController } from "./nodePathPanel.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CodeMapMouseEventService, CodeMapBuildingTransition } from "../codeMap/codeMap.mouseEvent.service"

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
		it("should subscribe to Building-Hovered-Event", () => {
			CodeMapMouseEventService.subscribeToBuildingHoveredEvents = jest.fn()

			rebuildController()

			expect(CodeMapMouseEventService.subscribeToBuildingHoveredEvents).toHaveBeenCalledWith($rootScope, nodePathPanelController)
		})
	})

	describe("onBuildingHovered", () => {
		it("should update the viewModel when hovering", () => {
			const dataHovered = {
				to: {
					node: {
						path: "/root/my/path"
					}
				}
			} as CodeMapBuildingTransition

			nodePathPanelController.onBuildingHovered(dataHovered)

			expect(nodePathPanelController["_viewModel"].hoveredNodePath).toEqual("/root/my/path")
		})

		it("should update the viewModel when unhovering", () => {
			const dataUnhovered = {
				to: {}
			} as CodeMapBuildingTransition

			nodePathPanelController.onBuildingHovered(dataUnhovered)

			expect(nodePathPanelController["_viewModel"].hoveredNodePath).toEqual(null)
		})
	})
})
