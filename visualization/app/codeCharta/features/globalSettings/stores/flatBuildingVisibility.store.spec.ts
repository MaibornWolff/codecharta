import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { FlatBuildingVisibilityStore } from "./flatBuildingVisibility.store"
import { hideFlatBuildingsSelector } from "../selectors/globalSettings.selectors"
import { setHideFlatBuildings } from "../../../state/store/appSettings/hideFlatBuildings/hideFlatBuildings.actions"
import { getLastAction } from "../../../util/testUtils/store.utils"

describe("FlatBuildingVisibilityStore", () => {
    let store: FlatBuildingVisibilityStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                FlatBuildingVisibilityStore,
                provideMockStore({
                    selectors: [{ selector: hideFlatBuildingsSelector, value: false }]
                })
            ]
        })

        store = TestBed.inject(FlatBuildingVisibilityStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("hideFlatBuildings$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(hideFlatBuildingsSelector, true)
            mockStore.refreshState()

            // Act & Assert
            store.hideFlatBuildings$.subscribe(value => {
                expect(value).toBe(true)
                done()
            })
        })

        it("should emit false when selector returns false", done => {
            // Arrange
            mockStore.overrideSelector(hideFlatBuildingsSelector, false)
            mockStore.refreshState()

            // Act & Assert
            store.hideFlatBuildings$.subscribe(value => {
                expect(value).toBe(false)
                done()
            })
        })
    })

    describe("setHideFlatBuildings", () => {
        it("should dispatch setHideFlatBuildings action with true", async () => {
            // Arrange & Act
            store.setHideFlatBuildings(true)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setHideFlatBuildings({ value: true }))
        })

        it("should dispatch setHideFlatBuildings action with false", async () => {
            // Arrange & Act
            store.setHideFlatBuildings(false)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setHideFlatBuildings({ value: false }))
        })
    })
})
