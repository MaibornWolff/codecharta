import "./codeCharta.module"
import { TestBed } from "@angular/core/testing"
import { CodeChartaController } from "./codeCharta.component"
import { getService, instantiateModule } from "../../mocks/ng.mockhelper"
import { StoreService } from "./state/store.service"
import { ThreeCameraService } from "./ui/codeMap/threeViewer/threeCamera.service"
import { LoadInitialFileService } from "./services/loadFile/loadInitialFile/loadInitialFile.service"

describe("codeChartaController", () => {
	let threeCameraService: ThreeCameraService

	let storeService: StoreService
	let loadInitialFileService: LoadInitialFileService

	function restartSystem() {
		instantiateModule("app.codeCharta")

		storeService = getService<StoreService>("storeService")
		threeCameraService = TestBed.inject(ThreeCameraService)
		loadInitialFileService = { loadFileOrSample: jest.fn() } as unknown as LoadInitialFileService
	}

	function rebuildController() {
		new CodeChartaController(storeService, loadInitialFileService)
	}

	function initThreeCameraService() {
		// Has to be called, to initialize the camera
		threeCameraService.init(1536, 754)
	}

	function initialize() {
		restartSystem()
		initThreeCameraService()
		localStorage.clear()
	}

	describe("constructor", () => {
		beforeEach(() => {
			initialize()
		})

		it("should show loading file gif", () => {
			rebuildController()
			expect(storeService.getState().appSettings.isLoadingFile).toBeTruthy()
		})

		it("should load file or sample", () => {
			rebuildController()
			expect(loadInitialFileService.loadFileOrSample).toHaveBeenCalled()
		})
	})
})
