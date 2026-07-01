import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { setColorLabels, setLabelMode, setLabelSize, setLabelsPerMap } from "../../../../appearance/appearance.facade"
import { setDelta, setFiles } from "../../../../fileStore/store/files.actions"
import { FILE_STATES_TWO_FILES, TEST_FILE_DATA, TEST_FILE_DATA_JAVA } from "../../../../mocks/dataMocks"
import { fireEvent } from "@testing-library/angular"
import { LabelSettingsPanelComponent } from "./labelSettingsPanel.component"
import { Store, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../features/codeMap/facade"
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
        expect(screen.getByRole("radio", { name: "Height" })).not.toBe(null)
        expect(screen.getByRole("radio", { name: "Color" })).not.toBe(null)
    })

    it("should dispatch setLabelMode when clicking Color button", async () => {
        // Arrange
        await render(LabelSettingsPanelComponent)
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")

        // Act
        await userEvent.click(screen.getByRole("radio", { name: "Color" }))

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

    describe("per-map top labels toggle", () => {
        it("should hide the toggle when only one map is visible", async () => {
            // Arrange & Act
            await render(LabelSettingsPanelComponent)

            // Assert
            expect(screen.queryByRole("radio", { name: "Per map" })).toBe(null)
        })

        it("should display the toggle when multiple maps are visible in standard mode", async () => {
            // Arrange
            const { detectChanges } = await render(LabelSettingsPanelComponent)
            const store = TestBed.inject(Store)

            // Act
            store.dispatch(setFiles({ value: FILE_STATES_TWO_FILES }))
            detectChanges()

            // Assert
            expect(screen.getByRole("radio", { name: "All maps" })).not.toBe(null)
            expect(screen.getByRole("radio", { name: "Per map" })).not.toBe(null)
        })

        it("should hide the toggle in delta mode", async () => {
            // Arrange
            const { detectChanges } = await render(LabelSettingsPanelComponent)
            const store = TestBed.inject(Store)

            // Act
            store.dispatch(setDelta({ referenceFile: TEST_FILE_DATA, comparisonFile: TEST_FILE_DATA_JAVA }))
            detectChanges()

            // Assert
            expect(screen.queryByRole("radio", { name: "Per map" })).toBe(null)
        })

        it("should dispatch setLabelsPerMap when clicking Per map", async () => {
            // Arrange
            const { detectChanges } = await render(LabelSettingsPanelComponent)
            const store = TestBed.inject(Store)
            store.dispatch(setFiles({ value: FILE_STATES_TWO_FILES }))
            detectChanges()
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            await userEvent.click(screen.getByRole("radio", { name: "Per map" }))

            // Assert
            expect(dispatchSpy).toHaveBeenCalledWith(setLabelsPerMap({ value: true }))
        })
    })

    describe("Label Size slider", () => {
        const flushDebounce = () => new Promise(resolve => setTimeout(resolve, 500))

        it("should render the Label Size slider with the default value", async () => {
            // Arrange & Act
            await render(LabelSettingsPanelComponent)

            // Assert
            const sliderContainer = screen.getByTitle("Scale floating label font size")
            const sliders = sliderContainer.querySelectorAll("input")
            expect(sliders).toHaveLength(2)
            expect((sliders[0] as HTMLInputElement).value).toBe("1")
            expect((sliders[1] as HTMLInputElement).value).toBe("1")
        })

        it("should dispatch setLabelSize when the slider value changes", async () => {
            // Arrange
            await render(LabelSettingsPanelComponent)
            const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")
            const sliderContainer = screen.getByTitle("Scale floating label font size")
            const rangeSlider = sliderContainer.querySelectorAll("input")[0] as HTMLInputElement

            // Act
            fireEvent.input(rangeSlider, { target: { value: "1.75" } })
            await flushDebounce()

            // Assert
            expect(dispatchSpy).toHaveBeenCalledWith(setLabelSize({ value: 1.75 }))
        })

        it("should clamp values above MAX_LABEL_SIZE", async () => {
            // Arrange
            await render(LabelSettingsPanelComponent)
            const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")
            const sliderContainer = screen.getByTitle("Scale floating label font size")
            const numberInput = sliderContainer.querySelectorAll("input")[1] as HTMLInputElement

            // Act
            fireEvent.input(numberInput, { target: { value: "10" } })
            await flushDebounce()

            // Assert
            expect(dispatchSpy).toHaveBeenCalledWith(setLabelSize({ value: 2.5 }))
        })

        it("should reset labelSize to its default when reset button is clicked", async () => {
            // Arrange
            const { detectChanges } = await render(LabelSettingsPanelComponent)
            const store = TestBed.inject(Store)
            store.dispatch(setLabelSize({ value: 2 }))
            detectChanges()
            const dispatchSpy = jest.spyOn(store, "dispatch")

            // Act
            screen.getByText("Reset label settings").click()

            // Assert
            const lastCall = dispatchSpy.mock.calls.at(-1)?.[0] as { value?: { appSettings?: { labelSize?: number } } }
            expect(lastCall?.value?.appSettings?.labelSize).toBe(1)
        })
    })
})
