import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { Vector3 } from "three"
import { setState } from "../../state/store/state.actions"
import { ResetSettingsButtonComponent } from "./resetSettingsButton.component"
import { State, Store } from "@ngrx/store"
import { defaultState } from "../../state/store/state.manager"

describe("resetSettingsButtonComponent", () => {
    const mockedStore = { dispatch: jest.fn() }
    beforeEach(() => {
        mockedStore.dispatch = jest.fn()
        TestBed.configureTestingModule({
            providers: [
                { provide: Store, useValue: mockedStore },
                { provide: State, useValue: { getValue: () => defaultState } }
            ]
        })
    })

    it("should reset given appSetting", async () => {
        await render(ResetSettingsButtonComponent, {
            componentProperties: {
                settingsKeys: ["appSettings.mapColors.selected", "appSettings.scaling.x, appSettings.scaling.y, appSettings.scaling.z"]
            }
        })

        await userEvent.click(screen.getByRole("button"))

        expect(mockedStore.dispatch).toHaveBeenCalledWith(
            setState({ value: { appSettings: { mapColors: { selected: "#EB8319" }, scaling: new Vector3(1, 1, 1) } } })
        )
    })

    it("should execute callback", async () => {
        const callback = jest.fn()
        await render(ResetSettingsButtonComponent, {
            componentProperties: {
                settingsKeys: ["appSettings.mapColors.selected"],
                callback
            }
        })

        await userEvent.click(screen.getByRole("button"))

        expect(callback).toHaveBeenCalledTimes(1)
    })
})
