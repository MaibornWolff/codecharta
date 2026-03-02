import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { AmountOfTopLabelsStore } from "./amountOfTopLabels.store"
import { amountOfTopLabelsSelector } from "../selectors/labelSettings.selectors"
import { setAmountOfTopLabels } from "../../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { getLastAction } from "../../../util/testUtils/store.utils"

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
