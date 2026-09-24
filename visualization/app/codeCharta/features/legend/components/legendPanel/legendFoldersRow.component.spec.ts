import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { RadialFolderStyle, RadialFolderValue } from "../../../../model/codeCharta.model"
import {
    radialFolderStyleSelector,
    radialFolderTintSelector,
    radialFolderValueSelector
} from "../../../../stores/preferences/preferences.read.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { LegendFoldersRowComponent } from "./legendFoldersRow.component"

describe("LegendFoldersRowComponent", () => {
    async function setup(folderValue: RadialFolderValue, folderStyle: RadialFolderStyle) {
        await render(LegendFoldersRowComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: radialFolderValueSelector, value: folderValue },
                        { selector: radialFolderStyleSelector, value: folderStyle },
                        { selector: radialFolderTintSelector, value: 0.5 }
                    ]
                }),
                { provide: State, useValue: { getValue: () => defaultState } }
            ]
        })
        return screen.getByTestId("legend-folders-row")
    }

    it("should say what tinted folders show", async () => {
        // Arrange & Act
        const row = await setup(RadialFolderValue.Max, RadialFolderStyle.Tinted)

        // Assert
        expect(row.textContent.trim()).toBe("folders: their highest file, tinted")
        expect((row.firstElementChild as HTMLElement).style.background).toContain("linear-gradient")
    })

    it("should say neutral with a grey swatch while folders are neutral", async () => {
        // Arrange & Act
        const row = await setup(RadialFolderValue.Max, RadialFolderStyle.Neutral)

        // Assert
        expect(row.textContent.trim()).toBe("folders: neutral")
        expect((row.firstElementChild as HTMLElement).style.background).toBe("rgb(217, 220, 225)")
    })
})
