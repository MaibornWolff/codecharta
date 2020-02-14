import "./loadingGif.module"
import { LoadingGifController } from "./loadingGif.component"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { IRootScopeService, ITimeoutService } from "angular"
import { IsLoadingFileService } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.service"
import { IsLoadingMapService } from "../../state/store/appSettings/isLoadingMap/isLoadingMap.service"

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
			IsLoadingFileService.subscribe = jest.fn()
			IsLoadingMapService.subscribe = jest.fn()
		})

		it("should subscribeToFilesSelection to LoadingFileService", () => {
			rebuildController()

			expect(IsLoadingFileService.subscribe).toHaveBeenCalledWith($rootScope, loadingGifController)
		})

		it("should subscribeToFilesSelection to LoadingMapService", () => {
			rebuildController()

			expect(IsLoadingMapService.subscribe).toHaveBeenCalledWith($rootScope, loadingGifController)
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
			loadingGifController.onIsLoadingFileChanged(true)

			expect(loadingGifController["_viewModel"].isLoadingFile).toBe(true)
		})

		it("should set isLoadingFile in viewModel", () => {
			loadingGifController.onIsLoadingFileChanged(false)

			expect(loadingGifController["_viewModel"].isLoadingFile).toBe(false)
		})
	})

	describe("onLoadingMapStatusChanged", () => {
		it("should set isLoadingMap in viewModel", () => {
			loadingGifController.onIsLoadingMapChanged(true)

			expect(loadingGifController["_viewModel"].isLoadingMap).toBe(true)
		})

		it("should set isLoadingMap in viewModel", () => {
			loadingGifController.onIsLoadingMapChanged(false)

			expect(loadingGifController["_viewModel"].isLoadingMap).toBe(false)
		})
	})
})
