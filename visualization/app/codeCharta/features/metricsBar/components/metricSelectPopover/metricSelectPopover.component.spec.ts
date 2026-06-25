import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { metricDataSelector } from "../../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { attributeDescriptorsSelector } from "../../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../features/codeMap/facade"
import { MetricSelectPopoverComponent } from "./metricSelectPopover.component"

describe("MetricSelectPopoverComponent", () => {
    const nodeMetricData = [
        { name: "rloc", maxValue: 100, minValue: 0 },
        { name: "mcc", maxValue: 50, minValue: 0 },
        { name: "complexity", maxValue: 30, minValue: 0 }
    ]
    const edgeMetricData = [{ name: "pairingRate", maxValue: 10, minValue: 0 }]

    async function setup(inputs: Record<string, unknown> = {}) {
        const renderResult = await render(MetricSelectPopoverComponent, {
            inputs: {
                popoverId: "metric-select-popover-area",
                anchorName: "metric-segment-area",
                ...inputs
            },
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        {
                            selector: metricDataSelector,
                            value: { nodeMetricData, edgeMetricData, nodeEdgeMetricsMap: new Map() }
                        },
                        { selector: attributeDescriptorsSelector, value: {} }
                    ]
                }),
                { provide: State, useValue: { getValue: () => defaultState } },
                {
                    provide: CodeMapRenderService,
                    useValue: {
                        getNodes: () => [],
                        sortVisibleNodesByHeightDescending: () => [],
                        colorCategoryCounts$: of({ positive: 0, neutral: 0, negative: 0 })
                    }
                }
            ]
        })
        // the option list renders lazily, so simulate the popover opening
        const popoverElement = renderResult.container.querySelector("[popover]") as HTMLElement
        const toggleEvent = new Event("toggle")
        Object.assign(toggleEvent, { newState: "open" })
        popoverElement.dispatchEvent(toggleEvent)
        renderResult.fixture.detectChanges()
        return renderResult
    }

    it("should render the node metric options by default", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByText("rloc")).not.toBeNull()
        expect(screen.getByText("mcc")).not.toBeNull()
        expect(screen.queryByText("pairingRate")).toBeNull()
    })

    it("should render edge metric options when kind is edge", async () => {
        // Arrange & Act
        await setup({ kind: "edge" })

        // Assert
        expect(screen.getByText("pairingRate")).not.toBeNull()
        expect(screen.queryByText("rloc")).toBeNull()
    })

    it("should filter the metric list by the search term", async () => {
        // Arrange
        const { container } = await setup()
        const searchInput = container.querySelector("input") as HTMLInputElement

        // Act
        fireEvent.input(searchInput, { target: { value: "rloc" } })

        // Assert
        expect(screen.getByText("rloc")).not.toBeNull()
        expect(screen.queryByText("mcc")).toBeNull()
    })

    it("should update the bound search term signal when typing", async () => {
        // Arrange
        const { fixture, container } = await setup()
        const searchInput = container.querySelector("input") as HTMLInputElement

        // Act
        fireEvent.input(searchInput, { target: { value: "compl" } })

        // Assert
        expect(fixture.componentInstance.searchTerm()).toBe("compl")
        expect(fixture.componentInstance.activeIndex()).toBe(0)
    })

    it("should show the empty placeholder when no metric matches the search term", async () => {
        // Arrange
        const { container } = await setup()
        const searchInput = container.querySelector("input") as HTMLInputElement

        // Act
        fireEvent.input(searchInput, { target: { value: "doesNotExist" } })

        // Assert
        expect(screen.getByText("No metrics found")).not.toBeNull()
    })

    it("should emit the selected metric name when an option is clicked", async () => {
        // Arrange
        const { fixture } = await setup()
        const emitted: string[] = []
        fixture.componentInstance.metricSelected.subscribe(name => emitted.push(name))

        // Act
        fireEvent.click(screen.getByText("mcc"))

        // Assert
        expect(emitted).toEqual(["mcc"])
    })
})
