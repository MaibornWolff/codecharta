import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { setMapColors } from "../../../../state/store/appSettings/mapColors/mapColors.actions"
import { defaultState } from "../../../../state/store/state.manager"
import { HexMapColor } from "../../../../codeCharta.model"
import { ColorBandRowComponent } from "./colorBandRow.component"

describe("ColorBandRowComponent", () => {
    async function setup(inputs: { mapColorFor: HexMapColor; count?: number | null }) {
        const renderResult = await render(ColorBandRowComponent, {
            inputs,
            providers: [provideMockStore({ initialState: defaultState }), { provide: State, useValue: { getValue: () => defaultState } }]
        })
        return { component: renderResult.fixture.componentInstance }
    }

    it("should render the band count when one is provided", async () => {
        // Arrange & Act
        await setup({ mapColorFor: "positive", count: 312 })

        // Assert
        expect(screen.getByText("312")).not.toBeNull()
    })

    it("should not render a count when none is provided", async () => {
        // Arrange & Act
        await setup({ mapColorFor: "selected" })

        // Assert
        expect(screen.getByText("selected")).not.toBeNull()
        expect(screen.queryByText("null")).toBeNull()
    })

    it("should resolve its color from the map colors", async () => {
        // Arrange & Act
        const { component } = await setup({ mapColorFor: "positive" })

        // Assert
        expect(component.color()).toBe(defaultState.appSettings.mapColors.positive)
    })

    it("should dispatch setMapColors for its map color when the picker emits", async () => {
        // Arrange
        const { component } = await setup({ mapColorFor: "neutral" })
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        component.handleColorChange("#123456")

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setMapColors({ value: { neutral: "#123456" } }))
    })
})
