import { sortingDialogOption } from "./sortingDialogOption.reducer"
import { SortingDialogOptionAction, setSortingDialogOption } from "./sortingDialogOption.actions"
import { SortingOption } from "../../../../codeCharta.model"

describe("sortingDialogOption", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = sortingDialogOption(undefined, {} as SortingDialogOptionAction)

			expect(result).toEqual(SortingOption.Name)
		})
	})

	describe("Action: SET_SORTING_DIALOG_OPTION", () => {
		it("should set new sortingDialogOption", () => {
			const result = sortingDialogOption(SortingOption.Name, setSortingDialogOption(SortingOption.Childnodes))

			expect(result).toEqual(SortingOption.Childnodes)
		})

		it("should set default sortingDialogOption", () => {
			const result = sortingDialogOption(SortingOption.Childnodes, setSortingDialogOption())

			expect(result).toEqual(SortingOption.Name)
		})
	})
})
