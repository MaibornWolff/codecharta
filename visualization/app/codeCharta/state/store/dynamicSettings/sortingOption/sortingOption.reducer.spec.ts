import { sortingOption } from "./sortingOption.reducer"
import { SortingOptionAction, setSortingOption } from "./sortingOption.actions"
import { SortingOption } from "../../../../codeCharta.model"

describe("sortingOption", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = sortingOption(undefined, {} as SortingOptionAction)

			expect(result).toEqual(SortingOption.NAME)
		})
	})

	describe("Action: SET_SORTING_OPTION", () => {
		it("should set new sortingOption", () => {
			const result = sortingOption(SortingOption.NAME, setSortingOption(SortingOption.NUMBER_OF_FILES))

			expect(result).toEqual(SortingOption.NUMBER_OF_FILES)
		})

		it("should set default sortingOption", () => {
			const result = sortingOption(SortingOption.NUMBER_OF_FILES, setSortingOption())

			expect(result).toEqual(SortingOption.NAME)
		})
	})
})
