import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { BackgroundThemeStore } from "./backgroundTheme.store"
import { isWhiteBackgroundSelector } from "../selectors/globalSettings.selectors"
import { setIsWhiteBackground } from "../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { getLastAction } from "../../../util/testUtils/store.utils"

describe("BackgroundThemeStore", () => {
    let store: BackgroundThemeStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                BackgroundThemeStore,
                provideMockStore({
                    selectors: [{ selector: isWhiteBackgroundSelector, value: false }]
                })
            ]
        })

        store = TestBed.inject(BackgroundThemeStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("isWhiteBackground$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(isWhiteBackgroundSelector, true)
            mockStore.refreshState()

            // Act & Assert
            store.isWhiteBackground$.subscribe(value => {
                expect(value).toBe(true)
                done()
            })
        })

        it("should emit false when selector returns false", done => {
            // Arrange
            mockStore.overrideSelector(isWhiteBackgroundSelector, false)
            mockStore.refreshState()

            // Act & Assert
            store.isWhiteBackground$.subscribe(value => {
                expect(value).toBe(false)
                done()
            })
        })
    })

    describe("setWhiteBackground", () => {
        it("should dispatch setIsWhiteBackground action with true", async () => {
            // Arrange & Act
            store.setWhiteBackground(true)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setIsWhiteBackground({ value: true }))
        })

        it("should dispatch setIsWhiteBackground action with false", async () => {
            // Arrange & Act
            store.setWhiteBackground(false)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setIsWhiteBackground({ value: false }))
        })
    })
})
