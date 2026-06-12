import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { HexMapColor } from "../../../../codeCharta.model"
import { defaultState } from "../../../../state/store/state.manager"
import { LegendColorRowComponent } from "./legendColorRow.component"

describe("LegendColorRowComponent", () => {
    async function setup(inputs: { mapColorFor: HexMapColor }) {
        const renderResult = await render(LegendColorRowComponent, {
            inputs,
            providers: [provideMockStore({ initialState: defaultState }), { provide: State, useValue: { getValue: () => defaultState } }]
        })
        return { component: renderResult.fixture.componentInstance }
    }

    it("should render the label for the selected color", async () => {
        // Arrange & Act
        await setup({ mapColorFor: "selected" })

        // Assert
        expect(screen.getByText("selected")).not.toBeNull()
    })

    it("should resolve its color from the map colors without offering a picker", async () => {
        // Arrange & Act
        const { component } = await setup({ mapColorFor: "positive" })

        // Assert
        expect(component.color()).toBe(defaultState.appSettings.mapColors.positive)
        expect(screen.queryByRole("button")).toBeNull()
    })
})
