import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { InspectorIsDeltaStateStore } from "./isDeltaState.store"

describe("InspectorIsDeltaStateStore", () => {
    let store: InspectorIsDeltaStateStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [InspectorIsDeltaStateStore, provideMockStore({ selectors: [{ selector: isDeltaStateSelector, value: false }] })]
        })

        store = TestBed.inject(InspectorIsDeltaStateStore)
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
