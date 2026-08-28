import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { BehaviorSubject } from "rxjs"
import { DomainWord } from "../../../../model/codeCharta.model"
import { defaultWordCloudSettings, WordCloudSettings, WordCloudShape, WordCloudSizingMode } from "../../../../model/wordCloud.model"
import { ViewReadinessStore } from "../../../../routing/viewReadiness.store"
import { WordCloudReadStore } from "../../stores/wordCloud.read.store"
import { WordCloudComponent } from "./wordCloud.component"

let finishedCallback: (() => void) | undefined

const mockChart = {
    setOption: jest.fn(),
    resize: jest.fn(),
    dispose: jest.fn(),
    clear: jest.fn(),
    on: jest.fn((event: string, callback: () => void) => {
        if (event === "finished") {
            finishedCallback = callback
        }
    }),
    getModel: jest.fn()
}

function mockDrawnWords(drawnCount: number, wordCount: number) {
    mockChart.getModel.mockReturnValue({
        getSeriesByIndex: () => ({
            getData: () => ({
                count: () => wordCount,
                getItemGraphicEl: (index: number) => (index < drawnCount ? {} : null)
            })
        })
    })
}

jest.mock("echarts", () => ({
    init: jest.fn(() => mockChart)
}))
jest.mock("echarts-wordcloud", () => ({}))

let resizeCallback: (() => void) | undefined
class ResizeObserverMock {
    constructor(callback: () => void) {
        resizeCallback = callback
    }
    observe() {}
    unobserve() {}
    disconnect() {}
}

const DEBOUNCE_SETTLE_MS = 250
const settle = () => new Promise(resolve => setTimeout(resolve, DEBOUNCE_SETTLE_MS))

const screenReaderDescription = () => screen.getByRole("figure").querySelector("figcaption").textContent

const WIDE_CONTAINER_WIDTH = 1600
const NARROW_CONTAINER_WIDTH = 300
const CONTAINER_HEIGHT = 900
let measuredContainerWidth = WIDE_CONTAINER_WIDTH
let measuredContainerHeight = CONTAINER_HEIGHT

describe("WordCloudComponent", () => {
    let words$: BehaviorSubject<DomainWord[]>
    let selectedNodeName: string

    beforeEach(() => {
        jest.clearAllMocks()
        resizeCallback = undefined
        finishedCallback = undefined
        mockChart.on.mockImplementation((event: string, callback: () => void) => {
            if (event === "finished") {
                finishedCallback = callback
            }
        })
        window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
        measuredContainerWidth = WIDE_CONTAINER_WIDTH
        measuredContainerHeight = CONTAINER_HEIGHT
        Object.defineProperty(HTMLElement.prototype, "clientWidth", {
            configurable: true,
            get: () => measuredContainerWidth
        })
        Object.defineProperty(HTMLElement.prototype, "clientHeight", {
            configurable: true,
            get: () => measuredContainerHeight
        })
        words$ = new BehaviorSubject<DomainWord[]>([{ text: "invoice", frequency: 12 }])
        selectedNodeName = "billing"
    })

    async function setup(settingsOverrides: Partial<WordCloudSettings> = {}) {
        return render(WordCloudComponent, {
            inputs: { settings: { ...defaultWordCloudSettings, ...settingsOverrides } },
            providers: [
                {
                    provide: WordCloudReadStore,
                    useValue: { wordsForSelectedNode: () => words$, selectedNodeName: () => selectedNodeName }
                }
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

    it("should lay the cloud out exactly once per resize", async () => {
        // Arrange — let the initial layout settle, so only the resize's own work is counted
        const { fixture } = await setup()
        await settle()
        jest.clearAllMocks()

        // Act — a sidebar drag narrows the container and reports repeatedly while it runs
        measuredContainerWidth = NARROW_CONTAINER_WIDTH
        resizeCallback?.()
        resizeCallback?.()
        fixture.detectChanges()
        await settle()

        // Assert — one layout. A resize used to lay out twice: once from a direct chart.resize() and once
        expect(mockChart.setOption).toHaveBeenCalledTimes(1)
        expect(mockChart.resize).toHaveBeenCalledTimes(1)
    })

    it("should re-render when only the container height changes", async () => {
        // Arrange — a width-only signal would skip this, leaving the cloud laid out for the old box
        const { fixture } = await setup()
        await settle()
        jest.clearAllMocks()

        // Act — a bar above the cloud collapses, so the box gets taller at the same width
        measuredContainerHeight = CONTAINER_HEIGHT * 2
        resizeCallback?.()
        fixture.detectChanges()
        await settle()

        // Assert
        expect(mockChart.setOption).toHaveBeenCalledTimes(1)
    })

    it("should not lay out while the view is detached and measures zero", async () => {
        // Arrange
        const { fixture } = await setup()
        await settle()
        jest.clearAllMocks()

        // Act — the kept-alive domain view is detached, so its container measures 0x0
        measuredContainerWidth = 0
        measuredContainerHeight = 0
        resizeCallback?.()
        fixture.detectChanges()
        await settle()

        // Assert — laying out into nothing would only have to be redone on the way back
        expect(mockChart.setOption).not.toHaveBeenCalled()
    })

    it("should not lay the cloud out again when the view comes back unchanged", async () => {
        // Arrange
        const { fixture } = await setup()
        await settle()
        jest.clearAllMocks()

        // Act — leaving the view detaches it (0x0) and coming back measures the very same box again
        measuredContainerWidth = 0
        measuredContainerHeight = 0
        resizeCallback?.()
        fixture.detectChanges()
        await settle()
        measuredContainerWidth = WIDE_CONTAINER_WIDTH
        measuredContainerHeight = CONTAINER_HEIGHT
        resizeCallback?.()
        fixture.detectChanges()
        await settle()

        // Assert — the canvas still holds that exact cloud, so a fresh layout would only replay the animation
        expect(mockChart.setOption).not.toHaveBeenCalled()
    })

    it("should lay the cloud out on the way back when the view was left before the layout ran", async () => {
        // Arrange — no settling, so the debounced layout is still queued when the view is left
        const { fixture } = await setup()
        jest.clearAllMocks()

        // Act — detached (0x0) inside the debounce window, then back to the very same box
        measuredContainerWidth = 0
        measuredContainerHeight = 0
        resizeCallback?.()
        fixture.detectChanges()
        await settle()
        measuredContainerWidth = WIDE_CONTAINER_WIDTH
        measuredContainerHeight = CONTAINER_HEIGHT
        resizeCallback?.()
        fixture.detectChanges()
        await settle()

        // Assert — nothing ever reached the canvas, so the return may not be treated as unchanged
        expect(mockChart.setOption).toHaveBeenCalled()
    })

    it("should lay the cloud out again after the empty state took the container away", async () => {
        // Arrange
        const sameWords = [{ text: "invoice", frequency: 12 }]
        words$.next(sameWords)
        const { fixture } = await setup()
        await settle()
        jest.clearAllMocks()

        // Act — an empty emission swaps in the empty state, which disposes the chart, and the very same words return
        words$.next([])
        fixture.detectChanges()
        await settle()
        words$.next(sameWords)
        fixture.detectChanges()
        await settle()

        // Assert — the disposed chart took the drawn cloud with it, so identical inputs still have to be drawn
        expect(mockChart.setOption).toHaveBeenCalled()
    })

    it("should report the view ready when it comes back with nothing to lay out", async () => {
        // Arrange
        const { fixture } = await setup()
        await settle()
        const viewReadinessStore = TestBed.inject(ViewReadinessStore)
        viewReadinessStore.markAllStale()

        // Act
        measuredContainerWidth = 0
        measuredContainerHeight = 0
        resizeCallback?.()
        fixture.detectChanges()
        await settle()
        measuredContainerWidth = WIDE_CONTAINER_WIDTH
        measuredContainerHeight = CONTAINER_HEIGHT
        resizeCallback?.()
        fixture.detectChanges()
        await settle()

        // Assert — without this the spinner would wait forever for a layout that is not needed
        expect(viewReadinessStore.isStale("domain")).toBe(false)
    })

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
        expect(screenReaderDescription()).toBe("Word cloud of 1 domain term for billing; largest: invoice")
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
        expect(screenReaderDescription()).toContain("Word cloud of 2 domain terms")
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
        expect(screenReaderDescription()).toContain("largest: distinctive, common")
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

    it("should report how many words fit when the layout drops some", async () => {
        // Arrange — three words requested, but the layout only found room for two
        words$.next([
            { text: "invoice", frequency: 12 },
            { text: "payment", frequency: 9 },
            { text: "ledger", frequency: 4 }
        ])
        const { fixture } = await setup()
        await settle()
        mockDrawnWords(2, 3)

        // Act
        finishedCallback?.()
        await settle()
        fixture.detectChanges()

        // Assert
        expect(screen.getByText(/2 of 3 words fit/)).toBeTruthy()
    })

    it("should not show a notice when every requested word fit", async () => {
        // Arrange
        words$.next([
            { text: "invoice", frequency: 12 },
            { text: "payment", frequency: 9 }
        ])
        const { fixture } = await setup()
        await settle()
        mockDrawnWords(2, 2)

        // Act
        finishedCallback?.()
        await settle()
        fixture.detectChanges()

        // Assert
        expect(screen.queryByText(/words fit/)).toBeNull()
    })

    it("should hide the notice while a new layout is in flight", async () => {
        // Arrange — a shortfall notice from the previous layout is showing
        const { fixture } = await setup()
        await settle()
        mockDrawnWords(0, 1)
        finishedCallback?.()
        await settle()
        fixture.detectChanges()
        expect(screen.getByText(/0 of 1 words fit/)).toBeTruthy()

        // Act — the words change, so a new layout starts
        words$.next([{ text: "payment", frequency: 5 }])
        fixture.detectChanges()
        await settle()
        fixture.detectChanges()

        // Assert — the stale count no longer describes the canvas
        expect(screen.queryByText(/words fit/)).toBeNull()
    })

    it("should raise clearSelection when the whole map is requested", async () => {
        // Arrange
        const clearSelection = jest.fn()
        const { fixture } = await setup()
        fixture.componentInstance.clearSelection.subscribe(clearSelection)
        words$.next([])
        fixture.detectChanges()

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Show whole map" }))

        // Assert
        expect(clearSelection).toHaveBeenCalledTimes(1)
    })
})
