import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { defaultMapColors, mapColorsSelector } from "../../../appearance/appearance.facade"
import { InspectorMapColorsStore } from "./mapColors.store"

describe("InspectorMapColorsStore", () => {
    let store: InspectorMapColorsStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                InspectorMapColorsStore,
                provideMockStore({ selectors: [{ selector: mapColorsSelector, value: defaultMapColors }] })
            ]
        })

        store = TestBed.inject(InspectorMapColorsStore)
        mockStore = TestBed.inject(MockStore)
    })

    it("should emit the map colors from the selector", done => {
        // Arrange
        const mapColors = { ...defaultMapColors, positiveDelta: "#00ff00" }
        mockStore.overrideSelector(mapColorsSelector, mapColors)
        mockStore.refreshState()

        // Act & Assert
        store.mapColors$.subscribe(value => {
            expect(value).toEqual(mapColors)
            done()
        })
    })
})
