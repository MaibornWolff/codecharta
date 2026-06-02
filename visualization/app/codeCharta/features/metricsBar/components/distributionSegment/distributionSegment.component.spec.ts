import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { metricDataSelector } from "../../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { DistributionSegmentComponent } from "./distributionSegment.component"

describe("DistributionSegmentComponent", () => {
    async function setup(metricSelected = jest.fn()) {
        return {
            metricSelected,
            ...(await render(DistributionSegmentComponent, {
                inputs: {
                    label: "Area",
                    metricName: "rloc",
                    metricFor: "areaMetric",
                    placeholder: "Area Metric",
                    searchPopoverId: "metric-select-popover-area",
                    searchAnchorName: "metric-segment-area",
                    settingsPopoverId: "metric-settings-popover-area",
                    settingsAnchorName: "metric-segment-area-cog",
                    testIdPrefix: "metric-segment-area",
                    values: [1, 2, 3],
                    minLabel: "0",
                    maxLabel: "100"
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

    it("should derive card, cog and distribution test ids from the prefix", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByTestId("metric-segment-area")).not.toBeNull()
        expect(screen.getByTestId("metric-segment-area-cog")).not.toBeNull()
        expect(screen.getByTestId("metric-segment-area-distribution")).not.toBeNull()
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
        // Arrange
        const { metricSelected } = await setup()
        const option = screen.getByText("loc")

        // Act
        fireEvent.click(option)

        // Assert
        expect(metricSelected).toHaveBeenCalledWith("loc")
    })
})
