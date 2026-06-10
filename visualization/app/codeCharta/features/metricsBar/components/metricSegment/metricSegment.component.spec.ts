import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { metricDataSelector } from "../../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { MetricSegmentComponent } from "./metricSegment.component"

describe("MetricSegmentComponent", () => {
    async function setup(metricSelected = jest.fn()) {
        return {
            metricSelected,
            ...(await render(MetricSegmentComponent, {
                inputs: {
                    label: "Area",
                    metricName: "rloc",
                    metricFor: "areaMetric",
                    placeholder: "Area Metric",
                    searchPopoverId: "metric-select-popover-area",
                    searchAnchorName: "metric-segment-area",
                    settingsPopoverId: "metric-settings-popover-area",
                    settingsAnchorName: "metric-segment-area-cog",
                    testIdPrefix: "metric-segment-area"
                },
                on: { metricSelected },
                providers: [
                    provideMockStore({
                        initialState: defaultState,
                        selectors: [
                            {
                                selector: metricDataSelector,
                                value: {
                                    nodeMetricData: [{ name: "loc", maxValue: 100 }],
                                    edgeMetricData: [],
                                    nodeEdgeMetricsMap: new Map()
                                }
                            }
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
            }))
        }
    }

    it("should render the label and metric name", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByText("Area")).not.toBeNull()
        expect(screen.getByText("rloc")).not.toBeNull()
    })

    it("should derive card and cog test ids from the prefix", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByTestId("metric-segment-area")).not.toBeNull()
        expect(screen.getByTestId("metric-segment-area-cog")).not.toBeNull()
    })

    it("should wire the search popover id and anchor onto the metric select popover", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByTestId("metric-select-popover-metric-segment-area")).not.toBeNull()
        const cogButton = screen.getByTestId("metric-segment-area-cog")
        expect(cogButton.getAttribute("popovertarget")).toBe("metric-settings-popover-area")
    })

    it("should emit metricSelected with the chosen metric when an option is clicked", async () => {
        // Arrange — open the select popover first: its option list renders lazily
        const { metricSelected, container, fixture } = await setup()
        const popoverElement = container.querySelector('[data-testid="metric-select-popover-metric-segment-area"]') as HTMLElement
        const toggleEvent = new Event("toggle")
        Object.assign(toggleEvent, { newState: "open" })
        popoverElement.dispatchEvent(toggleEvent)
        fixture.detectChanges()
        const option = screen.getByText("loc")

        // Act
        fireEvent.click(option)

        // Assert
        expect(metricSelected).toHaveBeenCalledWith("loc")
    })
})
