import { setDomainStateSortingOrderAscending } from "./sortingOrderAscending.actions"
import { defaultSortingOrderAscending, sortingOrderAscending } from "./sortingOrderAscending.reducer"

describe("sortingOrderAscending reducer", () => {
    it("should default to ascending", () => {
        // Arrange & Act & Assert
        expect(defaultSortingOrderAscending).toBe(true)
    })

    it("should set the ascending flag", () => {
        // Arrange & Act
        const result = sortingOrderAscending(defaultSortingOrderAscending, setDomainStateSortingOrderAscending({ value: false }))

        // Assert
        expect(result).toBe(false)
    })
})
