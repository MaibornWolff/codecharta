import "./codeCharta.module"
import { IHttpService, ILocationService } from "angular"
import { DialogService } from "./ui/dialog/dialog.service"
import { CodeChartaService } from "./codeCharta.service"
import { CodeChartaController } from "./codeCharta.component"
import { getService, instantiateModule } from "../../mocks/ng.mockhelper"
import { InjectorService } from "./state/injector.service"
import { StoreService } from "./state/store.service"
import { setAppSettings } from "./state/store/appSettings/appSettings.actions"
import { ThreeCameraService } from "./ui/codeMap/threeViewer/threeCameraService"
import { setSearchPanelMode } from "./state/store/appSettings/searchPanelMode/searchPanelMode.actions"
import { PanelSelection, SearchPanelMode } from "./codeCharta.model"
import { CodeChartaMouseEventService } from "./codeCharta.mouseEvent.service"
import { setPanelSelection } from "./state/store/appSettings/panelSelection/panelSelection.actions"

describe("codeChartaController", () => {
	let codeChartaController: CodeChartaController
	let threeCameraService: ThreeCameraService
	let $location: ILocationService
	let $http: IHttpService
	let storeService: StoreService
	let dialogService: DialogService
	let codeChartaService: CodeChartaService
	let codeChartaMouseEventService: CodeChartaMouseEventService
	let injectorService: InjectorService

	beforeEach(() => {
		restartSystem()
		rebuildController()
		initThreeCameraService()
		withMockedUrlUtils()
		withMockedCodeChartaService()
		withMockedDialogService()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta")

		$location = getService<ILocationService>("$location")
		$http = getService<IHttpService>("$http")
		storeService = getService<StoreService>("storeService")
		threeCameraService = getService<ThreeCameraService>("threeCameraService")
		dialogService = getService<DialogService>("dialogService")
		codeChartaService = getService<CodeChartaService>("codeChartaService")
		codeChartaMouseEventService = getService<CodeChartaMouseEventService>("codeChartaMouseEventService")
		injectorService = getService<InjectorService>("injectorService")
	}

	function rebuildController() {
		codeChartaController = new CodeChartaController(
			$location,
			$http,
			storeService,
			dialogService,
			codeChartaService,
			codeChartaMouseEventService,
			injectorService
		)
	}

	function withMockedUrlUtils() {
		codeChartaController["urlUtils"] = jest.fn().mockReturnValue({
			getFileDataFromQueryParam: jest.fn().mockReturnValue(Promise.resolve([])),
			getParameterByName: jest.fn().mockReturnValue(true)
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

	function initThreeCameraService() {
		// Has to be called, to initialize the camera
		threeCameraService.init(1536, 754)
	}

	describe("constructor", () => {
		it("should set urlUtils", () => {
			rebuildController()

			expect(codeChartaController["urlUtils"]).toBeDefined()
		})

		it("should show loading file gif", () => {
			rebuildController()

			expect(storeService.getState().appSettings.isLoadingFile).toBeTruthy()
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

		it("should call storeService.dispatch if loadFiles-Promise resolves", async () => {
			codeChartaController["urlUtils"].getFileDataFromQueryParam = jest.fn().mockReturnValue(Promise.resolve([{}]))
			storeService.dispatch = jest.fn()

			await codeChartaController.loadFileOrSample()

			expect(storeService.dispatch).toHaveBeenCalledWith(setAppSettings())
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

		it("should call loadFiles with sample files", () => {
			const expected = [
				{ fileName: "sample1.cc.json", content: require("./assets/sample1.cc.json") },
				{ fileName: "sample2.cc.json", content: require("./assets/sample2.cc.json") }
			]

			codeChartaController.tryLoadingSampleFiles()

			expect(codeChartaService.loadFiles).toHaveBeenCalledWith(expected)
		})
	})

	describe("onClick", () => {
		it("should minimize all panels", () => {
			storeService.dispatch(setSearchPanelMode(SearchPanelMode.exclude))
			storeService.dispatch(setPanelSelection(PanelSelection.AREA_PANEL_OPEN))

			codeChartaController.onClick()

			const appSettings = storeService.getState().appSettings

			expect(appSettings.searchPanelMode).toEqual(SearchPanelMode.minimized)
			expect(appSettings.panelSelection).toEqual(PanelSelection.NONE)
		})
	})
})
