import { sortingOrderAscending } from "./sortingOrderAscending.reducer"
import { SortingOrderAscendingAction, setSortingOrderAscending, toggleSortingOrderAscending } from "./sortingOrderAscending.actions"

describe("sortingOrderAscending", () => {
	describe("Default State", () => {
		it("should initialize the default state", () => {
			const result = sortingOrderAscending(undefined, {} as SortingOrderAscendingAction)

			expect(result).toEqual(false)
		})
	})

	describe("Action: SET_SORTING_ORDER_ASCENDING", () => {
		it("should set new sortingOrderAscending", () => {
			const result = sortingOrderAscending(false, setSortingOrderAscending(true))

			expect(result).toEqual(true)
		})

		it("should set default sortingOrderAscending", () => {
			const result = sortingOrderAscending(true, setSortingOrderAscending())

			expect(result).toEqual(false)
		})
	})

	describe("Action: TOGGLE_SORTING_ORDER_ASCENDING", () => {
		it("should toggle state", () => {
			const result = sortingOrderAscending(false, setSortingOrderAscending(true))
			const toggledResult = sortingOrderAscending(result, toggleSortingOrderAscending())

			expect(toggledResult).toBe(!result)
		})
	})
})
