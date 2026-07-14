import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { amountOfTopLabelsSelector } from "../../../stores/mapState/mapState.read.facade"
import { setAmountOfTopLabels } from "../../../stores/mapState/mapState.write.facade"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { AmountOfTopLabelsStore } from "./amountOfTopLabels.store"

describe("AmountOfTopLabelsStore", () => {
    let store: AmountOfTopLabelsStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AmountOfTopLabelsStore, provideMockStore({ selectors: [{ selector: amountOfTopLabelsSelector, value: 10 }] })]
        })

        store = TestBed.inject(AmountOfTopLabelsStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("amountOfTopLabels$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(amountOfTopLabelsSelector, 25)
            mockStore.refreshState()

            // Act & Assert
            store.amountOfTopLabels$.subscribe(value => {
                expect(value).toBe(25)
                done()
            })
        })
    })

    describe("setAmountOfTopLabels", () => {
        it("should dispatch setAmountOfTopLabels action with value", async () => {
            // Arrange & Act
            store.setAmountOfTopLabels(20)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setAmountOfTopLabels({ value: 20 }))
        })
    })
})
