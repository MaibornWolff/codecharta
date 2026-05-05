import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { defaultState } from "../../../../state/store/state.manager"
import { explorerCountsSelector } from "../../selectors/sidebarExplorer.selectors"
import { ExplorerCollapseService } from "../../services/explorerCollapse.service"
import { ExplorerHeaderComponent } from "./explorerHeader.component"

describe("ExplorerHeaderComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ExplorerHeaderComponent],
            providers: [
                provideMockStore({
                    initialState: defaultState,
                    selectors: [{ selector: explorerCountsSelector, value: { shown: 47, flattened: 12, hidden: 5, noArea: 3 } }]
                })
            ]
        })
    })

    it("should render the EXPLORER title", async () => {
        // Arrange & Act
        await render(ExplorerHeaderComponent)

        // Assert
        expect(screen.getByText("Explorer")).not.toBe(null)
    })

    it("should render three count chips with the values from the counts selector", async () => {
        // Arrange & Act
        await render(ExplorerHeaderComponent)

        // Assert
        expect(screen.getByText("Shown")).not.toBe(null)
        expect(screen.getByText("Flattened")).not.toBe(null)
        expect(screen.getByText("Hidden")).not.toBe(null)
        expect(screen.getByText("47")).not.toBe(null)
        expect(screen.getByText("12")).not.toBe(null)
        expect(screen.getByText("5")).not.toBe(null)
    })

    it("should wire flattened/hidden chips to their popovers and leave shown chip non-interactive", async () => {
        // Arrange & Act
        const { container } = await render(ExplorerHeaderComponent)
        const chips = container.querySelectorAll("cc-explorer-count-chip")

        // Assert
        expect(chips.length).toBe(3)
        const shownChip = chips[0]
        const flattenedChip = chips[1]
        const hiddenChip = chips[2]
        expect(shownChip.querySelector("[popovertarget]")).toBe(null)
        expect(flattenedChip.querySelector("[popovertarget='explorer-flatten-rules']")).not.toBe(null)
        expect(hiddenChip.querySelector("[popovertarget='explorer-hidden-rules']")).not.toBe(null)
    })

    it("should toggle the ExplorerCollapseService when the collapse button is clicked", async () => {
        // Arrange
        await render(ExplorerHeaderComponent)
        const collapseService = TestBed.inject(ExplorerCollapseService)
        expect(collapseService.isCollapsed()).toBe(false)

        // Act
        await userEvent.click(screen.getByTestId("explorer-collapse-button"))

        // Assert
        expect(collapseService.isCollapsed()).toBe(true)
    })
})
