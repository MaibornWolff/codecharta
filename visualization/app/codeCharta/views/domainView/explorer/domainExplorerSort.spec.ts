import { TestBed } from "@angular/core/testing"
import { Store } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { firstValueFrom } from "rxjs"
import { provideMockState } from "../../../mocks/state.mocks"
import { SortingOption } from "../../../model/codeCharta.model"
import {
    domainStateSortingOrderAscendingSelector,
    domainStateSortingOrderSelector
} from "../../../stores/domainState/domainState.read.facade"
import { setDomainStateSortingOrder, setDomainStateSortingOrderAscending } from "../../../stores/domainState/domainState.write.facade"
import { DomainExplorerSort } from "./domainExplorerSort"

describe("DomainExplorerSort", () => {
    function setup(ascending = true) {
        TestBed.configureTestingModule({
            providers: [
                DomainExplorerSort,
                provideMockState(),
                provideMockStore({
                    selectors: [
                        { selector: domainStateSortingOrderSelector, value: SortingOption.NUMBER_OF_FILES },
                        { selector: domainStateSortingOrderAscendingSelector, value: ascending }
                    ]
                })
            ]
        })
        return { sort: TestBed.inject(DomainExplorerSort), dispatchSpy: jest.spyOn(TestBed.inject(Store), "dispatch") }
    }

    it("should stream the domain view's OWN sort option and order", async () => {
        // Arrange
        const { sort } = setup(false)

        // Act & Assert
        expect(await firstValueFrom(sort.option$)).toBe(SortingOption.NUMBER_OF_FILES)
        expect(await firstValueFrom(sort.ascending$)).toBe(false)
    })

    it("should dispatch the domain-local setSortingOrder on setOption", () => {
        // Arrange
        const { sort, dispatchSpy } = setup()

        // Act
        sort.setOption(SortingOption.NAME)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setDomainStateSortingOrder({ value: SortingOption.NAME }))
    })

    it("should flip its own ascending flag on toggleAscending", () => {
        // Arrange — currently ascending, so a toggle sets it to false
        const { sort, dispatchSpy } = setup(true)

        // Act
        sort.toggleAscending()

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setDomainStateSortingOrderAscending({ value: false }))
    })
})
