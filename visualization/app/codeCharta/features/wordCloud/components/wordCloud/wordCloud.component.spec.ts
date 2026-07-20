import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { BehaviorSubject } from "rxjs"
import { DomainWord } from "../../../../model/codeCharta.model"
import { defaultWordCloudSettings, WordCloudSettings, WordCloudShape, WordCloudSizingMode } from "../../../../model/wordCloud.model"
import { WordCloudReadStore } from "../../stores/wordCloud.read.store"
import { WordCloudWriteStore } from "../../stores/wordCloud.write.store"
import { WordCloudComponent } from "./wordCloud.component"

const mockChart = {
    setOption: jest.fn(),
    resize: jest.fn(),
    dispose: jest.fn(),
    clear: jest.fn(),
    // The component subscribes to "finished" to report the domain view ready once the layout is on screen.
    on: jest.fn()
}

jest.mock("echarts", () => ({
    init: jest.fn(() => mockChart)
}))
jest.mock("echarts-wordcloud", () => ({}))

// JSDOM has no ResizeObserver; capture the callback so tests can trigger a resize deterministically.
let resizeCallback: (() => void) | undefined
class ResizeObserverMock {
    constructor(callback: () => void) {
        resizeCallback = callback
    }
    observe() {}
    unobserve() {}
    disconnect() {}
}

/** Longer than both the render and resize debounces in the component. */
const DEBOUNCE_SETTLE_MS = 250
const settle = () => new Promise(resolve => setTimeout(resolve, DEBOUNCE_SETTLE_MS))

// JSDOM lays nothing out, so `clientWidth` is always 0; make it a readable, mutable measurement instead.
const WIDE_CONTAINER_WIDTH = 1600
const NARROW_CONTAINER_WIDTH = 300
let measuredContainerWidth = WIDE_CONTAINER_WIDTH

describe("WordCloudComponent", () => {
    let words$: BehaviorSubject<DomainWord[]>
    let selectedNodeName$: BehaviorSubject<string>
    const clearSelectedBuilding = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        resizeCallback = undefined
        window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
        measuredContainerWidth = WIDE_CONTAINER_WIDTH
        Object.defineProperty(HTMLElement.prototype, "clientWidth", {
            configurable: true,
            get: () => measuredContainerWidth
        })
        words$ = new BehaviorSubject<DomainWord[]>([{ text: "invoice", frequency: 12 }])
        selectedNodeName$ = new BehaviorSubject<string>("billing")
    })

    async function setup(settingsOverrides: Partial<WordCloudSettings> = {}) {
        return render(WordCloudComponent, {
            inputs: { settings: { ...defaultWordCloudSettings, ...settingsOverrides } },
            providers: [
                { provide: WordCloudReadStore, useValue: { wordsForSelectedNode$: words$, selectedNodeName$ } },
                { provide: WordCloudWriteStore, useValue: { clearSelectedBuilding } }
            ]
        })
    }

    it("should initialize the chart after the view is laid out", async () => {
        // Arrange & Act
        await setup()

        // Assert
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        expect(require("echarts").init).toHaveBeenCalledTimes(1)
    })

    it("should render the current words into the chart option", async () => {
        // Arrange & Act
        await setup()
        await settle()

        // Assert
        const lastOption = mockChart.setOption.mock.calls.at(-1)[0]
        expect(lastOption.series[0].data.map((datum: { name: string }) => datum.name)).toEqual(["invoice"])
    })

    it("should re-render when the selected node's words change", async () => {
        // Arrange
        const { fixture } = await setup()
        await settle()
        const callsAfterInit = mockChart.setOption.mock.calls.length

        // Act
        words$.next([{ text: "payment", frequency: 5 }])
        fixture.detectChanges()
        await settle()

        // Assert
        expect(mockChart.setOption.mock.calls.length).toBeGreaterThan(callsAfterInit)
        const lastOption = mockChart.setOption.mock.calls.at(-1)[0]
        expect(lastOption.series[0].data[0].name).toBe("payment")
    })

    it("should apply the bound settings to the rendered option", async () => {
        // Arrange
        const { fixture } = await setup()

        // Act
        fixture.componentRef.setInput("settings", { ...defaultWordCloudSettings, shape: WordCloudShape.star, topN: 1 })
        fixture.detectChanges()
        await settle()

        // Assert
        const lastOption = mockChart.setOption.mock.calls.at(-1)[0]
        expect(lastOption.series[0].shape).toBe(WordCloudShape.star)
    })

    it("should coalesce a burst of setting changes into a single render", async () => {
        // Arrange — this is what dragging a slider does; without coalescing, echarts-wordcloud paints
        // each in-flight layout and the words visibly pile up on top of each other.
        const { fixture } = await setup()
        await settle()
        mockChart.setOption.mockClear()
        mockChart.clear.mockClear()

        // Act — a rapid burst, as a slider drag emits
        for (const gridSize of [4, 8, 12, 16]) {
            fixture.componentRef.setInput("settings", { ...defaultWordCloudSettings, gridSize })
            fixture.detectChanges()
        }
        await settle()

        // Assert — exactly one layout ran, and the previous one was cleared first
        expect(mockChart.setOption).toHaveBeenCalledTimes(1)
        expect(mockChart.clear).toHaveBeenCalledTimes(1)
        expect(mockChart.setOption.mock.calls.at(-1)[0].series[0].gridSize).toBe(16)
    })

    it("should debounce a resize into a single chart resize", async () => {
        // Arrange
        await setup()

        // Act
        resizeCallback?.()
        resizeCallback?.()
        await settle()

        // Assert
        expect(mockChart.resize).toHaveBeenCalledTimes(1)
    })

    /**
     * `drawOutOfBound` is false, so a max font size fitted to the old width makes echarts silently drop the
     * longest — highest-ranked — word once the container narrows. Resizing the chart alone does not re-fit it.
     */
    it("should re-fit the font size range when the container narrows", async () => {
        // Arrange — one long word, so the clamp is width-bound
        words$.next([{ text: "authorizationconfiguration", frequency: 12 }])
        const { fixture } = await setup()
        await settle()
        const wideSizeRange = mockChart.setOption.mock.calls.at(-1)[0].series[0].sizeRange

        // Act — the explorer is dragged wider, so the cloud container narrows
        measuredContainerWidth = NARROW_CONTAINER_WIDTH
        resizeCallback?.()
        await settle()
        fixture.detectChanges()
        await settle()

        // Assert
        const narrowSizeRange = mockChart.setOption.mock.calls.at(-1)[0].series[0].sizeRange
        expect(narrowSizeRange[1]).toBeLessThan(wideSizeRange[1])
    })

    it("should dispose the chart when the component is destroyed", async () => {
        // Arrange
        const { fixture } = await setup()

        // Act
        fixture.destroy()

        // Assert
        expect(mockChart.dispose).toHaveBeenCalledTimes(1)
    })

    it("should describe the cloud for screen readers", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByRole("img").getAttribute("aria-label")).toBe("Word cloud of 1 domain term for billing; largest: invoice")
    })

    it("should announce the drawn word count rather than the unlimited total", async () => {
        // Arrange
        const { fixture } = await setup({ topN: 2 })

        // Act — five words are available, but only the top two are drawn
        words$.next([
            { text: "invoice", frequency: 12 },
            { text: "payment", frequency: 9 },
            { text: "ledger", frequency: 4 },
            { text: "order", frequency: 3 },
            { text: "balance", frequency: 1 }
        ])
        fixture.detectChanges()

        // Assert
        expect(screen.getByRole("img").getAttribute("aria-label")).toContain("Word cloud of 2 domain terms")
    })

    it("should rank the text alternative by tfidf when tfidf drives the sizing", async () => {
        // Arrange
        const { fixture } = await setup({ sizingMode: WordCloudSizingMode.tfidf })

        // Act — "common" wins on raw frequency, but "distinctive" is what the canvas draws largest
        words$.next([
            { text: "common", frequency: 100, tfidf: 0.1 },
            { text: "distinctive", frequency: 5, tfidf: 0.9 }
        ])
        fixture.detectChanges()

        // Assert
        expect(screen.getByRole("img").getAttribute("aria-label")).toContain("largest: distinctive, common")
    })

    it("should list the top words as a text alternative", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByText("invoice: 12")).toBeTruthy()
    })

    it("should explain the empty selection instead of blanking the viewport", async () => {
        // Arrange
        const { fixture } = await setup()

        // Act
        words$.next([])
        fixture.detectChanges()

        // Assert
        expect(screen.getByText(/No domain words for billing/)).toBeTruthy()
    })

    it("should clear the selection when the whole map is requested", async () => {
        // Arrange
        const { fixture } = await setup()
        words$.next([])
        fixture.detectChanges()

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Show whole map" }))

        // Assert
        expect(clearSelectedBuilding).toHaveBeenCalledTimes(1)
    })
})
