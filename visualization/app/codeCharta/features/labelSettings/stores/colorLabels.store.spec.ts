import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { ColorLabelsStore } from "./colorLabels.store"
import { colorLabelsSelector } from "../selectors/labelSettings.selectors"
import { setColorLabels } from "../../../state/store/appSettings/colorLabels/colorLabels.actions"
import { getLastAction } from "../../../util/testUtils/store.utils"

describe("ColorLabelsStore", () => {
    let store: ColorLabelsStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ColorLabelsStore,
                provideMockStore({
                    selectors: [{ selector: colorLabelsSelector, value: { positive: false, negative: false, neutral: false } }]
                })
            ]
        })

        store = TestBed.inject(ColorLabelsStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("colorLabels$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(colorLabelsSelector, { positive: true, negative: false, neutral: true })
            mockStore.refreshState()

            // Act & Assert
            store.colorLabels$.subscribe(value => {
                expect(value).toEqual({ positive: true, negative: false, neutral: true })
                done()
            })
        })
    })

    describe("setColorLabels", () => {
        it("should dispatch setColorLabels action with partial value", async () => {
            // Arrange & Act
            store.setColorLabels({ positive: true })

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setColorLabels({ value: { positive: true } }))
        })
    })
})
