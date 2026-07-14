import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { labelSizeSelector } from "../../../stores/mapState/mapState.read.facade"
import { setLabelSize } from "../../../stores/mapState/mapState.write.facade"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { LabelSizeStore } from "./labelSize.store"

describe("LabelSizeStore", () => {
    let store: LabelSizeStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [LabelSizeStore, provideMockStore({ selectors: [{ selector: labelSizeSelector, value: 1 }] })]
        })

        store = TestBed.inject(LabelSizeStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("labelSize$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(labelSizeSelector, 1.5)
            mockStore.refreshState()

            // Act & Assert
            store.labelSize$.subscribe(value => {
                expect(value).toBe(1.5)
                done()
            })
        })
    })

    describe("setLabelSize", () => {
        it("should dispatch setLabelSize action with value", async () => {
            // Arrange & Act
            store.setLabelSize(2)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setLabelSize({ value: 2 }))
        })
    })
})
