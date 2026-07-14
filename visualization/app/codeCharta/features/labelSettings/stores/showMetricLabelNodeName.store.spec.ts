import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { showMetricLabelNodeNameSelector } from "../../../stores/mapState/mapState.read.facade"
import { setShowMetricLabelNodeName } from "../../../stores/mapState/mapState.write.facade"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { ShowMetricLabelNodeNameStore } from "./showMetricLabelNodeName.store"

describe("ShowMetricLabelNodeNameStore", () => {
    let store: ShowMetricLabelNodeNameStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ShowMetricLabelNodeNameStore,
                provideMockStore({ selectors: [{ selector: showMetricLabelNodeNameSelector, value: true }] })
            ]
        })

        store = TestBed.inject(ShowMetricLabelNodeNameStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("showMetricLabelNodeName$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(showMetricLabelNodeNameSelector, false)
            mockStore.refreshState()

            // Act & Assert
            store.showMetricLabelNodeName$.subscribe(value => {
                expect(value).toBe(false)
                done()
            })
        })
    })

    describe("setShowMetricLabelNodeName", () => {
        it("should dispatch setShowMetricLabelNodeName action", async () => {
            // Arrange & Act
            store.setShowMetricLabelNodeName(false)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setShowMetricLabelNodeName({ value: false }))
        })
    })
})
