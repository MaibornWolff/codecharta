import { isLoadingFile } from "./isLoadingFile.reducer"
import { IsLoadingFileAction, setIsLoadingFile } from "./isLoadingFile.actions"

describe("isLoadingFile", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = isLoadingFile(undefined, {} as IsLoadingFileAction)

			expect(result).toEqual(true)
		})
	})

	describe("Action: SET_IS_LOADING_FILE", () => {
		it("should set new isLoadingFile", () => {
			const result = isLoadingFile(true, setIsLoadingFile(false))

			expect(result).toEqual(false)
		})

		it("should set default isLoadingFile", () => {
			const result = isLoadingFile(false, setIsLoadingFile())

			expect(result).toEqual(true)
		})
	})
})
