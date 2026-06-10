import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import {
    VisibleNodeMetricValues,
    visibleNodeMetricValuesSelector
} from "../../../../state/selectors/visibleNodeMetricValues/visibleNodeMetricValues.selector"
import { setHeightMetric } from "../../../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { heightMetricSelector } from "../../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { HeightSegmentComponent } from "./heightSegment.component"

describe("HeightSegmentComponent", () => {
    async function setup(
        heightMetric = "mcc",
        visibleMetricValues: VisibleNodeMetricValues = { mcc: { values: [1, 2, 3], minValue: 1, maxValue: 3 } }
    ) {
        const renderResult = await render(HeightSegmentComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: heightMetricSelector, value: heightMetric },
                        { selector: visibleNodeMetricValuesSelector, value: visibleMetricValues }
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
        return { ...renderResult, component: renderResult.fixture.componentInstance }
    }

    it("should forward the Height label and selected metric name to the distribution segment", async () => {
        // Arrange & Act
        await setup("mcc")

        // Assert
        expect(screen.getAllByText("Height").length).toBeGreaterThan(0)
        expect(screen.getByText("mcc")).not.toBeNull()
    })

    it("should expose the height-specific test ids", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByTestId("metric-segment-height")).not.toBeNull()
        expect(screen.getByTestId("metric-segment-height-cog")).not.toBeNull()
        expect(screen.getByTestId("metric-segment-height-distribution")).not.toBeNull()
    })

    it("should compute values, min and max labels from the store metric values", async () => {
        // Arrange & Act
        const { component } = await setup("mcc", { mcc: { values: [4, 7, 10], minValue: 4, maxValue: 10 } })

        // Assert
        expect(component.values()).toEqual([4, 7, 10])
        expect(component.minLabel()).toBe((4).toLocaleString())
        expect(component.maxLabel()).toBe((10).toLocaleString())
    })

    it("should fall back to empty values and zero labels when the metric has no data", async () => {
        // Arrange & Act
        const { component } = await setup("unknown_metric", {})

        // Assert
        expect(component.currentMetric()).toBeNull()
        expect(component.values()).toEqual([])
        expect(component.minLabel()).toBe("0")
        expect(component.maxLabel()).toBe("0")
    })

    it("should dispatch setHeightMetric when a metric is selected", async () => {
        // Arrange
        const { component } = await setup()
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.handleMetricSelected("rloc")

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setHeightMetric({ value: "rloc" }))
    })
})
