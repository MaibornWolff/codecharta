import { signal } from "@angular/core"
import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { defaultWordCloudSettings, WordCloudShape, WordCloudSizingMode, wordCloudShapeLabels } from "../../../../model/wordCloud.model"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { SETTINGS_INPUT_DEBOUNCE_MS } from "../../../shared/facade"
import { DomainBarReadStore } from "../../stores/domainBar.read.store"
import { DomainBarWriteStore } from "../../stores/domainBar.write.store"
import { DomainBarComponent } from "./domainBar.component"

describe("DomainBarComponent", () => {
    let writeStore: jest.Mocked<Partial<DomainBarWriteStore>>
    let hasTfidfData: ReturnType<typeof signal<boolean>>

    afterEach(() => {
        jest.useRealTimers()
    })

    async function setup(settings = defaultWordCloudSettings) {
        writeStore = {
            setShape: jest.fn(),
            setSizingMode: jest.fn(),
            setTopN: jest.fn(),
            setSizeRange: jest.fn(),
            setRotationRange: jest.fn(),
            setRotationStep: jest.fn(),
            setGridSize: jest.fn(),
            setShrinkToFit: jest.fn(),
            setDrawOutOfBound: jest.fn()
        }
        hasTfidfData = signal(false)
        return render(DomainBarComponent, {
            providers: [
                provideMockStore({ initialState: defaultState }),
                { provide: State, useValue: { getValue: () => defaultState } },
                { provide: DomainBarReadStore, useValue: { settings: signal(settings), hasTfidfData } },
                { provide: DomainBarWriteStore, useValue: writeStore }
            ]
        })
    }

    function changeSlider(accessibleName: string, value: string) {
        fireEvent.input(screen.getByRole("slider", { name: accessibleName }), { target: { value } })
        jest.advanceTimersByTime(SETTINGS_INPUT_DEBOUNCE_MS)
    }

    it("should render one segment per settings area", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByTestId("domain-bar-shape-segment")).not.toBeNull()
        expect(screen.getByTestId("domain-bar-word-sizing-segment")).not.toBeNull()
        expect(screen.getByTestId("domain-bar-rotation-segment")).not.toBeNull()
    })

    it("should reset each settings area on its own", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByText("Reset shape")).not.toBeNull()
        expect(screen.getByText("Reset word sizing")).not.toBeNull()
        expect(screen.getByText("Reset rotation")).not.toBeNull()
    })

    it("should show the current sizing mode inline on the bar", async () => {
        // Arrange & Act
        await setup({ ...defaultWordCloudSettings, sizingMode: WordCloudSizingMode.frequency })

        // Assert
        expect(screen.getByTestId("domain-bar-word-sizing-segment").textContent).toContain("Frequency")
    })

    it("should show the current word count inline on the bar", async () => {
        // Arrange & Act
        await setup({ ...defaultWordCloudSettings, topN: 42 })

        // Assert
        expect(screen.getByTestId("domain-bar-top-n-value").textContent.trim()).toBe("42 words")
    })

    it("should show the current shape inline on the bar with its display label", async () => {
        // Arrange & Act
        await setup({ ...defaultWordCloudSettings, shape: WordCloudShape.star })

        // Assert
        expect(screen.getByTestId("domain-bar-shape-segment").textContent).toContain(wordCloudShapeLabels[WordCloudShape.star])
    })

    it("should summarize the current rotation range inline on the bar", async () => {
        // Arrange & Act
        await setup({ ...defaultWordCloudSettings, rotationRange: [-45, 45] })

        // Assert
        expect(screen.getByTestId("domain-bar-rotation-segment").textContent).toContain("-45° – 45°")
    })

    it("should dispatch a shape change", async () => {
        // Arrange
        await setup()

        // Act
        fireEvent.change(screen.getByTestId("domain-bar-shape"), { target: { value: WordCloudShape.star } })

        // Assert
        expect(writeStore.setShape).toHaveBeenCalledWith(WordCloudShape.star)
    })

    it("should dispatch a topN change", async () => {
        // Arrange
        jest.useFakeTimers()
        await setup()

        // Act
        changeSlider("Words", "40")

        // Assert
        expect(writeStore.setTopN).toHaveBeenCalledWith(40)
    })

    it("should update only the min bound of the size range", async () => {
        // Arrange
        jest.useFakeTimers()
        await setup({ ...defaultWordCloudSettings, sizeRange: [12, 60] })

        // Act
        changeSlider("Smallest Word in pixels", "20")

        // Assert
        expect(writeStore.setSizeRange).toHaveBeenCalledWith([20, 60])
    })

    it("should dispatch a sizing-mode change", async () => {
        // Arrange
        await setup()

        // Act
        fireEvent.change(screen.getByTestId("domain-bar-sizing-mode"), { target: { value: WordCloudSizingMode.tfidf } })

        // Assert
        expect(writeStore.setSizingMode).toHaveBeenCalledWith(WordCloudSizingMode.tfidf)
    })

    it("should update only the max bound of the size range", async () => {
        // Arrange
        jest.useFakeTimers()
        await setup({ ...defaultWordCloudSettings, sizeRange: [12, 60] })

        // Act
        changeSlider("Largest Word in pixels", "48")

        // Assert
        expect(writeStore.setSizeRange).toHaveBeenCalledWith([12, 48])
    })

    it("should dispatch a fit-all-words change", async () => {
        // Arrange
        await setup({ ...defaultWordCloudSettings, shrinkToFit: false })

        // Act
        fireEvent.click(screen.getByLabelText("Fit All Words"))

        // Assert
        expect(writeStore.setShrinkToFit).toHaveBeenCalledWith(true)
    })

    it("should dispatch a draw-outside-bounds change", async () => {
        // Arrange
        await setup({ ...defaultWordCloudSettings, drawOutOfBound: false })

        // Act
        fireEvent.click(screen.getByLabelText("Draw Outside Bounds"))

        // Assert
        expect(writeStore.setDrawOutOfBound).toHaveBeenCalledWith(true)
    })

    it("should update the rotation range bounds independently", async () => {
        // Arrange
        jest.useFakeTimers()
        await setup({ ...defaultWordCloudSettings, rotationRange: [-90, 90] })

        // Act
        changeSlider("Min Rotation in degrees", "-45")
        changeSlider("Max Rotation in degrees", "45")

        // Assert
        expect(writeStore.setRotationRange).toHaveBeenCalledWith([-45, 90])
        expect(writeStore.setRotationRange).toHaveBeenCalledWith([-90, 45])
    })

    it("should dispatch a rotation-step change", async () => {
        // Arrange
        jest.useFakeTimers()
        await setup()

        // Act
        changeSlider("Rotation Step in degrees", "30")

        // Assert
        expect(writeStore.setRotationStep).toHaveBeenCalledWith(30)
    })

    it("should dispatch a word-spacing change", async () => {
        // Arrange
        jest.useFakeTimers()
        await setup()

        // Act
        changeSlider("Word Spacing in pixels", "16")

        // Assert
        expect(writeStore.setGridSize).toHaveBeenCalledWith(16)
    })

    it("should disable the tfidf option when the data has no tfidf scores", async () => {
        // Arrange
        await setup()

        // Act
        const tfidfOption = screen.getByRole("option", { name: "TF-IDF" }) as HTMLOptionElement

        // Assert
        expect(tfidfOption.disabled).toBe(true)
    })

    it("should explain why the tfidf option is unavailable", async () => {
        // Arrange
        await setup()

        // Act
        const tfidfOption = screen.getByRole("option", { name: "TF-IDF" })

        // Assert
        expect(tfidfOption.getAttribute("title")).toContain("no TF-IDF scores")
    })

    it("should enable the tfidf option when the data carries tfidf scores", async () => {
        // Arrange
        const { fixture } = await setup()

        // Act
        hasTfidfData.set(true)
        fixture.detectChanges()
        const tfidfOption = screen.getByRole("option", { name: "TF-IDF" }) as HTMLOptionElement

        // Assert
        expect(tfidfOption.disabled).toBe(false)
    })

    it("should keep frequency as the default sizing mode", async () => {
        // Arrange & Act
        await setup()

        // Assert
        const select = screen.getByTestId("domain-bar-sizing-mode") as HTMLSelectElement
        expect(select.value).toBe(WordCloudSizingMode.frequency)
    })
})
