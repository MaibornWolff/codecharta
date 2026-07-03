import { sortingOption } from "./sorting.reducer"
import { setSortingOption } from "./sorting.actions"
import { SortingOption } from "../../../codeCharta.model"

describe("sortingOption", () => {
    it("should set new sortingOption", () => {
        const result = sortingOption(SortingOption.NAME, setSortingOption({ value: SortingOption.NUMBER_OF_FILES }))

        expect(result).toEqual(SortingOption.NUMBER_OF_FILES)
    })
})
