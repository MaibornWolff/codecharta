import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { ShowMetricLabelNameValueStore } from "./showMetricLabelNameValue.store"
import { showMetricLabelNameValueSelector } from "../selectors/labelSettings.selectors"
import { setShowMetricLabelNameValue } from "../../../state/store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { getLastAction } from "../../../util/testUtils/store.utils"

describe("ShowMetricLabelNameValueStore", () => {
    let store: ShowMetricLabelNameValueStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ShowMetricLabelNameValueStore,
                provideMockStore({ selectors: [{ selector: showMetricLabelNameValueSelector, value: false }] })
            ]
        })

        store = TestBed.inject(ShowMetricLabelNameValueStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("showMetricLabelNameValue$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(showMetricLabelNameValueSelector, true)
            mockStore.refreshState()

            // Act & Assert
            store.showMetricLabelNameValue$.subscribe(value => {
                expect(value).toBe(true)
                done()
            })
        })
    })

    describe("setShowMetricLabelNameValue", () => {
        it("should dispatch setShowMetricLabelNameValue action", async () => {
            // Arrange & Act
            store.setShowMetricLabelNameValue(true)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setShowMetricLabelNameValue({ value: true }))
        })
    })
})
