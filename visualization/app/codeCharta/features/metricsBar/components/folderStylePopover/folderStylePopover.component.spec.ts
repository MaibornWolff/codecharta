import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { RadialFolderStyle } from "../../../../model/codeCharta.model"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { ResetSettingsButtonStore } from "../../../shared/stores/resetSettingsButton.store"
import { FolderStylePopoverComponent } from "./folderStylePopover.component"

describe("FolderStylePopoverComponent", () => {
    async function setup({ isNeutral = false, tintPercent = 50 } = {}) {
        const resetSettings = jest.fn()
        const styleSelected = jest.fn()
        await render(FolderStylePopoverComponent, {
            inputs: { popoverId: "style", anchorName: "anchor", isNeutral, tintPercent, tintedSwatch: "#ffffff" },
            on: { styleSelected },
            providers: [
                provideMockStore({ initialState: defaultState }),
                { provide: State, useValue: { getValue: () => defaultState } },
                { provide: ResetSettingsButtonStore, useValue: { resetSettings } }
            ]
        })
        return { resetSettings, styleSelected }
    }

    it("should check the current folder style", async () => {
        // Arrange & Act
        await setup({ isNeutral: true })

        // Assert
        expect(screen.getByTestId("folder-style-neutral").querySelector("input").checked).toBe(true)
        expect(screen.getByTestId("folder-style-tinted").querySelector("input").checked).toBe(false)
    })

    it("should emit the folder style that is picked", async () => {
        // Arrange
        const { styleSelected } = await setup()

        // Act
        fireEvent.click(screen.getByTestId("folder-style-neutral").querySelector("input"))

        // Assert
        expect(styleSelected).toHaveBeenCalledWith(RadialFolderStyle.Neutral)
    })

    it("should offer a tint strength from 20 to 100 %", async () => {
        // Arrange & Act
        await setup({ tintPercent: 70 })

        // Assert
        const slider = screen.getByRole("slider", { hidden: true }) as HTMLInputElement
        expect([slider.min, slider.max, slider.step, slider.value]).toEqual(["20", "100", "10", "70"])
        expect(slider.disabled).toBe(false)
    })

    it("should disable the tint strength while folders are neutral", async () => {
        // Arrange & Act
        await setup({ isNeutral: true })

        // Assert
        expect((screen.getByRole("slider", { hidden: true }) as HTMLInputElement).disabled).toBe(true)
    })

    it("should reset folder value, style and tint strength", async () => {
        // Arrange
        const { resetSettings } = await setup()

        // Act
        fireEvent.click(screen.getByRole("button", { name: /Reset folder colors/, hidden: true }))

        // Assert
        expect(resetSettings).toHaveBeenCalledWith([
            "preferences.radialFolderValue",
            "preferences.radialFolderStyle",
            "preferences.radialFolderTint"
        ])
    })
})
