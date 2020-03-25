import { sortingDialogOption } from "./sortingDialogOption.reducer"
import { SortingDialogOptionAction, setSortingDialogOption } from "./sortingDialogOption.actions"
import { SortingOption } from "../../../../codeCharta.model"

describe("sortingDialogOption", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = sortingDialogOption(undefined, {} as SortingDialogOptionAction)

			expect(result).toEqual(SortingOption.NAME)
		})
	})

	describe("Action: SET_SORTING_DIALOG_OPTION", () => {
		it("should set new sortingDialogOption", () => {
			const result = sortingDialogOption(SortingOption.NAME, setSortingDialogOption(SortingOption.NUMBER_OF_FILES))

			expect(result).toEqual(SortingOption.NUMBER_OF_FILES)
		})

		it("should set default sortingDialogOption", () => {
			const result = sortingDialogOption(SortingOption.NUMBER_OF_FILES, setSortingDialogOption())

			expect(result).toEqual(SortingOption.NAME)
		})
	})
})
