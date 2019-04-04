import "./codeCharta"
import { ThreeOrbitControlsService } from "./ui/codeMap/threeViewer/threeOrbitControlsService"
import { IHttpService, ILocationService, IRootScopeService } from "angular"
import { DialogService } from "./ui/dialog/dialog.service"
import { CodeMapActionsService } from "./ui/codeMap/codeMap.actions.service"
import { SettingsService } from "./state/settings.service"
import { CodeChartaService } from "./codeCharta.service"
import { CodeChartaController } from "./codeCharta.component"
import { getService, instantiateModule } from "../../mocks/ng.mockhelper"
import { Settings } from "./codeCharta.model"
import { SETTINGS } from "./util/dataMocks"
import { ScenarioHelper } from "./util/scenarioHelper"

//TODO: weird mock behavior. check test later on
describe("codeChartaController", () => {
	let codeChartaController: CodeChartaController
	let threeOrbitControlsService: ThreeOrbitControlsService
	let $rootScope: IRootScopeService
	let dialogService: DialogService
	let codeMapActionsService: CodeMapActionsService
	let settingsService: SettingsService
	let codeChartaService: CodeChartaService
	let $location: ILocationService
	let $http: IHttpService

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
	})

	function restartSystem() {
		instantiateModule("app.codeCharta")

        threeOrbitControlsService = getService<ThreeOrbitControlsService>("threeOrbitControlsService")
		$rootScope = getService<IRootScopeService>("$rootScope")
		dialogService = getService<DialogService>("dialogService")
		codeMapActionsService = getService<CodeMapActionsService>("codeMapActionsService")
		settingsService = getService<SettingsService>("settingsService")
		codeChartaService = getService<CodeChartaService>("codeChartaService")
		$location = getService<ILocationService>("$location")
		$http = getService<IHttpService>("$http")

		settings = JSON.parse(JSON.stringify(SETTINGS))
	}

	function rebuildController() {
		codeChartaController = new CodeChartaController(threeOrbitControlsService, $rootScope, dialogService, codeMapActionsService, settingsService, codeChartaService, $location, $http)
	}

	afterEach(() => {
		jest.resetAllMocks()
	})

	function withMockedEventMethods() {
		$rootScope.$on = jest.fn()
		$rootScope.$broadcast = jest.fn()
	}

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
			getFileDataFromQueryParam : jest.fn().mockReturnValue(new Promise((resolve, reject) => {
					resolve([])
			})),
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

		it("should setup two event listeners", () => {
			withMockedEventMethods()

			rebuildController()

			expect($rootScope.$on).toHaveBeenCalledTimes(2)
		})

		it("should call loadFileOrSample", () => {
			codeChartaController.loadFileOrSample = jest.fn()

			rebuildController()

			expect(codeChartaController.loadFileOrSample).toHaveBeenCalled()
		})
	})

	describe("onSettingsChanged" , () => {
		it("should set focusedNodePath in viewModel", () => {
			codeChartaController.onSettingsChanged(settings, undefined)

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
			codeChartaController["_viewModel"].numberOfLoadingTasks = 1
			ScenarioHelper.getDefaultScenario = jest.fn().mockReturnValue({ settings })
		})

		it("should increment numberOfLoadingTasks", () => {
			codeChartaController.loadFileOrSample()

			expect(codeChartaController["_viewModel"].numberOfLoadingTasks).toBe(2)
		})

		it("should call tryLoadingSampleFiles when data is an empty array", () => {
			codeChartaController.loadFileOrSample()

			expect(codeChartaController.tryLoadingSampleFiles).toHaveBeenCalled()
		})

		it("should call loadFiles when data is not an empty array", () => {
			codeChartaController.loadFileOrSample()

			expect(codeChartaService.loadFiles).toHaveBeenCalledWith([])
		})

		it("should decrement numberOfLoadingTasks if loadFiles-Promise resolves", () => {
			codeChartaController.loadFileOrSample()

			expect(codeChartaController["_viewModel"].numberOfLoadingTasks).toBe(0)
		})

		it("should call updateSettings if loadFiles-Promise resolves", () => {
			codeChartaController.loadFileOrSample()

			expect(settingsService.updateSettings).toHaveBeenCalledWith(settings)
		})

		it("should decrement numberOfLoadingTasks if loadFiles-Promise rejects", () => {
			codeChartaService.loadFiles = jest.fn().mockReturnValue(new Promise((resolve, reject) => { reject() }))

			codeChartaController.loadFileOrSample()

			expect(codeChartaController["_viewModel"].numberOfLoadingTasks).toBe(0)
		})

		it("should call showErrorDialog if loadFiles-Promise rejects", () => {
			codeChartaService.loadFiles = jest.fn().mockReturnValue(new Promise((resolve, reject) => { reject() }))

			codeChartaController.loadFileOrSample()

			expect(dialogService.showErrorDialog).toHaveBeenCalledWith("")
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