import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { EXPLORER_COUNTS } from "../../explorerCounts.port"
import { createExplorerCountsMock, provideExplorerCapabilitiesMock } from "../../explorerPorts.mocks"
import { provideViewScopedExplorerState } from "../../provideViewScopedExplorerState"
import { ExplorerCollapseService } from "../../services/explorerCollapse.service"
import { ExplorerHeaderComponent } from "./explorerHeader.component"

describe("ExplorerHeaderComponent", () => {
    const configureWithShowCounts = (showCounts: boolean) => {
        TestBed.configureTestingModule({
            imports: [ExplorerHeaderComponent],
            providers: [
                {
                    provide: EXPLORER_COUNTS,
                    useValue: createExplorerCountsMock({ shown: 47, flattened: 12, hidden: 5, noArea: 3 })
                },
                provideExplorerCapabilitiesMock({ showCounts }),
                ...provideViewScopedExplorerState("metrics")
            ]
        })
    }

    beforeEach(() => {
        localStorage.clear()
        configureWithShowCounts(true)
    })

    it("should render the EXPLORER title", async () => {
        // Arrange & Act
        await render(ExplorerHeaderComponent)

        // Assert
        expect(screen.getByText("Explorer")).not.toBe(null)
    })

    it("should render three count chips with the values from the counts port", async () => {
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

    it("should hide the count chips when the view does not want them", async () => {
        // Arrange
        TestBed.resetTestingModule()
        configureWithShowCounts(false)

        // Act
        const { container } = await render(ExplorerHeaderComponent)

        // Assert
        expect(container.querySelectorAll("cc-explorer-count-chip").length).toBe(0)
        expect(screen.getByText("Explorer")).not.toBe(null)
    })

    it("should render without a counts port when the view provides none", async () => {
        // Arrange — the domain view turns counts off and provides no EXPLORER_COUNTS adapter
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({
            imports: [ExplorerHeaderComponent],
            providers: [provideExplorerCapabilitiesMock({ showCounts: false }), ...provideViewScopedExplorerState("domain")]
        })

        // Act
        const { container } = await render(ExplorerHeaderComponent)

        // Assert
        expect(container.querySelectorAll("cc-explorer-count-chip").length).toBe(0)
        expect(screen.getByText("Explorer")).not.toBe(null)
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
