import "./loadingGif.module"
import { LoadingGifController } from "./loadingGif.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService, ITimeoutService } from "angular"
import { LoadingGifService } from "./loadingGif.service"

describe("LoadingGifController", () => {
	let loadingGifController: LoadingGifController
	let $rootScope: IRootScopeService
	let $timeout: ITimeoutService

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.loadingGif")

		$rootScope = getService<IRootScopeService>("$rootScope")
		$timeout = getService<ITimeoutService>("$timeout")
	}

	function rebuildController() {
		loadingGifController = new LoadingGifController($rootScope, $timeout)
	}

	describe("constructor", () => {
		beforeEach(() => {
			LoadingGifService.subscribe = jest.fn()
		})

		it("should subscribe to LoadingGifService", () => {
			rebuildController()

			expect(LoadingGifService.subscribe).toHaveBeenCalledWith($rootScope, loadingGifController)
		})

		it("should set attribute isLoadingFile to true", () => {
			rebuildController()

			expect(loadingGifController["_viewModel"].isLoadingFile).toBeTruthy()
		})

		it("should set attribute isLoadingMap to true", () => {
			rebuildController()

			expect(loadingGifController["_viewModel"].isLoadingMap).toBeTruthy()
		})
	})

	describe("onLoadingFileStatusChanged", () => {
		it("should set isLoadingFile in viewModel", () => {
			loadingGifController.onLoadingFileStatusChanged(true)

			expect(loadingGifController["_viewModel"].isLoadingFile).toBe(true)
		})

		it("should set isLoadingFile in viewModel", () => {
			loadingGifController.onLoadingFileStatusChanged(false)

			expect(loadingGifController["_viewModel"].isLoadingFile).toBe(false)
		})
	})

	describe("onLoadingMapStatusChanged", () => {
		it("should set isLoadingMap in viewModel", () => {
			loadingGifController.onLoadingMapStatusChanged(true)

			expect(loadingGifController["_viewModel"].isLoadingMap).toBe(true)
		})

		it("should set isLoadingMap in viewModel", () => {
			loadingGifController.onLoadingMapStatusChanged(false)

			expect(loadingGifController["_viewModel"].isLoadingMap).toBe(false)
		})
	})
})
