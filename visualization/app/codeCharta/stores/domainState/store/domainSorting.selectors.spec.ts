import { CcState, SortingOption } from "../../../model/codeCharta.model"
import { defaultState } from "../../rootStore/state.manager"
import { domainStateSortingOrderAscendingSelector, domainStateSortingOrderSelector } from "./domainSorting.selectors"

describe("domain sorting selectors", () => {
    it("should read the domain view's own sorting order and direction", () => {
        // Arrange
        const state: CcState = {
            ...defaultState,
            domainState: { ...defaultState.domainState, sortingOrder: SortingOption.NUMBER_OF_FILES, sortingOrderAscending: false }
        }

        // Act & Assert
        expect(domainStateSortingOrderSelector(state)).toBe(SortingOption.NUMBER_OF_FILES)
        expect(domainStateSortingOrderAscendingSelector(state)).toBe(false)
    })
})
