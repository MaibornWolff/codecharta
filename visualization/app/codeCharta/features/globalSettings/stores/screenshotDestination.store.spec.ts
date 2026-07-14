import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { screenshotToClipboardEnabledSelector } from "../../../stores/preferences/preferences.read.facade"
import { setScreenshotToClipboardEnabled } from "../../../stores/preferences/preferences.write.facade"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { ScreenshotDestinationStore } from "./screenshotDestination.store"

describe("ScreenshotDestinationStore", () => {
    let store: ScreenshotDestinationStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ScreenshotDestinationStore,
                provideMockStore({
                    selectors: [{ selector: screenshotToClipboardEnabledSelector, value: false }]
                })
            ]
        })

        store = TestBed.inject(ScreenshotDestinationStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("screenshotToClipboardEnabled$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(screenshotToClipboardEnabledSelector, true)
            mockStore.refreshState()

            // Act & Assert
            store.screenshotToClipboardEnabled$.subscribe(value => {
                expect(value).toBe(true)
                done()
            })
        })

        it("should emit false when selector returns false", done => {
            // Arrange
            mockStore.overrideSelector(screenshotToClipboardEnabledSelector, false)
            mockStore.refreshState()

            // Act & Assert
            store.screenshotToClipboardEnabled$.subscribe(value => {
                expect(value).toBe(false)
                done()
            })
        })
    })

    describe("setScreenshotToClipboard", () => {
        it("should dispatch setScreenshotToClipboardEnabled action with true", async () => {
            // Arrange & Act
            store.setScreenshotToClipboard(true)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setScreenshotToClipboardEnabled({ value: true }))
        })

        it("should dispatch setScreenshotToClipboardEnabled action with false", async () => {
            // Arrange & Act
            store.setScreenshotToClipboard(false)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setScreenshotToClipboardEnabled({ value: false }))
        })
    })
})
