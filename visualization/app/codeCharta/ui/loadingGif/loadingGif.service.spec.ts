import { LoadingGifService } from "./loadingGif.service"
import { IRootScopeService } from "angular"
import { getService } from "../../../../mocks/ng.mockhelper"

describe("LoadingGifService", () => {
	let loadingGifService: LoadingGifService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		$rootScope = getService<IRootScopeService>("$rootScope")
		loadingGifService = new LoadingGifService($rootScope)
		withMockedEventMethods()
	})

	function withMockedEventMethods() {
		$rootScope.$broadcast = jest.fn()
	}

	describe("updateLoadingFileFlag", () => {
		it("should set isLoadingFile to true", () => {
			loadingGifService.updateLoadingFileFlag(true)

			expect(loadingGifService["isLoadingFile"]).toBeTruthy()
		})

		it("should set isLoadingFile to false", () => {
			loadingGifService.updateLoadingFileFlag(false)

			expect(loadingGifService["isLoadingFile"]).toBeFalsy()
		})

		it("should broadcast LOADING_FILE_STATUS_EVENT", () => {
			loadingGifService.updateLoadingFileFlag(false)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("loading-file-status-changed", false)
		})
	})

	describe("updateLoadingMapFlag", () => {
		it("should set isLoadingMap to true", () => {
			loadingGifService.updateLoadingMapFlag(true)

			expect(loadingGifService["isLoadingMap"]).toBeTruthy()
		})

		it("should set isLoadingMap to false", () => {
			loadingGifService.updateLoadingMapFlag(false)

			expect(loadingGifService["isLoadingMap"]).toBeFalsy()
		})

		it("should broadcast LOADING_MAP_STATUS_EVENT", () => {
			loadingGifService.updateLoadingMapFlag(false)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("loading-map-status-changed", false)
		})
	})
	describe("isLoadingNewFile", () => {
		it("should return true, when isLoadingFile is true", () => {
			loadingGifService["isLoadingFile"] = true

			const result: boolean = loadingGifService.isLoadingNewFile()

			expect(result).toBeTruthy()
		})
		it("should return false, when isLoadingFile is true", () => {
			loadingGifService["isLoadingFile"] = false

			const result: boolean = loadingGifService.isLoadingNewFile()

			expect(result).toBeFalsy()
		})
	})
	describe("isLoadingNewMap", () => {
		it("should return true, when isLoadingMap is true", () => {
			loadingGifService["isLoadingMap"] = true

			const result: boolean = loadingGifService.isLoadingNewMap()

			expect(result).toBeTruthy()
		})
		it("should return false, when isLoadingMap is true", () => {
			loadingGifService["isLoadingMap"] = false

			const result: boolean = loadingGifService.isLoadingNewMap()

			expect(result).toBeFalsy()
		})
	})
})
