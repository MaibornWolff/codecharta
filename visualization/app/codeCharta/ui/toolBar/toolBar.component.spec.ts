import "./toolBar.module"
import { ToolBarController } from "./toolBar.component"
import { instantiateModule, getService } from "../../../../mocks/ng.mockhelper"
import { DialogService } from "../dialog/dialog.service"
import { IRootScopeService } from "angular"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"

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
