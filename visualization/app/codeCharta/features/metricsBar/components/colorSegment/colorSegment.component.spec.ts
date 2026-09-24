import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { CodeMapRenderService } from "../../../../features/codeMap/facade"
import { colorMetricSelector, isRadialLayoutSelector } from "../../../../stores/mapState/mapState.read.facade"
import { setColorMetric } from "../../../../stores/mapState/mapState.write.facade"
import { isColorMetricLinkedToHeightMetricSelector } from "../../../../stores/preferences/preferences.read.facade"
import { setIsColorMetricLinkedToHeightMetricAction } from "../../../../stores/preferences/preferences.write.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { ColorSegmentComponent } from "./colorSegment.component"

describe("ColorSegmentComponent", () => {
    async function setup({
        colorMetric = "mcc",
        isLinked = false,
        isRadialLayout = false
    }: {
        colorMetric?: string
        isLinked?: boolean
        isRadialLayout?: boolean
    } = {}) {
        return render(ColorSegmentComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: colorMetricSelector, value: colorMetric },
                        { selector: isColorMetricLinkedToHeightMetricSelector, value: isLinked },
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

    it("should keep the color metric selectable in a radial layout even when it is linked to the height metric", async () => {
        // Arrange & Act
        await setup({ isLinked: true, isRadialLayout: true })

        // Assert
        const colorCard = screen.getByTestId("metric-segment-color")
        expect(colorCard.querySelector("button[disabled]")).toBeNull()
    })

    it("should unlink the color metric from the height metric when a metric is picked in a radial layout", async () => {
        // Arrange
        const { fixture } = await setup({ isLinked: true, isRadialLayout: true })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        fixture.componentInstance.handleMetricSelected("loc")

        // Assert
        expect(dispatchSpy.mock.calls).toEqual([
            [setIsColorMetricLinkedToHeightMetricAction({ value: false })],
            [setColorMetric({ value: "loc" })]
        ])
    })
})
