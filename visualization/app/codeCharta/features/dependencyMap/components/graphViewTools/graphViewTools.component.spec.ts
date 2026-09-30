import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { unfocusAllNodes } from "../../../../stores/sharedView/sharedView.write.facade"
import { isDependencyMapFocusedSelector } from "../../selectors/dependencyMap.selectors"
import { DependencyMapViewStore } from "../../stores/dependencyMapView.store"
import { GraphViewToolsComponent } from "./graphViewTools.component"

async function renderTools({ isFocused = false }: { isFocused?: boolean } = {}) {
    const rendered = await render(GraphViewToolsComponent, {
        providers: [
            { provide: State, useValue: { getValue: () => defaultState } },
            provideMockStore({
                initialState: defaultState,
                selectors: [{ selector: isDependencyMapFocusedSelector, value: isFocused }]
            })
        ]
    })
    return Object.assign(jest.spyOn(TestBed.inject(MockStore), "dispatch"), { fixture: rendered.fixture })
}

function isRevealed(testId: string): boolean {
    return !screen.getByTestId(testId).closest("cc-bar-tool").hasAttribute("inert")
}

describe("GraphViewToolsComponent", () => {
    it("should offer unfocus, reset layout, the whole graph and a screenshot, in that order", async () => {
        // Act
        const { fixture } = await renderTools()

        // Assert
        const labels = [...fixture.nativeElement.querySelectorAll("button")].map(button => button.getAttribute("aria-label"))
        expect(labels).toEqual(["Unfocus", "Reset layout", "Show whole graph", "Screenshot"])
    })

    it("should fit the whole graph into view once the reader asks for it", async () => {
        // Arrange
        await renderTools()

        // Act
        await userEvent.click(screen.getByRole("button", { name: "Show whole graph" }))

        // Assert
        expect(TestBed.inject(DependencyMapViewStore).fitRequest()).toBe(1)
    })

    it("should reveal reset layout only once a box was moved, and put the boxes back", async () => {
        // Arrange
        const { fixture } = await renderTools()
        const viewStore = TestBed.inject(DependencyMapViewStore)
        const revealedBeforeMoving = isRevealed("dependency-reset-layout")
        viewStore.placeBox("/root/a.ts", [10, 0])
        fixture.detectChanges()

        // Act
        await userEvent.click(screen.getByTestId("dependency-reset-layout"))
        fixture.detectChanges()

        // Assert
        expect(revealedBeforeMoving).toBe(false)
        expect(viewStore.boxOffsets().size).toBe(0)
        expect(isRevealed("dependency-reset-layout")).toBe(false)
    })

    it("should reveal unfocus while a folder is focused, and show every folder again", async () => {
        // Arrange
        const dispatch = await renderTools({ isFocused: true })

        // Act
        await userEvent.click(screen.getByTestId("dependency-bar-unfocus"))

        // Assert
        expect(isRevealed("dependency-bar-unfocus")).toBe(true)
        expect(dispatch).toHaveBeenCalledWith(unfocusAllNodes())
    })

    it("should keep unfocus and the divider hidden while nothing is focused or moved", async () => {
        // Act
        await renderTools()

        // Assert
        expect(isRevealed("dependency-bar-unfocus")).toBe(false)
        expect(screen.queryByTestId("dependency-tools-divider")).toBeNull()
    })

    it("should draw a divider after the tools that undo something while one of them is revealed", async () => {
        // Act
        await renderTools({ isFocused: true })

        // Assert
        expect(screen.queryByTestId("dependency-tools-divider")).not.toBeNull()
    })
})
