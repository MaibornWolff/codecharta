import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { setColorLabels } from "../../../state/store/appSettings/colorLabels/colorLabels.actions"
import { LabelSettingsPanelComponent } from "./labelSettingsPanel.component"
import { Store, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"

describe("LabelSettingsPanelComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [LabelSettingsPanelComponent, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
    })

    it("should display top labels slider", async () => {
        await render(LabelSettingsPanelComponent)
        expect(screen.getByTitle("Display the labels of the 1 highest buildings")).not.toBe(null)
    })

    it("should never disable top labels slider when color labels are active", async () => {
        const { detectChanges } = await render(LabelSettingsPanelComponent)
        const store = TestBed.inject(Store)
        store.dispatch(setColorLabels({ value: { positive: true, negative: false, neutral: false } }))
        detectChanges()

        expect(screen.getByTitle("Display the labels of the 1 highest buildings")).not.toBe(null)
    })

    it("should display show node names checkbox", async () => {
        await render(LabelSettingsPanelComponent)
        expect(screen.queryByText("Show node names")).not.toBe(null)
    })

    it("should display show metric values checkbox", async () => {
        await render(LabelSettingsPanelComponent)
        expect(screen.queryByText("Show metric values")).not.toBe(null)
    })

    it("should display color label swatches", async () => {
        await render(LabelSettingsPanelComponent)
        expect(screen.getByRole("checkbox", { name: "positive color label" })).not.toBe(null)
        expect(screen.getByRole("checkbox", { name: "neutral color label" })).not.toBe(null)
        expect(screen.getByRole("checkbox", { name: "negative color label" })).not.toBe(null)
    })

    it("should dispatch setColorLabels when toggling negative color label", async () => {
        await render(LabelSettingsPanelComponent)
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")

        const negativeCheckbox = screen.getByRole("checkbox", { name: "negative color label" })
        await userEvent.click(negativeCheckbox)

        expect(dispatchSpy).toHaveBeenCalledWith(setColorLabels({ value: { negative: true } }))
    })
})
