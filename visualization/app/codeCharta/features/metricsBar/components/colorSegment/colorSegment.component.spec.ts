import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { isColorMetricLinkedToHeightMetricSelector } from "../../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"
import { setColorMetric } from "../../../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { colorMetricSelector } from "../../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { ColorSegmentComponent } from "./colorSegment.component"

describe("ColorSegmentComponent", () => {
    async function setup({ colorMetric = "mcc", isLinked = false }: { colorMetric?: string; isLinked?: boolean } = {}) {
        return render(ColorSegmentComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: colorMetricSelector, value: colorMetric },
                        { selector: isColorMetricLinkedToHeightMetricSelector, value: isLinked }
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

    it("should render the Color label and the selected color metric name", async () => {
        // Arrange & Act
        await setup({ colorMetric: "mcc" })

        // Assert
        expect(screen.getByText("Color")).not.toBeNull()
        const colorCard = screen.getByTestId("metric-segment-color")
        expect(colorCard.textContent).toContain("mcc")
    })

    it("should expose the color card and color settings cog test ids", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByTestId("metric-segment-color")).not.toBeNull()
        expect(screen.getByTestId("metric-segment-color-cog")).not.toBeNull()
    })

    it("should dispatch setColorMetric when a metric is selected", async () => {
        // Arrange
        const { fixture } = await setup()
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        fixture.componentInstance.handleMetricSelected("loc")

        // Assert
        expect(dispatchSpy).toHaveBeenCalledTimes(1)
        expect(dispatchSpy).toHaveBeenCalledWith(setColorMetric({ value: "loc" }))
    })

    it("should wire the settings cog to the color settings popover via popovertarget", async () => {
        // Arrange & Act
        await setup()

        // Assert
        const cogButton = screen.getByTestId("metric-segment-color-cog")
        expect(cogButton.getAttribute("popovertarget")).toBe("metric-settings-popover-color")
        expect(document.getElementById("metric-settings-popover-color")).not.toBeNull()
        expect(document.getElementById("metric-select-popover-color")).not.toBeNull()
    })

    it("should disable the color metric selection when color metric is linked to height metric", async () => {
        // Arrange & Act
        await setup({ isLinked: true })

        // Assert
        const colorCard = screen.getByTestId("metric-segment-color")
        const button = colorCard.querySelector("button[disabled]")
        expect(button).not.toBeNull()
        expect(button?.textContent).toContain("mcc")
    })
})
