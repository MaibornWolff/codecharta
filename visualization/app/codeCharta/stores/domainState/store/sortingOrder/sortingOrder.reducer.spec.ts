import { SortingOption } from "../../../../model/codeCharta.model"
import { setDomainStateSortingOrder } from "./sortingOrder.actions"
import { defaultSortingOrder, sortingOrder } from "./sortingOrder.reducer"

describe("sortingOrder reducer", () => {
    it("should default to sorting by name", () => {
        // Arrange & Act & Assert
        expect(defaultSortingOrder).toBe(SortingOption.NAME)
    })

    it("should set the sorting order", () => {
        // Arrange & Act
        const result = sortingOrder(defaultSortingOrder, setDomainStateSortingOrder({ value: SortingOption.NUMBER_OF_FILES }))

        // Assert
        expect(result).toBe(SortingOption.NUMBER_OF_FILES)
    })

    it("should reset to the default on an undefined value", () => {
        // Arrange & Act
        const result = sortingOrder(
            SortingOption.NUMBER_OF_FILES,
            setDomainStateSortingOrder({ value: undefined as unknown as SortingOption })
        )

        // Assert
        expect(result).toBe(defaultSortingOrder)
    })
})
