import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { CodeMapRenderService } from "../../../../features/codeMap/facade"
import { areaMetricSelector, isRadialLayoutSelector } from "../../../../stores/mapState/mapState.read.facade"
import { setAreaMetric } from "../../../../stores/mapState/mapState.write.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { AreaSegmentComponent } from "./areaSegment.component"

describe("AreaSegmentComponent", () => {
    async function setup(areaMetric = "rloc", isRadialLayout = false) {
        const renderResult = await render(AreaSegmentComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: areaMetricSelector, value: areaMetric },
                        { selector: isRadialLayoutSelector, value: isRadialLayout }
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

    it("should offer no area settings in a radial layout, where none of them apply", async () => {
        // Arrange & Act
        await setup("rloc", true)

        // Assert
        expect(screen.getByTestId("metric-segment-area")).not.toBeNull()
        expect(screen.queryByTestId("metric-segment-area-cog")).toBeNull()
        expect(screen.queryByText("Margin")).toBeNull()
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
