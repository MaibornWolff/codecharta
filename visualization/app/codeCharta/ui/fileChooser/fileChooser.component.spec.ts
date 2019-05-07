import "./fileChooser.module"
import "../../codeCharta"
import { SettingsService } from "../../state/settings.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CodeChartaService } from "../../codeCharta.service"
import { FileStateService } from "../../state/fileState.service"
import { DialogService } from "../dialog/dialog.service"
import { FileChooserController } from "./fileChooser.component"
import { TEST_FILE_CONTENT } from "../../util/dataMocks"
import { CodeChartaController } from "../../codeCharta.component"
import _ from "lodash"

describe("fileChooserController", () => {
	let fileChooserController: FileChooserController
	let $scope: IRootScopeService
	let $rootScope: IRootScopeService
	let dialogService: DialogService
	let settingsService: SettingsService
	let codeChartaService: CodeChartaService
	let fileStateService: FileStateService

	let fileName: string
	let content: any

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedEventMethods()
		withMockedFileStateService()
		withMockedDialogService()
		withMockedCodeChartaService()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.fileChooser")

		$scope = getService<IRootScopeService>("$rootScope")
		$rootScope = getService<IRootScopeService>("$rootScope")
		dialogService = getService<DialogService>("dialogService")
		settingsService = getService<SettingsService>("settingsService")
		fileStateService = getService<FileStateService>("fileStateService")
		codeChartaService = getService<CodeChartaService>("codeChartaService")
		fileName = "someFile.json"
		content = _.cloneDeep(TEST_FILE_CONTENT)
	}

	function rebuildController() {
		fileChooserController = new FileChooserController(
			$scope,
			$rootScope,
			dialogService,
			codeChartaService,
			fileStateService
		)
	}

	function withMockedEventMethods() {
		$rootScope.$broadcast = fileChooserController["$rootScope"].$broadcast = jest.fn()
		$rootScope.$on = fileChooserController["$rootScope"].$on = jest.fn()

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
			loadFiles: jest.fn().mockReturnValue({catch : jest.fn()})
		})()
	}

	describe("onImportNewFiles", () => {
		it("should call $apply", () => {
			fileChooserController.onImportNewFiles({ files: [] })

			expect($scope.$apply).toHaveBeenCalled()
		})

		it("should not broadcast the loading-status-changed event if no file loaded", () => {
			fileChooserController.onImportNewFiles({ files: [] })
			expect($rootScope.$broadcast).not.toHaveBeenCalledWith(CodeChartaController.LOADING_STATUS_EVENT, true)
		})
	})

	describe("setNewData", () => {
		it("should call loadFiles", () => {
			fileChooserController.setNewData(fileName, JSON.stringify(content))

			expect(codeChartaService.loadFiles).toHaveBeenCalledWith([{
				fileName: fileName,
				content: content
			}])
		})

		it("should showErrorDialog on parsing error", () => {
			const error = "Error parsing JSON!SyntaxError: Unexpected token c in JSON at position 0"

			fileChooserController.setNewData(fileName, "content")

			expect(dialogService.showErrorDialog).toHaveBeenCalledWith(error)
		})
	})
})