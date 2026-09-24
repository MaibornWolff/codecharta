import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { RadialFolderStyle, RadialFolderValue } from "../../../../model/codeCharta.model"
import { colorMetricSelector } from "../../../../stores/mapState/mapState.read.facade"
import {
    radialFolderStyleSelector,
    radialFolderTintSelector,
    radialFolderValueSelector
} from "../../../../stores/preferences/preferences.read.facade"
import { setRadialFolderStyle, setRadialFolderTint, setRadialFolderValue } from "../../../../stores/preferences/preferences.write.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { FoldersSegmentComponent } from "./foldersSegment.component"

describe("FoldersSegmentComponent", () => {
    async function setup({
        folderValue = RadialFolderValue.Max,
        folderStyle = RadialFolderStyle.Tinted,
        tint = 0.5
    }: {
        folderValue?: RadialFolderValue
        folderStyle?: RadialFolderStyle
        tint?: number
    } = {}) {
        const renderResult = await render(FoldersSegmentComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: radialFolderValueSelector, value: folderValue },
                        { selector: radialFolderStyleSelector, value: folderStyle },
                        { selector: radialFolderTintSelector, value: tint },
                        { selector: colorMetricSelector, value: "mcc" }
                    ]
                }),
                { provide: State, useValue: { getValue: () => defaultState } }
            ]
        })
        const dispatchSpy = jest.spyOn(TestBed.inject(MockStore), "dispatch")
        return { component: renderResult.fixture.componentInstance, dispatchSpy }
    }

    it("should show the folder value and the tint strength on the card", async () => {
        // Arrange & Act
        await setup({ folderValue: RadialFolderValue.AvgPerLine, tint: 0.8 })

        // Assert
        const card = screen.getByTestId("metric-segment-folders")
        expect(card.textContent).toContain("Folders")
        expect(card.textContent).toContain("avg / line")
        expect(screen.getByTestId("metric-segment-folders-style").textContent.trim()).toBe("tinted 80 %")
    })

    it("should dim the folder value and say neutral while folders are neutral", async () => {
        // Arrange & Act
        await setup({ folderStyle: RadialFolderStyle.Neutral })

        // Assert
        const cardValue = screen.getByTestId("metric-segment-folders").querySelector("button > div")
        expect(cardValue.textContent.trim()).toBe("max")
        expect(cardValue.classList).toContain("opacity-50")
        expect(screen.getByTestId("metric-segment-folders-style").textContent.trim()).toBe("neutral")
    })

    it("should open the value list from the card and the folder style from the cog", async () => {
        // Arrange & Act
        await setup()

        // Assert
        const card = screen.getByTestId("metric-segment-folders")
        expect(card.querySelector("[popovertarget='metric-select-popover-folders']")).not.toBeNull()
        expect(screen.getByTestId("metric-segment-folders-cog").getAttribute("popovertarget")).toBe("metric-settings-popover-folders")
    })

    it("should set the picked folder value and keep the style while tinted", async () => {
        // Arrange
        const { dispatchSpy } = await setup()

        // Act
        fireEvent.click(screen.getByTestId("folder-value-median"))

        // Assert
        expect(dispatchSpy.mock.calls).toEqual([[setRadialFolderValue({ value: RadialFolderValue.Median })]])
    })

    it("should switch back to tinted when a value is picked while neutral", async () => {
        // Arrange
        const { dispatchSpy } = await setup({ folderStyle: RadialFolderStyle.Neutral })

        // Act
        fireEvent.click(screen.getByTestId("folder-value-min"))

        // Assert
        expect(dispatchSpy.mock.calls).toEqual([
            [setRadialFolderValue({ value: RadialFolderValue.Min })],
            [setRadialFolderStyle({ value: RadialFolderStyle.Tinted })]
        ])
    })

    it("should set the folder style picked in the cog popover", async () => {
        // Arrange
        const { dispatchSpy } = await setup()

        // Act
        fireEvent.click(screen.getByTestId("folder-style-neutral"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setRadialFolderStyle({ value: RadialFolderStyle.Neutral }))
    })

    it("should store the tint strength as a fraction", async () => {
        // Arrange
        const { component, dispatchSpy } = await setup()

        // Act
        component.setTintPercent(70)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setRadialFolderTint({ value: 0.7 }))
    })
})
