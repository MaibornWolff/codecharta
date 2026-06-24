import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { setAreaMetric } from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { areaMetricSelector } from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../features/codeMap/facade"
import { AreaSegmentComponent } from "./areaSegment.component"

describe("AreaSegmentComponent", () => {
    async function setup(areaMetric = "rloc") {
        const renderResult = await render(AreaSegmentComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [{ selector: areaMetricSelector, value: areaMetric }]
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

    it("should forward the Area label and selected metric name to the metric segment", async () => {
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
