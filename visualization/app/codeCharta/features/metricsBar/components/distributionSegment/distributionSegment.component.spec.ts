import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { DistributionSegmentComponent } from "./distributionSegment.component"

describe("DistributionSegmentComponent", () => {
    async function setup() {
        return render(DistributionSegmentComponent, {
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
            providers: [
                provideMockStore({ initialState: defaultState }),
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
})
