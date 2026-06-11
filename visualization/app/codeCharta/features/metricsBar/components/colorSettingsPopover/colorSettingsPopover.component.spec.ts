import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { colorMetricSelector } from "../../../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { ColorSettingsPopoverComponent } from "./colorSettingsPopover.component"

describe("ColorSettingsPopoverComponent", () => {
    async function setup(colorMetric = "mcc", isDeltaState = false) {
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
                        { selector: isDeltaStateSelector, value: isDeltaState }
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
