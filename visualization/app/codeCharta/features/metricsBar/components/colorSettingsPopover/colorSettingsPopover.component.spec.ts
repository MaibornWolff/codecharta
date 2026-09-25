import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { isDeltaStateSelector } from "../../../../stores/fileStore/store/isDeltaState.selector"
import { colorMetricSelector, isRadialLayoutSelector } from "../../../../stores/mapState/mapState.read.facade"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { ColorSettingsPopoverComponent } from "./colorSettingsPopover.component"

describe("ColorSettingsPopoverComponent", () => {
    async function setup(colorMetric = "mcc", isDeltaState = false, isRadialLayout = false) {
        const renderResult = await render(ColorSettingsPopoverComponent, {
            inputs: {
                popoverId: "metric-settings-popover-color",
                anchorName: "metric-segment-color-cog"
            },
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [
                        { selector: colorMetricSelector, value: colorMetric },
                        { selector: isDeltaStateSelector, value: isDeltaState },
                        { selector: isRadialLayoutSelector, value: isRadialLayout }
                    ]
                }),
                { provide: State, useValue: { getValue: () => defaultState } }
            ]
        })
        return { component: renderResult.fixture.componentInstance }
    }

    it("should compose all sections for a regular color metric", async () => {
        // Arrange & Act
        const { component } = await setup()

        // Assert
        expect(component.hasRangeSection()).toBe(true)
        expect(screen.getByText("Distribution")).not.toBeNull()
        expect(screen.getByText("Gradient Mode")).not.toBeNull()
        expect(screen.getByText("Bands")).not.toBeNull()
        expect(screen.getByText("Invert colors")).not.toBeNull()
        expect(screen.getByText("Folder Overrides")).not.toBeNull()
    })

    it("should leave out the folder overrides in a radial layout, which does not show them", async () => {
        // Arrange & Act
        await setup("mcc", false, true)

        // Assert
        expect(screen.getByText("Bands")).not.toBeNull()
        expect(screen.queryByText("Folder Overrides")).toBeNull()
    })

    it("should hide the range and gradient sections for the unary metric", async () => {
        // Arrange & Act
        const { component } = await setup("unary")

        // Assert
        expect(component.hasRangeSection()).toBe(false)
        expect(screen.queryByText("Distribution")).toBeNull()
        expect(screen.queryByText("Gradient Mode")).toBeNull()
        expect(screen.getByText("Bands")).not.toBeNull()
    })

    it("should hide the range and gradient sections in delta mode", async () => {
        // Arrange & Act
        const { component } = await setup("mcc", true)

        // Assert
        expect(component.hasRangeSection()).toBe(false)
        expect(screen.queryByText("Distribution")).toBeNull()
    })
})
