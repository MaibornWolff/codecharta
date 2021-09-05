import { sortingOrderAscending } from "./sortingOrderAscending.reducer"
import { SortingOrderAscendingAction, toggleSortingOrderAscending } from "./sortingOrderAscending.actions"

describe("sortingOrderAscending", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = sortingOrderAscending(undefined, {} as SortingOrderAscendingAction)

			expect(result).toEqual(false)
		})
	})

	describe("Action: TOGGLE_SORTING_ORDER_ASCENDING", () => {
		it("should toggle from false to true", () => {
			const result = sortingOrderAscending(false, toggleSortingOrderAscending())

			expect(result).toEqual(true)
		})

		it("should toggle from true to false", () => {
			const result = sortingOrderAscending(true, toggleSortingOrderAscending())

			expect(result).toEqual(false)
		})
	})
})
