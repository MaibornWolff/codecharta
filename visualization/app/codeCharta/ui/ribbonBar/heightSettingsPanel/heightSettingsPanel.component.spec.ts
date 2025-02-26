import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { setColorLabels } from "../../../state/store/appSettings/colorLabels/colorLabels.actions"
import { addFile, setDelta } from "../../../state/store/files/files.actions"
import { TEST_FILE_DATA } from "../../../util/dataMocks"
import { HeightSettingsPanelComponent } from "./heightSettingsPanel.component"
import { Store, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"

describe("HeightSettingsPanelComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HeightSettingsPanelComponent, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
    })

    it("should disable amount of top labels slider when there are colorLabels", async () => {
        const { detectChanges } = await render(HeightSettingsPanelComponent)
        const store = TestBed.inject(Store)
        store.dispatch(
            setColorLabels({
                value: {
                    positive: true,
                    negative: false,
                    neutral: false
                }
            })
        )
        detectChanges()

        const amountOfTopLabelsSlider = screen.getByTitle("Disabled because color labels are active")
        const matSlider = amountOfTopLabelsSlider.querySelector("mat-slider")
        expect(matSlider.getAttribute("ng-reflect-disabled")).toBe("true")
    })

    it("should display warning when color labels are active", async () => {
        const { detectChanges } = await render(HeightSettingsPanelComponent)
        const store = TestBed.inject(Store)
        store.dispatch(
            setColorLabels({
                value: {
                    positive: true,
                    negative: false,
                    neutral: false
                }
            })
        )
        detectChanges()

        const hint = screen.getByText("Color metric labels active")
        expect(hint).not.toBe(null)
    })

    it("should enable amount of top labels slider when there are no colorLabels", async () => {
        await render(HeightSettingsPanelComponent)

        const amountOfTopLabelsSlider = screen.getByTitle("Display the labels of the 1 highest buildings")
        const matSlider = amountOfTopLabelsSlider.querySelector("mat-slider")

        expect(matSlider.getAttribute("ng-reflect-disabled")).toBe("false")
    })

    it("should not display invertHeight-checkbox when being in delta mode", async () => {
        const { detectChanges } = await render(HeightSettingsPanelComponent)
        const store = TestBed.inject(Store)
        store.dispatch(addFile({ file: TEST_FILE_DATA }))
        store.dispatch(setDelta({ referenceFile: TEST_FILE_DATA, comparisonFile: TEST_FILE_DATA }))
        detectChanges()

        expect(screen.queryByText("Invert Height")).toBe(null)
    })

    it("should display invertHeight-checkbox when not being in delta mode", async () => {
        await render(HeightSettingsPanelComponent)
        expect(screen.queryByText("Invert Height")).not.toBe(null)
    })
})
