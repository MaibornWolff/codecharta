import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { AutomaticCameraResetStore } from "./automaticCameraReset.store"
import { resetCameraIfNewFileIsLoadedSelector } from "../selectors/globalSettings.selectors"
import { setResetCameraIfNewFileIsLoaded } from "../../../state/store/appSettings/resetCameraIfNewFileIsLoaded/resetCameraIfNewFileIsLoaded.actions"
import { getLastAction } from "../../../util/testUtils/store.utils"

describe("AutomaticCameraResetStore", () => {
    let store: AutomaticCameraResetStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AutomaticCameraResetStore,
                provideMockStore({
                    selectors: [{ selector: resetCameraIfNewFileIsLoadedSelector, value: true }]
                })
            ]
        })

        store = TestBed.inject(AutomaticCameraResetStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("resetCameraIfNewFileIsLoaded$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(resetCameraIfNewFileIsLoadedSelector, true)
            mockStore.refreshState()

            // Act & Assert
            store.resetCameraIfNewFileIsLoaded$.subscribe(value => {
                expect(value).toBe(true)
                done()
            })
        })

        it("should emit false when selector returns false", done => {
            // Arrange
            mockStore.overrideSelector(resetCameraIfNewFileIsLoadedSelector, false)
            mockStore.refreshState()

            // Act & Assert
            store.resetCameraIfNewFileIsLoaded$.subscribe(value => {
                expect(value).toBe(false)
                done()
            })
        })
    })

    describe("setResetCameraIfNewFileIsLoaded", () => {
        it("should dispatch setResetCameraIfNewFileIsLoaded action with true", async () => {
            // Arrange & Act
            store.setResetCameraIfNewFileIsLoaded(true)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setResetCameraIfNewFileIsLoaded({ value: true }))
        })

        it("should dispatch setResetCameraIfNewFileIsLoaded action with false", async () => {
            // Arrange & Act
            store.setResetCameraIfNewFileIsLoaded(false)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setResetCameraIfNewFileIsLoaded({ value: false }))
        })
    })
})
