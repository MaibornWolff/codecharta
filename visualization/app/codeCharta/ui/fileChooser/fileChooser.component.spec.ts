import "./fileChooser.module"
import "../../codeCharta"
import { SettingsService } from "../../state/settings.service"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService } from "angular"
import { CodeChartaService } from "../../codeCharta.service"
import { FileStateService } from "../../state/fileState.service"
import { DialogService } from "../dialog/dialog.service"
import { FileChooserController } from "./fileChooser.component"

//TODO: Fix skipped tests and check if we can test for whats in $apply
describe("fileChooserController", () => {
	let fileChooserController: FileChooserController
	let $scope: IRootScopeService
	let $rootScope: IRootScopeService
	let dialogService: DialogService
	let settingsService: SettingsService
	let codeChartaService: CodeChartaService
	let fileStateService: FileStateService

	let fileName : string
	let content : any

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
		codeChartaService = getService<CodeChartaService>("codeChartaService")
		fileStateService = getService<FileStateService>("fileStateService")

		fileName = "someFile.json"
		content = "{ \"name\":\"John\", \"age\":30, \"city\":\"New York\"}"
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
			resetMaps : jest.fn()
		})()
	}

	function withMockedDialogService() {
		dialogService = fileChooserController["dialogService"] = jest.fn().mockReturnValue({
			showErrorDialog : jest.fn()
		})()
	}

	function withMockedCodeChartaService() {
		codeChartaService = fileChooserController["codeChartaService"] = jest.fn().mockReturnValue({
			loadFiles : jest.fn().mockReturnValue(Promise.resolve())
		})()
	}

	describe("onImportNewFiles", () => {
		it("should call $apply", () => {
			fileChooserController.onImportNewFiles({files: []})

			expect($scope.$apply).toHaveBeenCalled()
		})

		it("should broadcast a loading task", () => {
			fileChooserController.onImportNewFiles({ files: [] })
			expect($rootScope.$broadcast).toHaveBeenCalledWith("add-loading-task")
		})
	})

	describe("onNewFileLoaded", () => {
		beforeEach(() => {
			fileChooserController.setNewData = jest.fn()
		})

		it("should call setNewData", () => {
			fileChooserController.onNewFileLoaded(fileName, content)

			expect(fileChooserController.setNewData).toHaveBeenCalledWith({fileName, content: {name : "John", age : 30, city: "New York"}})
		})

		it("should broadcast remove-loading-task event", () => {
			fileChooserController.onNewFileLoaded(fileName, content)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("remove-loading-task")
		})

		it("should showErrorDialog on parsing error", () => {
			const error = "Error parsing JSON!SyntaxError: Unexpected token c in JSON at position 0"

			fileChooserController.onNewFileLoaded(fileName, "content")

			expect(dialogService.showErrorDialog).toHaveBeenCalledWith(error)
		})

		it("should broadcast an additonal remove-loading-task event", () => {
			fileChooserController.onNewFileLoaded(fileName, "content")

			expect($rootScope.$broadcast).toHaveBeenCalledWith("remove-loading-task")
			expect($rootScope.$broadcast).toHaveBeenCalledTimes(2)
		})
	})

	describe("setNewData", () => {
		beforeEach(() => {
			console.error = jest.fn()
		})

		it("should call loadFiles when promise resolves", () => {
			fileChooserController.setNewData({fileName, content})

			expect(codeChartaService.loadFiles).toHaveBeenCalledWith([{fileName, content}])
		})

		xit("should broadcast a remove-loading-task event when promise resolves", () => {
			fileChooserController.setNewData({fileName, content})

			expect($rootScope.$broadcast).toHaveBeenCalledWith("remove-loading-task")
		})

		xit("should showErrorDialog when promise rejects", () => {
			codeChartaService.loadFiles = jest.fn().mockReturnValue(Promise.reject())

			fileChooserController.setNewData({fileName, content})

			expect(dialogService.showErrorDialog).toHaveBeenCalledWith()
		})

		xit("should broadcast a remove-loading-task event when promise rejects", () => {
			codeChartaService.loadFiles = jest.fn().mockReturnValue(Promise.reject())

			fileChooserController.setNewData({fileName, content})

			expect($rootScope.$broadcast).toHaveBeenCalledWith("remove-loading-task")
		})

		xit("should print error to console when promise rejects", () => {
			codeChartaService.loadFiles = jest.fn().mockReturnValue(Promise.reject())

			fileChooserController.setNewData({fileName, content})

			expect(console.error).toHaveBeenCalledWith("remove-loading-task")
		})
	})
})