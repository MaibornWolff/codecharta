import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { ExperimentalFeaturesStore } from "./experimentalFeatures.store"
import { experimentalFeaturesEnabledSelector } from "../selectors/globalSettings.selectors"
import { setExperimentalFeaturesEnabled } from "../../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { getLastAction } from "../../../util/testUtils/store.utils"

describe("ExperimentalFeaturesStore", () => {
    let store: ExperimentalFeaturesStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ExperimentalFeaturesStore,
                provideMockStore({
                    selectors: [{ selector: experimentalFeaturesEnabledSelector, value: false }]
                })
            ]
        })

        store = TestBed.inject(ExperimentalFeaturesStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("experimentalFeaturesEnabled$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(experimentalFeaturesEnabledSelector, true)
            mockStore.refreshState()

            // Act & Assert
            store.experimentalFeaturesEnabled$.subscribe(value => {
                expect(value).toBe(true)
                done()
            })
        })

        it("should emit false when selector returns false", done => {
            // Arrange
            mockStore.overrideSelector(experimentalFeaturesEnabledSelector, false)
            mockStore.refreshState()

            // Act & Assert
            store.experimentalFeaturesEnabled$.subscribe(value => {
                expect(value).toBe(false)
                done()
            })
        })
    })

    describe("setExperimentalFeaturesEnabled", () => {
        it("should dispatch setExperimentalFeaturesEnabled action with true", async () => {
            // Arrange & Act
            store.setExperimentalFeaturesEnabled(true)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setExperimentalFeaturesEnabled({ value: true }))
        })

        it("should dispatch setExperimentalFeaturesEnabled action with false", async () => {
            // Arrange & Act
            store.setExperimentalFeaturesEnabled(false)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setExperimentalFeaturesEnabled({ value: false }))
        })
    })
})
