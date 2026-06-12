import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { calculateInitialColorRange } from "../../../../state/store/dynamicSettings/colorRange/calculateInitialColorRange"
import { setColorRange } from "../../../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { colorMetricSelector } from "../../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { ColorSettingsHeaderComponent } from "./colorSettingsHeader.component"

describe("ColorSettingsHeaderComponent", () => {
    async function setup(colorMetric = "mcc", isDeltaState = false) {
        const renderResult = await render(ColorSettingsHeaderComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: colorMetricSelector, value: colorMetric },
                        { selector: isDeltaStateSelector, value: isDeltaState }
                    ]
                }),
                { provide: State, useValue: { getValue: () => defaultState } }
            ]
        })
        return { component: renderResult.fixture.componentInstance }
    }

    it("should show the selected color metric", async () => {
        // Arrange & Act
        await setup("sonar_complexity")

        // Assert
        expect(screen.getByText("sonar_complexity")).not.toBeNull()
    })

    it("should dispatch the recalculated initial color range when resetting the thresholds", async () => {
        // Arrange
        const { component } = await setup()
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.resetThresholds()

        // Assert: the header reset icon must restore the calculated thresholds
        expect(dispatchSpy).toHaveBeenCalledWith(setColorRange({ value: calculateInitialColorRange({ minValue: 0, maxValue: 0 }) }))
    })

    it("should hide the reset button for the unary metric", async () => {
        // Arrange & Act
        await setup("unary")

        // Assert
        expect(screen.queryByRole("button", { name: "Reset thresholds" })).toBeNull()
    })

    it("should hide the reset button in delta mode", async () => {
        // Arrange & Act
        await setup("mcc", true)

        // Assert
        expect(screen.queryByRole("button", { name: "Reset thresholds" })).toBeNull()
    })
})
