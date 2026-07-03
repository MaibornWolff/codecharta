import { sorting } from "./sorting.reducer"
import { setSortingOption, setSortingOrderAscending, toggleSortingOrderAscending } from "./sorting.actions"
import { SortingOption } from "../../../codeCharta.model"

describe("sorting", () => {
    describe("Action: SET_SORTING_OPTION", () => {
        it("should set the sort option and keep the order", () => {
            const result = sorting(
                { option: SortingOption.NAME, orderAscending: false },
                setSortingOption({ value: SortingOption.NUMBER_OF_FILES })
            )

            expect(result).toEqual({ option: SortingOption.NUMBER_OF_FILES, orderAscending: false })
        })
    })

    describe("Action: SET_SORTING_ORDER_ASCENDING", () => {
        it("should set the sort order and keep the option", () => {
            const result = sorting({ option: SortingOption.AREA_SIZE, orderAscending: false }, setSortingOrderAscending({ value: true }))

            expect(result).toEqual({ option: SortingOption.AREA_SIZE, orderAscending: true })
        })
    })

    describe("Action: TOGGLE_SORTING_ORDER_ASCENDING", () => {
        it("should toggle the sort order and keep the option", () => {
            const result = sorting({ option: SortingOption.AREA_SIZE, orderAscending: false }, toggleSortingOrderAscending())

            expect(result).toEqual({ option: SortingOption.AREA_SIZE, orderAscending: true })
        })
    })
})
