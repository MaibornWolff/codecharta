import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { selectedColorMetricDataSelector } from "../../../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"
import { visibleNodeMetricValuesSelector } from "../../../../state/selectors/visibleNodeMetricValues/visibleNodeMetricValues.selector"
import { mapColorsSelector } from "../../../../state/store/appSettings/mapColors/mapColors.selector"
import { isColorMetricLinkedToHeightMetricSelector } from "../../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"
import { setColorMetric } from "../../../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { colorMetricSelector } from "../../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { colorRangeSelector } from "../../../../state/store/dynamicSettings/colorRange/colorRange.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { ColorSegmentComponent } from "./colorSegment.component"

describe("ColorSegmentComponent", () => {
    async function setup({
        colorMetric = "mcc",
        isLinked = false,
        colorMetricData = { values: [1, 2, 3] as number[], minValue: 0, maxValue: 100 },
        visibleMetricValues = { mcc: { values: [1, 2, 3], maxValue: 3 } }
    }: {
        colorMetric?: string
        isLinked?: boolean
        colorMetricData?: { values: number[]; minValue: number; maxValue: number }
        visibleMetricValues?: Record<string, { values: number[]; maxValue: number }>
    } = {}) {
        return render(ColorSegmentComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: colorMetricSelector, value: colorMetric },
                        { selector: isColorMetricLinkedToHeightMetricSelector, value: isLinked },
                        { selector: visibleNodeMetricValuesSelector, value: visibleMetricValues },
                        { selector: selectedColorMetricDataSelector, value: colorMetricData },
                        { selector: colorRangeSelector, value: { from: 10, to: 50 } },
                        {
                            selector: mapColorsSelector,
                            value: {
                                positive: "#000",
                                neutral: "#000",
                                negative: "#000",
                                positiveDelta: "#000",
                                negativeDelta: "#000",
                                selected: "#000"
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

    it("should render the color ramp distribution when map colors are available", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByTestId("metric-segment-color-distribution")).not.toBeNull()
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

    it("should derive min/max labels and values from the global color metric data", async () => {
        // Arrange & Act
        const { fixture } = await setup({
            colorMetric: "mcc",
            colorMetricData: { values: [5, 6], minValue: 2, maxValue: 250 },
            visibleMetricValues: { mcc: { values: [7, 8, 9], maxValue: 9 } }
        })
        const component = fixture.componentInstance

        // Assert
        expect(component.minValue()).toBe(2)
        expect(component.maxValue()).toBe(250)
        expect(component.minLabel()).toBe((2).toLocaleString())
        expect(component.maxLabel()).toBe((250).toLocaleString())
        expect(component.values()).toEqual([7, 8, 9])
    })

    it("should fall back to an empty values array when the color metric has no visible values", async () => {
        // Arrange & Act
        const { fixture } = await setup({ colorMetric: "unknownMetric", visibleMetricValues: {} })

        // Assert
        expect(fixture.componentInstance.currentMetric()).toBeNull()
        expect(fixture.componentInstance.values()).toEqual([])
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
