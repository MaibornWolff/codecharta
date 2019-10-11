import "./fileChooser.module"
import "../../codeCharta.module"
import { SettingsService } from "../../state/settingsService/settings.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CodeChartaService } from "../../codeCharta.service"
import { FileStateService } from "../../state/fileState.service"
import { DialogService } from "../dialog/dialog.service"
import { FileChooserController } from "./fileChooser.component"
import { TEST_FILE_CONTENT } from "../../util/dataMocks"
import _ from "lodash"
import { LoadingStatusService } from "../../state/loadingStatusService"

describe("fileChooserController", () => {
	let fileChooserController: FileChooserController
	let $scope: IRootScopeService
	let dialogService: DialogService
	let settingsService: SettingsService
	let codeChartaService: CodeChartaService
	let fileStateService: FileStateService
	let loadingStatusService: LoadingStatusService

	let fileName: string
	let content: any

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedEventMethods()
		withMockedFileStateService()
		withMockedDialogService()
		withMockedCodeChartaService()
		withMockedLoadingStatusService()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.fileChooser")

		$scope = getService<IRootScopeService>("$rootScope")
		dialogService = getService<DialogService>("dialogService")
		settingsService = getService<SettingsService>("settingsService")
		fileStateService = getService<FileStateService>("fileStateService")
		codeChartaService = getService<CodeChartaService>("codeChartaService")
		loadingStatusService = getService<LoadingStatusService>("loadingStatusService")

		fileName = "someFile.json"
		content = _.cloneDeep(TEST_FILE_CONTENT)
	}

	function rebuildController() {
		fileChooserController = new FileChooserController($scope, dialogService, codeChartaService, fileStateService, loadingStatusService)
	}

	function withMockedEventMethods() {
		$scope.$broadcast = fileChooserController["$scope"].$broadcast = jest.fn()
		$scope.$on = fileChooserController["$scope"].$on = jest.fn()
		$scope.$apply = fileChooserController["$scope"].$apply = jest.fn()
	}

	function withMockedFileStateService() {
		fileStateService = fileChooserController["fileStateService"] = jest.fn().mockReturnValue({
			resetMaps: jest.fn(),
			setSingle: jest.fn()
		})()
	}

	function withMockedDialogService() {
		dialogService = fileChooserController["dialogService"] = jest.fn().mockReturnValue({
			showErrorDialog: jest.fn()
		})()
	}

	function withMockedCodeChartaService() {
		codeChartaService = fileChooserController["codeChartaService"] = jest.fn().mockReturnValue({
			loadFiles: jest.fn().mockReturnValue({ catch: jest.fn() })
		})()
	}

	function withMockedLoadingStatusService() {
		loadingStatusService = settingsService["loadingStatusService"] = jest.fn().mockReturnValue({
			updateLoadingMapFlag: jest.fn(),
			updateLoadingFileFlag: jest.fn()
		})()
	}

	describe("onImportNewFiles", () => {
		it("should call $apply", () => {
			fileChooserController.onImportNewFiles({ files: [] })

			expect($scope.$apply).toHaveBeenCalled()
		})

		it("should not call updateLoadingFileFlag if no file loaded", () => {
			fileChooserController.onImportNewFiles({ files: [] })

			expect(loadingStatusService.updateLoadingFileFlag).not.toHaveBeenCalled()
		})
	})

	describe("setNewData", () => {
		it("should call loadFiles", () => {
			fileChooserController.setNewData(fileName, JSON.stringify(content))

			expect(codeChartaService.loadFiles).toHaveBeenCalledWith([
				{
					fileName: fileName,
					content: content
				}
			])
		})

		it("should showErrorDialog on parsing error", () => {
			const error = "Error parsing JSON!SyntaxError: Unexpected token c in JSON at position 0"

			fileChooserController.setNewData(fileName, "content")

			expect(dialogService.showErrorDialog).toHaveBeenCalledWith(error)
		})
	})
})
