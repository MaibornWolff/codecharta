import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { DisplayQualityStore } from "./displayQuality.store"
import { sharpnessModeSelector } from "../selectors/globalSettings.selectors"
import { setSharpnessMode } from "../../../state/store/appSettings/sharpnessMode/sharpnessMode.actions"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { SharpnessMode } from "../../../codeCharta.model"

describe("DisplayQualityStore", () => {
    let store: DisplayQualityStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                DisplayQualityStore,
                provideMockStore({
                    selectors: [{ selector: sharpnessModeSelector, value: SharpnessMode.Standard }]
                })
            ]
        })

        store = TestBed.inject(DisplayQualityStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("sharpnessMode$", () => {
        it("should emit Standard from selector", done => {
            // Arrange
            mockStore.overrideSelector(sharpnessModeSelector, SharpnessMode.Standard)
            mockStore.refreshState()

            // Act & Assert
            store.sharpnessMode$.subscribe(value => {
                expect(value).toBe(SharpnessMode.Standard)
                done()
            })
        })

        it("should emit PixelRatioFXAA when selector returns PixelRatioFXAA", done => {
            // Arrange
            mockStore.overrideSelector(sharpnessModeSelector, SharpnessMode.PixelRatioFXAA)
            mockStore.refreshState()

            // Act & Assert
            store.sharpnessMode$.subscribe(value => {
                expect(value).toBe(SharpnessMode.PixelRatioFXAA)
                done()
            })
        })

        it("should emit PixelRatioAA when selector returns PixelRatioAA", done => {
            // Arrange
            mockStore.overrideSelector(sharpnessModeSelector, SharpnessMode.PixelRatioAA)
            mockStore.refreshState()

            // Act & Assert
            store.sharpnessMode$.subscribe(value => {
                expect(value).toBe(SharpnessMode.PixelRatioAA)
                done()
            })
        })
    })

    describe("setSharpnessMode", () => {
        it("should dispatch setSharpnessMode action with Standard", async () => {
            // Arrange & Act
            store.setSharpnessMode(SharpnessMode.Standard)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setSharpnessMode({ value: SharpnessMode.Standard }))
        })

        it("should dispatch setSharpnessMode action with PixelRatioFXAA", async () => {
            // Arrange & Act
            store.setSharpnessMode(SharpnessMode.PixelRatioFXAA)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setSharpnessMode({ value: SharpnessMode.PixelRatioFXAA }))
        })

        it("should dispatch setSharpnessMode action with PixelRatioAA", async () => {
            // Arrange & Act
            store.setSharpnessMode(SharpnessMode.PixelRatioAA)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setSharpnessMode({ value: SharpnessMode.PixelRatioAA }))
        })
    })
})
