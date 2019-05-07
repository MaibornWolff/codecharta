import { LoadingGifService } from "./loadingGif.service"

describe("LoadingGifService", () => {
	let loadingGifService: LoadingGifService

	beforeEach(() => {
		loadingGifService = new LoadingGifService()

	})

	describe("updateLoadingFileFlag", () => {
		it("should set isLoadingFile to true", () => {
			loadingGifService.updateLoadingFileFlag(true)

			expect(loadingGifService["isLoadingFile"]).toBeTruthy()
		})

		it("should set isLoadingFile to false", () => {
			loadingGifService.updateLoadingFileFlag(false)

			expect(loadingGifService["isLoadingFile"]).toBeFalsy()
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
	})
})