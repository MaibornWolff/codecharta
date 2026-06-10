import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { metricDataSelector } from "../../../../state/selectors/accumulatedData/metricData/metricData.selector"
import { visibleNodeMetricValuesSelector } from "../../../../state/selectors/visibleNodeMetricValues/visibleNodeMetricValues.selector"
import { areaMetricSelector } from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { heightMetricSelector } from "../../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { MetricsBarComponent } from "./metricsBar.component"

describe("MetricsBarComponent", () => {
    async function setup({
        isDelta = false,
        hasEdgeMetric = false,
        values = [] as number[]
    }: {
        isDelta?: boolean
        hasEdgeMetric?: boolean
        values?: number[]
    } = {}) {
        const metricValues =
            values.length > 0
                ? { values, minValue: Math.min(...values), maxValue: Math.max(...values) }
                : { values: [], minValue: 0, maxValue: 0 }
        return render(MetricsBarComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: isDeltaStateSelector, value: isDelta },
                        { selector: areaMetricSelector, value: "rloc" },
                        { selector: heightMetricSelector, value: "mcc" },
                        {
                            selector: visibleNodeMetricValuesSelector,
                            value: { rloc: metricValues, mcc: metricValues }
                        },
                        {
                            selector: metricDataSelector,
                            value: {
                                nodeMetricData: [{ name: "rloc", maxValue: 100, minValue: 0, values }],
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

    it("should render area and height distribution histograms from the visible node metric values", async () => {
        await setup({ values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] })

        for (const testId of ["metric-segment-area-distribution", "metric-segment-height-distribution"]) {
            const distribution = screen.getByTestId(testId)
            const bars = Array.from(distribution.querySelectorAll<HTMLElement>('[data-testid="axis-distribution-bar"]'))
            expect(bars).toHaveLength(12)
            expect(bars.some(bar => Number.parseFloat(bar.style.height) > 0)).toBe(true)
        }
    })

    it("should render empty histograms when there are no visible metric values", async () => {
        await setup({ values: [] })

        const distribution = screen.getByTestId("metric-segment-area-distribution")
        const bars = Array.from(distribution.querySelectorAll<HTMLElement>('[data-testid="axis-distribution-bar"]'))
        expect(bars.every(bar => Number.parseFloat(bar.style.height) === 0)).toBe(true)
    })

    it("should swap color metric segment for color settings segment in delta state", async () => {
        await setup({ isDelta: true })

        expect(screen.queryByTestId("metric-segment-color")).toBeNull()
        expect(screen.getByTestId("metric-segment-color-settings")).not.toBeNull()
        expect(screen.queryByTestId("metric-segment-color-distribution")).toBeNull()
        expect(screen.getByTestId("metric-segment-area-distribution")).not.toBeNull()
        expect(screen.getByTestId("metric-segment-height-distribution")).not.toBeNull()
    })

    it("should render edges segment when edge metric data is present", async () => {
        await setup({ hasEdgeMetric: true })

        expect(screen.getByTestId("metric-segment-edges")).not.toBeNull()
    })
})
