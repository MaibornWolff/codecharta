import { files } from "./files.reducer"
import { FilesAction, setFiles } from "./files.actions"

describe("files", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = files(undefined, {} as FilesAction)

			expect(result).toEqual([])
		})
	})

	describe("Action: SET_FILES", () => {
		it("should set new files", () => {
			const result = files([], setFiles([]))

			expect(result).toEqual([])
		})

		it("should set default files", () => {
			const result = files([], setFiles())

			expect(result).toEqual([])
		})
	})
})
