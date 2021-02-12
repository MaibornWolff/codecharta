import { maxTreeMapFiles } from "./maxTreeMapFiles.reducer"
import { MaxTreeMapFilesAction, setMaxTreeMapFiles } from "./maxTreeMapFiles.actions"

describe("maxTreeMapFiles", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = maxTreeMapFiles(undefined, {} as MaxTreeMapFilesAction)

			expect(result).toEqual(100)
		})
	})

	describe("Action: SET_MAX_TREE_MAP_FILES", () => {
		it("should set new maxTreeMapFiles", () => {
			const result = maxTreeMapFiles(100, setMaxTreeMapFiles(200))

			expect(result).toEqual(200)
		})

		it("should set default maxTreeMapFiles", () => {
			const result = maxTreeMapFiles(200, setMaxTreeMapFiles())

			expect(result).toEqual(100)
		})
	})
})
