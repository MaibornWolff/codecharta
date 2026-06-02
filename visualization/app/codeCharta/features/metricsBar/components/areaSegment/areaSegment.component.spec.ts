import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { visibleNodeMetricValuesSelector } from "../../../../state/selectors/visibleNodeMetricValues/visibleNodeMetricValues.selector"
import { setAreaMetric } from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { areaMetricSelector } from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { AreaSegmentComponent } from "./areaSegment.component"

describe("AreaSegmentComponent", () => {
    async function setup(areaMetric = "rloc", visibleMetricValues = { rloc: { values: [1, 2, 3], minValue: 1, maxValue: 3, sum: 6 } }) {
        const renderResult = await render(AreaSegmentComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: areaMetricSelector, value: areaMetric },
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

    it("should forward the Area label and selected metric name to the distribution segment", async () => {
        // Arrange & Act
        await setup("rloc")

        // Assert
        expect(screen.getByText("Area")).not.toBeNull()
        expect(screen.getByText("rloc")).not.toBeNull()
    })

    it("should expose the area-specific test ids", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByTestId("metric-segment-area")).not.toBeNull()
        expect(screen.getByTestId("metric-segment-area-cog")).not.toBeNull()
        expect(screen.getByTestId("metric-segment-area-distribution")).not.toBeNull()
    })

    it("should compute values, min and max labels from the store metric values", async () => {
        // Arrange & Act
        const { component } = await setup("rloc", { rloc: { values: [4, 7, 10], minValue: 4, maxValue: 10, sum: 21 } })

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

    it("should dispatch setAreaMetric when a metric is selected", async () => {
        // Arrange
        const { component } = await setup()
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.handleMetricSelected("mcc")

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setAreaMetric({ value: "mcc" }))
    })
})
