import { searchPattern } from "./searchPattern.reducer"
import { SearchPatternAction, setSearchPattern } from "./searchPattern.actions"
import { setStandard } from "../../files/files.actions"

describe("searchPattern", () => {
	it("should initialize the default state", () => {
		const result = searchPattern(undefined, {} as SearchPatternAction)
		expect(result).toEqual("")
	})

	it("should set new searchPattern", () => {
		const result = searchPattern("", setSearchPattern("mySearch/*.ts"))
		expect(result).toEqual("mySearch/*.ts")
	})

	it("should set default searchPattern", () => {
		const result = searchPattern("mySearch/*.ts", setSearchPattern())
		expect(result).toEqual("")
	})

	it("should reset searchPattern on FilesSelectionActions", () => {
		const result = searchPattern("mySearch/*.ts", setStandard([]))
		expect(result).toBe("")
	})
})
