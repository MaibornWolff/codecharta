import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { Print3DStore } from "./3dPrint.store"
import {
    areaMetricSelector,
    heightMetricSelector,
    colorMetricSelector,
    colorRangeSelector,
    colorModeSelector,
    attributeDescriptorsSelector,
    blacklistSelector,
    print3DFilesSelector
} from "../selectors/3dPrint.selectors"
import { setColorMode } from "../../../state/store/dynamicSettings/colorMode/colorMode.actions"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { ColorMode } from "../../../codeCharta.model"

describe("Print3DStore", () => {
    let store: Print3DStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                Print3DStore,
                provideMockStore({
                    selectors: [
                        { selector: areaMetricSelector, value: "rloc" },
                        { selector: heightMetricSelector, value: "mcc" },
                        { selector: colorMetricSelector, value: "complexity" },
                        { selector: colorRangeSelector, value: { from: 10, to: 50 } },
                        { selector: colorModeSelector, value: ColorMode.absolute },
                        { selector: attributeDescriptorsSelector, value: {} },
                        { selector: blacklistSelector, value: [] },
                        { selector: print3DFilesSelector, value: [] }
                    ]
                })
            ]
        })

        store = TestBed.inject(Print3DStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("areaMetric$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(areaMetricSelector, "rloc")
            mockStore.refreshState()

            // Act & Assert
            store.areaMetric$.subscribe(value => {
                expect(value).toBe("rloc")
                done()
            })
        })
    })

    describe("heightMetric$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(heightMetricSelector, "mcc")
            mockStore.refreshState()

            // Act & Assert
            store.heightMetric$.subscribe(value => {
                expect(value).toBe("mcc")
                done()
            })
        })
    })

    describe("colorMetric$", () => {
        it("should emit value from selector", done => {
            // Arrange
            mockStore.overrideSelector(colorMetricSelector, "complexity")
            mockStore.refreshState()

            // Act & Assert
            store.colorMetric$.subscribe(value => {
                expect(value).toBe("complexity")
                done()
            })
        })
    })

    describe("colorMode$", () => {
        it("should emit absolute from selector", done => {
            // Arrange
            mockStore.overrideSelector(colorModeSelector, ColorMode.absolute)
            mockStore.refreshState()

            // Act & Assert
            store.colorMode$.subscribe(value => {
                expect(value).toBe(ColorMode.absolute)
                done()
            })
        })
    })

    describe("setColorMode", () => {
        it("should dispatch setColorMode action with absolute", async () => {
            // Arrange & Act
            store.setColorMode(ColorMode.absolute)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setColorMode({ value: ColorMode.absolute }))
        })

        it("should dispatch setColorMode action with weightedGradient", async () => {
            // Arrange & Act
            store.setColorMode(ColorMode.weightedGradient)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setColorMode({ value: ColorMode.weightedGradient }))
        })
    })
})
