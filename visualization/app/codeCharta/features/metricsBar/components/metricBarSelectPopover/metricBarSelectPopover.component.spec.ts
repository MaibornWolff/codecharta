import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { CodeMapRenderService } from "../../../../features/codeMap/facade"
import { attributeDescriptorsSelector } from "../../../../lenses/metrics/metricsLens.facade"
import { metricDataSelector } from "../../../../renderer/renderModel/accumulatedData/metricData/metricData.selector"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { MetricBarSelectPopoverComponent } from "./metricBarSelectPopover.component"

describe("MetricBarSelectPopoverComponent", () => {
    const nodeMetricData = [
        { name: "rloc", maxValue: 100, minValue: 0 },
        { name: "mcc", maxValue: 50, minValue: 0 }
    ]
    const edgeMetricData = [{ name: "pairingRate", maxValue: 10, minValue: 0 }]
    const descriptors = {
        rloc: { title: "Real lines of code", description: "Lines without comments", hintLowValue: "", hintHighValue: "", link: "" }
    }

    async function setup(inputs: Record<string, unknown> = {}) {
        const renderResult = await render(MetricBarSelectPopoverComponent, {
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
                        { selector: attributeDescriptorsSelector, value: descriptors }
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

    it("should offer the node metrics by default", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByText("rloc")).not.toBeNull()
        expect(screen.getByText("mcc")).not.toBeNull()
        expect(screen.queryByText("pairingRate")).toBeNull()
    })

    it("should offer the edge metrics when kind is edge", async () => {
        // Arrange & Act
        await setup({ kind: "edge" })

        // Assert
        expect(screen.getByText("pairingRate")).not.toBeNull()
        expect(screen.queryByText("rloc")).toBeNull()
    })

    it("should describe a metric with its attribute descriptor", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByText("Lines without comments")).not.toBeNull()
    })

    it("should pass the chosen metric on", async () => {
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
