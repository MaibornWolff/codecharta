import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { LabelModeStore } from "./labelMode.store"
import { labelModeSelector } from "../selectors/labelSettings.selectors"
import { setLabelMode } from "../../../state/store/appSettings/labelMode/labelMode.actions"
import { getLastAction } from "../../../util/testUtils/store.utils"
import { LabelMode } from "../../../codeCharta.model"

describe("LabelModeStore", () => {
    let store: LabelModeStore
    let mockStore: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [LabelModeStore, provideMockStore({ selectors: [{ selector: labelModeSelector, value: LabelMode.Height }] })]
        })

        store = TestBed.inject(LabelModeStore)
        mockStore = TestBed.inject(MockStore)
    })

    describe("labelMode$", () => {
        it("should emit Height from selector", done => {
            // Arrange
            mockStore.overrideSelector(labelModeSelector, LabelMode.Height)
            mockStore.refreshState()

            // Act & Assert
            store.labelMode$.subscribe(value => {
                expect(value).toBe(LabelMode.Height)
                done()
            })
        })

        it("should emit Color when selector returns Color", done => {
            // Arrange
            mockStore.overrideSelector(labelModeSelector, LabelMode.Color)
            mockStore.refreshState()

            // Act & Assert
            store.labelMode$.subscribe(value => {
                expect(value).toBe(LabelMode.Color)
                done()
            })
        })
    })

    describe("setLabelMode", () => {
        it("should dispatch setLabelMode action with Height", async () => {
            // Arrange & Act
            store.setLabelMode(LabelMode.Height)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setLabelMode({ value: LabelMode.Height }))
        })

        it("should dispatch setLabelMode action with Color", async () => {
            // Arrange & Act
            store.setLabelMode(LabelMode.Color)

            // Assert
            expect(await getLastAction(mockStore)).toEqual(setLabelMode({ value: LabelMode.Color }))
        })
    })
})
