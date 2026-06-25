import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { setHeightMetric } from "../../../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { heightMetricSelector } from "../../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../features/codeMap/facade"
import { HeightSegmentComponent } from "./heightSegment.component"

describe("HeightSegmentComponent", () => {
    async function setup(heightMetric = "mcc") {
        const renderResult = await render(HeightSegmentComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [{ selector: heightMetricSelector, value: heightMetric }]
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

    it("should forward the Height label and selected metric name to the metric segment", async () => {
        // Arrange & Act
        await setup("mcc")

        // Assert — "Height" also appears inside the settings popover, so scope to the card
        const heightCard = screen.getByTestId("metric-segment-height")
        expect(heightCard.textContent).toContain("Height")
        expect(heightCard.textContent).toContain("mcc")
    })

    it("should expose the height-specific test ids", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByTestId("metric-segment-height")).not.toBeNull()
        expect(screen.getByTestId("metric-segment-height-cog")).not.toBeNull()
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
