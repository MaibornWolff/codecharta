import { searchPattern } from "./searchPattern.reducer"
import { SearchPatternAction, setSearchPattern } from "./searchPattern.actions"

describe("searchPattern", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = searchPattern(undefined, {} as SearchPatternAction)

			expect(result).toEqual("")
		})
	})

	describe("Action: SET_SEARCH_PATTERN", () => {
		it("should set new searchPattern", () => {
			const result = searchPattern("", setSearchPattern("mySearch/*.ts"))

			expect(result).toEqual("mySearch/*.ts")
		})

		it("should set default searchPattern", () => {
			const result = searchPattern("mySearch/*.ts", setSearchPattern())

			expect(result).toEqual("")
		})
	})
})
