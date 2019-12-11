import { LoadingStatusService } from "./loadingStatus.service"
import { IRootScopeService } from "angular"
import { getService } from "../../../mocks/ng.mockhelper"
import { withMockedEventMethods } from "../util/dataMocks"

describe("LoadingStatusService", () => {
	let loadingStatusService: LoadingStatusService
	let $rootScope: IRootScopeService

	beforeEach(() => {
		$rootScope = getService<IRootScopeService>("$rootScope")
		loadingStatusService = new LoadingStatusService($rootScope)
		withMockedEventMethods($rootScope)
	})

	describe("updateLoadingFileFlag", () => {
		it("should set isLoadingFile to true", () => {
			loadingStatusService.updateLoadingFileFlag(true)

			expect(loadingStatusService["isLoadingFile"]).toBeTruthy()
		})

		it("should set isLoadingFile to false", () => {
			loadingStatusService.updateLoadingFileFlag(false)

			expect(loadingStatusService["isLoadingFile"]).toBeFalsy()
		})

		it("should broadcast LOADING_FILE_STATUS_EVENT", () => {
			loadingStatusService.updateLoadingFileFlag(false)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("loading-file-status-changed", false)
		})
	})

	describe("updateLoadingMapFlag", () => {
		it("should set isLoadingMap to true", () => {
			loadingStatusService.updateLoadingMapFlag(true)

			expect(loadingStatusService["isLoadingMap"]).toBeTruthy()
		})

		it("should set isLoadingMap to false", () => {
			loadingStatusService.updateLoadingMapFlag(false)

			expect(loadingStatusService["isLoadingMap"]).toBeFalsy()
		})

		it("should broadcast LOADING_MAP_STATUS_EVENT", () => {
			loadingStatusService.updateLoadingMapFlag(false)

			expect($rootScope.$broadcast).toHaveBeenCalledWith("loading-map-status-changed", false)
		})
	})
	describe("isLoadingNewFile", () => {
		it("should return true, when isLoadingFile is true", () => {
			loadingStatusService["isLoadingFile"] = true

			const result: boolean = loadingStatusService.isLoadingNewFile()

			expect(result).toBeTruthy()
		})
		it("should return false, when isLoadingFile is true", () => {
			loadingStatusService["isLoadingFile"] = false

			const result: boolean = loadingStatusService.isLoadingNewFile()

			expect(result).toBeFalsy()
		})
	})
	describe("isLoadingNewMap", () => {
		it("should return true, when isLoadingMap is true", () => {
			loadingStatusService["isLoadingMap"] = true

			const result: boolean = loadingStatusService.isLoadingNewMap()

			expect(result).toBeTruthy()
		})
		it("should return false, when isLoadingMap is true", () => {
			loadingStatusService["isLoadingMap"] = false

			const result: boolean = loadingStatusService.isLoadingNewMap()

			expect(result).toBeFalsy()
		})
	})
})
