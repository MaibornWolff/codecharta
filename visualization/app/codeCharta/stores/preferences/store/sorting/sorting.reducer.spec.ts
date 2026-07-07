import { sorting, defaultSorting } from "./sorting.reducer"
import { setSortingOption, toggleSortingOrderAscending } from "./sorting.actions"
import { SortingOption } from "../../../../model/codeCharta.model"

describe("sorting", () => {
    describe("Action: SET_SORTING_OPTION", () => {
        it("should set the sort option and keep the order", () => {
            const result = sorting(
                { option: SortingOption.NAME, orderAscending: false },
                setSortingOption({ value: SortingOption.NUMBER_OF_FILES })
            )

            expect(result).toEqual({ option: SortingOption.NUMBER_OF_FILES, orderAscending: false })
        })

        it("should reset the option to its default on an undefined payload, keeping the order", () => {
            const result = sorting(
                { option: SortingOption.AREA_SIZE, orderAscending: false },
                setSortingOption({ value: undefined as unknown as SortingOption })
            )

            expect(result).toEqual({ option: defaultSorting.option, orderAscending: false })
        })
    })

    describe("Action: TOGGLE_SORTING_ORDER_ASCENDING", () => {
        it("should toggle the sort order and keep the option", () => {
            const result = sorting({ option: SortingOption.AREA_SIZE, orderAscending: false }, toggleSortingOrderAscending())

            expect(result).toEqual({ option: SortingOption.AREA_SIZE, orderAscending: true })
        })
    })
})
