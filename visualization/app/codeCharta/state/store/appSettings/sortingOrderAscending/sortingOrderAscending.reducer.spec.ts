import { sortingOrderAscending } from "./sortingOrderAscending.reducer"
import { setSortingOrderAscending, toggleSortingOrderAscending } from "./sortingOrderAscending.actions"

describe("sortingOrderAscending", () => {
    describe("Action: SET_SORTING_ORDER_ASCENDING", () => {
        it("should set new sortingOrderAscending", () => {
            const result = sortingOrderAscending(false, setSortingOrderAscending({ value: true }))

            expect(result).toEqual(true)
        })
    })

    describe("Action: TOGGLE_SORTING_ORDER_ASCENDING", () => {
        it("should toggle state", () => {
            const result = sortingOrderAscending(false, setSortingOrderAscending({ value: true }))
            const toggledResult = sortingOrderAscending(result, toggleSortingOrderAscending())

            expect(toggledResult).toBe(!result)
        })
    })
})
