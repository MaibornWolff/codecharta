import "./toolBar.module"
import { ToolBarController } from "./toolBar.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { DialogService } from "../dialog/dialog.service"
import { IRootScopeService } from "angular"
import { CodeMapBuildingTransition } from "../codeMap/codeMap.mouseEvent.service"

describe("ToolBarController", () => {
	let $rootScope: IRootScopeService
	let toolBarController: ToolBarController
	let dialogService: DialogService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedDialogService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.toolBar")

		$rootScope = getService<IRootScopeService>("$rootScope")
		dialogService = getService<DialogService>("dialogService")
	}

	function rebuildController() {
		toolBarController = new ToolBarController($rootScope, dialogService)
	}

	function withMockedDialogService() {
		dialogService = toolBarController["dialogService"] = jest.fn().mockReturnValue({
			showDownloadDialog: jest.fn(),
			showGlobalSettingsDialog: jest.fn()
		})()
	}

	describe("downloadFile", () => {
		it("should call showDownloadDialog", () => {
			toolBarController.downloadFile()

			expect(dialogService.showDownloadDialog).toHaveBeenCalled()
		})
	})

	describe("showGlobalSettings", () => {
		it("should call showGlobalSettingsDialog", () => {
			toolBarController.showGlobalSettings()

			expect(dialogService.showGlobalSettingsDialog).toHaveBeenCalled()
		})
	})

	describe("onBuildingHovered", () => {
		it("should set nodeHovered to true if node is hovered", () => {
			const dataHovered = ({ to: { node: {} } } as unknown) as CodeMapBuildingTransition

			toolBarController.onBuildingHovered(dataHovered)

			expect(toolBarController["_viewModel"].nodeHovered).toBe(true)
		})

		it("should set nodeHovered to false if no node is hovered", () => {
			const dataHovered = ({ to: null } as unknown) as CodeMapBuildingTransition

			toolBarController.onBuildingHovered(dataHovered)

			expect(toolBarController["_viewModel"].nodeHovered).toBe(false)
		})
	})
})
