import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { setColorLabels } from "../../../../state/store/appSettings/colorLabels/colorLabels.actions"
import { setLabelMode } from "../../../../state/store/appSettings/labelMode/labelMode.actions"
import { LabelSettingsPanelComponent } from "./labelSettingsPanel.component"
import { Store, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { BehaviorSubject } from "rxjs"
import { LabelMode } from "../../../../codeCharta.model"

describe("LabelSettingsPanelComponent", () => {
    let colorCategoryCounts$: BehaviorSubject<{ positive: number; neutral: number; negative: number }>

    beforeEach(() => {
        colorCategoryCounts$ = new BehaviorSubject({ positive: 5, neutral: 3, negative: 2 })
        TestBed.configureTestingModule({
            imports: [LabelSettingsPanelComponent, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })],
            providers: [{ provide: CodeMapRenderService, useValue: { colorCategoryCounts$: colorCategoryCounts$.asObservable() } }]
        })
    })

    it("should display top labels slider", async () => {
        // Arrange & Act
        await render(LabelSettingsPanelComponent)

        // Assert
        expect(screen.getByTitle("Display the labels of the 10 highest buildings")).not.toBe(null)
    })

    it("should never disable top labels slider when color labels are active", async () => {
        // Arrange
        const { detectChanges } = await render(LabelSettingsPanelComponent)
        const store = TestBed.inject(Store)

        // Act
        store.dispatch(setColorLabels({ value: { positive: true, negative: false, neutral: false } }))
        detectChanges()

        // Assert
        expect(screen.getByTitle("Display the labels of the 10 highest buildings")).not.toBe(null)
    })

    it("should display show node names checkbox", async () => {
        // Arrange & Act
        await render(LabelSettingsPanelComponent)

        // Assert
        expect(screen.queryByText("Show node names")).not.toBe(null)
    })

    it("should display show metric values checkbox", async () => {
        // Arrange & Act
        await render(LabelSettingsPanelComponent)

        // Assert
        expect(screen.queryByText("Show metric values")).not.toBe(null)
    })

    it("should display Height and Color toggle buttons", async () => {
        // Arrange & Act
        await render(LabelSettingsPanelComponent)

        // Assert
        expect(screen.getByText("Height")).not.toBe(null)
        expect(screen.getByText("Color")).not.toBe(null)
    })

    it("should dispatch setLabelMode when clicking Color button", async () => {
        // Arrange
        await render(LabelSettingsPanelComponent)
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")

        // Act
        await userEvent.click(screen.getByText("Color"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setLabelMode({ value: LabelMode.Color }))
    })

    it("should hide color label checkboxes in Height mode", async () => {
        // Arrange & Act
        await render(LabelSettingsPanelComponent)

        // Assert
        expect(screen.queryByText("By Color Metric")).toBe(null)
    })

    it("should display color label swatches in Color mode", async () => {
        // Arrange
        const { detectChanges } = await render(LabelSettingsPanelComponent)
        const store = TestBed.inject(Store)

        // Act
        store.dispatch(setLabelMode({ value: LabelMode.Color }))
        detectChanges()

        // Assert
        expect(screen.getByRole("checkbox", { name: "positive color label" })).not.toBe(null)
        expect(screen.getByRole("checkbox", { name: "neutral color label" })).not.toBe(null)
        expect(screen.getByRole("checkbox", { name: "negative color label" })).not.toBe(null)
    })

    it("should dispatch setColorLabels when toggling negative color label in Color mode", async () => {
        // Arrange
        const { detectChanges } = await render(LabelSettingsPanelComponent)
        const store = TestBed.inject(Store)
        store.dispatch(setLabelMode({ value: LabelMode.Color }))
        detectChanges()
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        const negativeCheckbox = screen.getByRole("checkbox", { name: "negative color label" })
        await userEvent.click(negativeCheckbox)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setColorLabels({ value: { negative: true } }))
    })

    it("should display building counts next to color label toggles in Color mode", async () => {
        // Arrange
        colorCategoryCounts$.next({ positive: 12, neutral: 7, negative: 0 })
        const { detectChanges } = await render(LabelSettingsPanelComponent)
        const store = TestBed.inject(Store)

        // Act
        store.dispatch(setLabelMode({ value: LabelMode.Color }))
        detectChanges()

        // Assert
        expect(screen.getByText("(12)")).not.toBe(null)
        expect(screen.getByText("(7)")).not.toBe(null)
        expect(screen.getByText("(0)")).not.toBe(null)
    })

    it("should disable toggles with zero count in Color mode", async () => {
        // Arrange
        colorCategoryCounts$.next({ positive: 5, neutral: 0, negative: 0 })
        const { detectChanges } = await render(LabelSettingsPanelComponent)
        const store = TestBed.inject(Store)

        // Act
        store.dispatch(setLabelMode({ value: LabelMode.Color }))
        detectChanges()

        // Assert
        const negativeCheckbox = screen.getByRole("checkbox", { name: "negative color label" }) as HTMLInputElement
        expect(negativeCheckbox.disabled).toBe(true)

        const positiveCheckbox = screen.getByRole("checkbox", { name: "positive color label" }) as HTMLInputElement
        expect(positiveCheckbox.disabled).toBe(false)
    })
})
