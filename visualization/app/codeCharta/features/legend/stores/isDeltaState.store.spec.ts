import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { isDeltaStateSelector } from "../../../fileStore/store/isDeltaState.selector"
import { LegendIsDeltaStateStore } from "./isDeltaState.store"

describe("LegendIsDeltaStateStore", () => {
    let store: LegendIsDeltaStateStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [LegendIsDeltaStateStore, provideMockStore({ selectors: [{ selector: isDeltaStateSelector, value: false }] })]
        })

        store = TestBed.inject(LegendIsDeltaStateStore)
        mockStore = TestBed.inject(MockStore)
    })

    it("should emit the delta state from the selector", done => {
        // Arrange
        mockStore.overrideSelector(isDeltaStateSelector, true)
        mockStore.refreshState()

        // Act & Assert
        store.isDeltaState$.subscribe(value => {
            expect(value).toBe(true)
            done()
        })
    })
})
