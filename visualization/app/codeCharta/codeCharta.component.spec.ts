import "./codeCharta"
import { ThreeOrbitControlsService } from "./ui/codeMap/threeViewer/threeOrbitControlsService"
import { IHttpService, ILocationService, IRootScopeService, ITimeoutService } from "angular"
import { DialogService } from "./ui/dialog/dialog.service"
import { CodeMapActionsService } from "./ui/codeMap/codeMap.actions.service"
import { SettingsService } from "./state/settings.service"
import { CodeChartaService } from "./codeCharta.service"
import { CodeChartaController } from "./codeCharta.component"
import { getService, instantiateModule } from "../../mocks/ng.mockhelper"
import { Settings } from "./codeCharta.model"
import { SETTINGS } from "./util/dataMocks"
import { ScenarioHelper } from "./util/scenarioHelper"
import { FileStateService } from "./state/fileState.service"

describe("codeChartaController", () => {
	let codeChartaController: CodeChartaController
	let threeOrbitControlsService: ThreeOrbitControlsService
	let $rootScope: IRootScopeService
	let dialogService: DialogService
	let codeMapActionsService: CodeMapActionsService
	let settingsService: SettingsService
	let codeChartaService: CodeChartaService
	let fileStateService: FileStateService
	let $location: ILocationService
	let $http: IHttpService
	let $timeout: ITimeoutService

	let settings : Settings

	beforeEach(() => {
		restartSystem()
		rebuildController()
		withMockedThreeOrbitControlsService()
		withMockedCodeMapActionsService()
		withMockedUrlUtils()
		withMockedSettingsService()
		withMockedCodeChartaService()
		withMockedDialogService()
		withMockedScenarioHelper()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta")

        threeOrbitControlsService = getService<ThreeOrbitControlsService>("threeOrbitControlsService")
		$rootScope = getService<IRootScopeService>("$rootScope")
		dialogService = getService<DialogService>("dialogService")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")
		settingsService = getService<SettingsService>("settingsService")
		codeChartaService = getService<CodeChartaService>("codeChartaService")
		fileStateService = getService<FileStateService>("fileStateService")
		$location = getService<ILocationService>("$location")
		$http = getService<IHttpService>("$http")
		$timeout = getService<ITimeoutService>("$timeout")

		settings = JSON.parse(JSON.stringify(SETTINGS))
	}

	function rebuildController() {
		codeChartaController = new CodeChartaController(
			threeOrbitControlsService,
			$rootScope,
			dialogService,
			codeMapActionsService,
			settingsService,
			codeChartaService,
			fileStateService,
			$location,
			$http,
			$timeout
		)
	}

	afterEach(() => {
		jest.resetAllMocks()
	})



	function withMockedThreeOrbitControlsService() {
		threeOrbitControlsService = codeChartaController["threeOrbitControlsService"] = jest.fn().mockReturnValue({
			autoFitTo: jest.fn()
		})()
	}

	function withMockedCodeMapActionsService() {
		codeMapActionsService = codeChartaController["codeMapActionsService"] = jest.fn().mockReturnValue({
			removeFocusedNode: jest.fn()
		})()
	}

	function withMockedUrlUtils() {
		codeChartaController["urlUtils"] = jest.fn().mockReturnValue({
			getFileDataFromQueryParam : jest.fn().mockReturnValue(Promise.resolve([])),
			getParameterByName : jest.fn().mockReturnValue(true)
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
			loadFiles : jest.fn().mockReturnValue(new Promise((resolve, reject) => {
				resolve()
			}))
		})()
	}

	function withMockedDialogService() {
		dialogService = codeChartaController["dialogService"] = jest.fn().mockReturnValue({
			showErrorDialog : jest.fn()
		})()
	}

	function withMockedScenarioHelper() {
		ScenarioHelper.getDefaultScenario = jest.fn().mockReturnValue({ settings })
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
	})

	describe("onSettingsChanged" , () => {
		it("should set focusedNodePath in viewModel", () => {
			codeChartaController.onSettingsChanged(settings, undefined,undefined)

			expect(codeChartaController["_viewModel"].focusedNodePath).toBe("/root")
		})
	})

	describe("fitMapToView" , () => {
		it("should call autoFitTo", () => {
			codeChartaController.fitMapToView()

			expect(threeOrbitControlsService.autoFitTo).toHaveBeenCalled()
		})
	})

	describe("removeFocusedNode" , () => {
		it("should call removeFocusedNode", () => {
			codeChartaController.removeFocusedNode()

			expect(codeMapActionsService.removeFocusedNode).toHaveBeenCalled()
		})
	})

	describe("loadFileOrSample" , () => {
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

	describe("tryLoadingSampleFiles" , () => {
		it("should call getParameterByName with 'file'", () => {
			codeChartaController.tryLoadingSampleFiles()

			expect(codeChartaController["urlUtils"].getParameterByName).toHaveBeenCalledWith("file")
		})

		it("should call showErrorDialog when no file is found", () => {
			const expected = "One or more files from the given file URL parameter could not be loaded. Loading sample files instead."

			codeChartaController.tryLoadingSampleFiles()

			expect(dialogService.showErrorDialog).toHaveBeenCalledWith(expected)
		})

		it("should call loadFiles with sample files", () => {
			const expected = [
				{ fileName: "sample1.json", content: require("./assets/sample1.json") },
				{ fileName: "sample2.json", content: require("./assets/sample2.json") }
			]

			codeChartaController.tryLoadingSampleFiles()

			expect(codeChartaService.loadFiles).toHaveBeenCalledWith(expected)
		})
	})
})