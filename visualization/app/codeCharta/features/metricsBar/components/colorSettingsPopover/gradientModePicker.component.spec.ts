import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { ColorMode } from "../../../../codeCharta.model"
import { setColorMode } from "../../../../mapState/store/colorMode/colorMode.actions"
import { defaultState } from "../../../../state/store/state.manager"
import { GradientModePickerComponent } from "./gradientModePicker.component"

describe("GradientModePickerComponent", () => {
    async function setup() {
        const renderResult = await render(GradientModePickerComponent, {
            inputs: { groupName: "test-gradient-mode" },
            providers: [provideMockStore({ initialState: defaultState }), { provide: State, useValue: { getValue: () => defaultState } }]
        })
        return { component: renderResult.fixture.componentInstance }
    }

    it("should offer all four gradient modes", async () => {
        // Arrange & Act
        await setup()

        // Assert
        for (const label of ["Absolute", "Focused", "Weighted", "Relative"]) {
            expect(screen.getByRole("radio", { name: label })).not.toBeNull()
        }
    })

    it("should check the radio matching the current color mode", async () => {
        // Arrange & Act
        await setup()

        // Assert: weightedGradient is the application default
        expect((screen.getByRole("radio", { name: "Weighted" }) as HTMLInputElement).checked).toBe(true)
    })

    it("should dispatch setColorMode when selecting another mode", async () => {
        // Arrange
        await setup()
        const store = TestBed.inject(MockStore)
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        fireEvent.click(screen.getByRole("radio", { name: "Relative" }))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setColorMode({ value: ColorMode.trueGradient }))
    })
})
