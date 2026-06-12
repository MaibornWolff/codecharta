import { State } from "@ngrx/store"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import { of } from "rxjs"
import { isDeltaStateSelector } from "../../../../state/selectors/isDeltaState.selector"
import { defaultState } from "../../../../state/store/state.manager"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { ColorBandsSectionComponent } from "./colorBandsSection.component"

describe("ColorBandsSectionComponent", () => {
    async function setup(isDeltaState = false) {
        const renderResult = await render(ColorBandsSectionComponent, {
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [{ selector: isDeltaStateSelector, value: isDeltaState }]
                }),
                { provide: State, useValue: { getValue: () => defaultState } },
                {
                    provide: CodeMapRenderService,
                    useValue: { colorCategoryCounts$: of({ positive: 312, neutral: 186, negative: 98 }) }
                }
            ]
        })
        return { component: renderResult.fixture.componentInstance }
    }

    it("should show one row per band with its building count", async () => {
        // Arrange & Act
        await setup()

        // Assert
        expect(screen.getByText("312")).not.toBeNull()
        expect(screen.getByText("186")).not.toBeNull()
        expect(screen.getByText("98")).not.toBeNull()
        expect(screen.getByText("selected")).not.toBeNull()
    })

    it("should show the delta rows without counts in delta mode", async () => {
        // Arrange & Act
        await setup(true)

        // Assert
        expect(screen.getByText("+Δ positive delta")).not.toBeNull()
        expect(screen.getByText("–Δ negative delta")).not.toBeNull()
        expect(screen.queryByText("312")).toBeNull()
    })
})
