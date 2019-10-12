import "./codeCharta.module"
import { IHttpService, ILocationService, IRootScopeService } from "angular"
import { DialogService } from "./ui/dialog/dialog.service"
import { CodeMapActionsService } from "./ui/codeMap/codeMap.actions.service"
import { SettingsService } from "./state/settingsService/settings.service"
import { CodeChartaService } from "./codeCharta.service"
import { CodeChartaController } from "./codeCharta.component"
import { getService, instantiateModule } from "../../mocks/ng.mockhelper"
import { Settings } from "./codeCharta.model"
import { SETTINGS } from "./util/dataMocks"
import { ScenarioHelper } from "./util/scenarioHelper"
import { FileStateService } from "./state/fileState.service"
import { LoadingStatusService } from "./state/loadingStatus.service"
import { NodeSearchService } from "./state/nodeSearch.service"

describe("codeChartaController", () => {
	let codeChartaController: CodeChartaController
	let $rootScope: IRootScopeService
	let dialogService: DialogService
	let codeMapActionsService: CodeMapActionsService
	let settingsService: SettingsService
	let codeChartaService: CodeChartaService
	let fileStateService: FileStateService
	let nodeSearchService: NodeSearchService
	let $location: ILocationService
	let $http: IHttpService
	let loadingStatusService: LoadingStatusService

	let settings: Settings

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedCodeMapActionsService()
		withMockedUrlUtils()
		withMockedSettingsService()
		withMockedCodeChartaService()
		withMockedDialogService()
		withMockedScenarioHelper()
		withMockedLoadingStatusService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta")

		$rootScope = getService<IRootScopeService>("$rootScope")
		dialogService = getService<DialogService>("dialogService")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")
		settingsService = getService<SettingsService>("settingsService")
		codeChartaService = getService<CodeChartaService>("codeChartaService")
		fileStateService = getService<FileStateService>("fileStateService")
		nodeSearchService = getService<NodeSearchService>("nodeSearchService")
		$location = getService<ILocationService>("$location")
		$http = getService<IHttpService>("$http")
		loadingStatusService = getService<LoadingStatusService>("loadingStatusService")

		settings = JSON.parse(JSON.stringify(SETTINGS))
	}

	function rebuildController() {
		codeChartaController = new CodeChartaController(
			$rootScope,
			dialogService,
			codeMapActionsService,
			settingsService,
			codeChartaService,
			fileStateService,
			nodeSearchService,
			$location,
			$http,
			loadingStatusService
		)
	}

	afterEach(() => {
		jest.resetAllMocks()
	})

	function withMockedCodeMapActionsService() {
		codeMapActionsService = codeChartaController["codeMapActionsService"] = jest.fn().mockReturnValue({
			removeFocusedNode: jest.fn()
		})()
	}

	function withMockedUrlUtils() {
		codeChartaController["urlUtils"] = jest.fn().mockReturnValue({
			getFileDataFromQueryParam: jest.fn().mockReturnValue(Promise.resolve([])),
			getParameterByName: jest.fn().mockReturnValue(true)
		})()
	}

	function withMockedSettingsService() {
		settingsService = codeChartaController["settingsService"] = jest.fn().mockReturnValue({
			updateSettings: jest.fn(),
			getDefaultSettings: jest.fn().mockReturnValue(settings)
		})()
	}

	function withMockedCodeChartaService() {
		codeChartaService = codeChartaController["codeChartaService"] = jest.fn().mockReturnValue({
			loadFiles: jest.fn().mockReturnValue(Promise.resolve())
		})()
	}

	function withMockedDialogService() {
		dialogService = codeChartaController["dialogService"] = jest.fn().mockReturnValue({
			showErrorDialog: jest.fn()
		})()
	}

	function withMockedScenarioHelper() {
		ScenarioHelper.getDefaultScenario = jest.fn().mockReturnValue({ settings })
	}

	function withMockedLoadingStatusService() {
		loadingStatusService = codeChartaController["loadingStatusService"] = jest.fn().mockReturnValue({
			updateLoadingFileFlag: jest.fn(),
			updateLoadingMapFlag: jest.fn()
		})()
	}

	describe("constructor", () => {
		it("should subscribe to SettingsService", () => {
			SettingsService.subscribe = jest.fn()

			rebuildController()

			expect(SettingsService.subscribe).toHaveBeenCalledWith($rootScope, codeChartaController)
		})

		it("should set urlUtils", () => {
			rebuildController()

			expect(codeChartaController["urlUtils"]).toBeDefined()
		})

		it("should call updateLoadingFileFlag with true", () => {
			rebuildController()

			expect(loadingStatusService.updateLoadingFileFlag).toHaveBeenCalledWith(true)
		})
	})

	describe("onSettingsChanged", () => {
		it("should set focusedNodePath in viewModel", () => {
			codeChartaController.onSettingsChanged(settings, undefined)

			expect(codeChartaController["_viewModel"].focusedNodePath).toBe("/root")
		})
	})

	describe("removeFocusedNode", () => {
		it("should call removeFocusedNode", () => {
			codeChartaController.removeFocusedNode()

			expect(codeMapActionsService.removeFocusedNode).toHaveBeenCalled()
		})
	})

	describe("loadFileOrSample", () => {
		beforeEach(() => {
			codeChartaController.tryLoadingSampleFiles = jest.fn()
		})

		it("should call tryLoadingSampleFiles when data is an empty array", async () => {
			await codeChartaController.loadFileOrSample()

			expect(codeChartaController.tryLoadingSampleFiles).toHaveBeenCalled()
		})

		it("should call loadFiles when data is not an empty array", async () => {
			codeChartaController["urlUtils"].getFileDataFromQueryParam = jest.fn().mockReturnValue(Promise.resolve([{}]))

			await codeChartaController.loadFileOrSample()

			expect(codeChartaService.loadFiles).toHaveBeenCalledWith([{}])
		})

		it("should call updateSettings if loadFiles-Promise resolves", async () => {
			codeChartaController["urlUtils"].getFileDataFromQueryParam = jest.fn().mockReturnValue(Promise.resolve([{}]))

			await codeChartaController.loadFileOrSample()

			expect(settingsService.updateSettings).toHaveBeenCalledWith(settings)
		})
	})

	describe("tryLoadingSampleFiles", () => {
		it("should call getParameterByName with 'file'", () => {
			codeChartaController.tryLoadingSampleFiles()

			expect(codeChartaController["urlUtils"].getParameterByName).toHaveBeenCalledWith("file")
		})

		it("should call showErrorDialog when no file is found", () => {
			const expected = "One or more files from the given file URL parameter could not be loaded. Loading sample files instead."

			codeChartaController.tryLoadingSampleFiles()

			expect(dialogService.showErrorDialog).toHaveBeenCalledWith(expected)
		})

		it("should update settings with default settings", () => {
			codeChartaController.tryLoadingSampleFiles()

			expect(settingsService.updateSettings).toHaveBeenCalledWith(settings)
		})

		it("should update settings from default scenario", () => {
			codeChartaController.tryLoadingSampleFiles()

			expect(settingsService.updateSettings).toHaveBeenCalledWith(settings)
		})

		it("should call loadFiles with sample files", () => {
			const expected = [
				{ fileName: "sample1.cc.json", content: require("./assets/sample1.cc.json") },
				{ fileName: "sample2.cc.json", content: require("./assets/sample2.cc.json") }
			]

			codeChartaController.tryLoadingSampleFiles()

			expect(codeChartaService.loadFiles).toHaveBeenCalledWith(expected)
		})
	})
})
