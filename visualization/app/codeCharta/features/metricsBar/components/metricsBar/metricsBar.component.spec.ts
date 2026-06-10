import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { metricDataSelector } from "../../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { areaMetricSelector } from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { heightMetricSelector } from "../../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { MetricsBarComponent } from "./metricsBar.component"

describe("MetricsBarComponent", () => {
    async function setup({ isDelta = false, hasEdgeMetric = false }: { isDelta?: boolean; hasEdgeMetric?: boolean } = {}) {
        return render(MetricsBarComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: isDeltaStateSelector, value: isDelta },
                        { selector: areaMetricSelector, value: "rloc" },
                        { selector: heightMetricSelector, value: "mcc" },
                        {
                            selector: metricDataSelector,
                            value: {
                                nodeMetricData: [{ name: "rloc", maxValue: 100, minValue: 0 }],
                                edgeMetricData: hasEdgeMetric ? [{ name: "pairing_rate", maxValue: 10, minValue: 0, values: [] }] : [],
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
        })
    }

    it("should render scenario, area, height, color and labels segments by default", async () => {
        await setup()

        expect(screen.getByTestId("metric-segment-scenario")).not.toBeNull()
        expect(screen.getByTestId("metric-segment-area")).not.toBeNull()
        expect(screen.getByTestId("metric-segment-height")).not.toBeNull()
        expect(screen.getByTestId("metric-segment-color")).not.toBeNull()
        expect(screen.getByTestId("metric-segment-labels")).not.toBeNull()
        expect(screen.queryByTestId("metric-segment-edges")).toBeNull()
    })

    it("should swap color metric segment for color settings segment in delta state", async () => {
        await setup({ isDelta: true })

        expect(screen.queryByTestId("metric-segment-color")).toBeNull()
        expect(screen.getByTestId("metric-segment-color-settings")).not.toBeNull()
    })

    it("should render edges segment when edge metric data is present", async () => {
        await setup({ hasEdgeMetric: true })

        expect(screen.getByTestId("metric-segment-edges")).not.toBeNull()
    })
})
