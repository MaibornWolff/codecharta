import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { BehaviorSubject } from "rxjs"
import { SortingOption } from "../../../../model/codeCharta.model"
import { createExplorerSortMock, provideExplorerCapabilitiesMock } from "../../explorerPorts.mocks"
import { EXPLORER_SORT, ExplorerSort } from "../../explorerSort.port"
import { ExplorerSortControlComponent } from "./explorerSortControl.component"

describe("ExplorerSortControlComponent", () => {
    let sort: ExplorerSort

    const configure = (options?: { sortOptions?: SortingOption[]; sort?: ExplorerSort }) => {
        sort = options?.sort ?? createExplorerSortMock()
        TestBed.configureTestingModule({
            imports: [ExplorerSortControlComponent],
            providers: [
                { provide: EXPLORER_SORT, useValue: sort },
                provideExplorerCapabilitiesMock(options?.sortOptions ? { sortOptions: options.sortOptions } : undefined)
            ]
        })
    }

    beforeEach(() => {
        configure()
    })

    it("should open its menu through the native popover API so the panel cannot clip it", async () => {
        // Arrange & Act — an in-flow dropdown was cut off by the explorer's overflow container
        const { container } = await render(ExplorerSortControlComponent)

        // Assert
        const trigger = container.querySelector("[data-testid='explorer-sort-trigger']")
        const menu = container.querySelector("#explorer-sort-menu")
        expect(trigger?.getAttribute("popovertarget")).toBe("explorer-sort-menu")
        expect(menu?.hasAttribute("popover")).toBe(true)
    })

    it("should render every sorting option the view allows", async () => {
        // Arrange & Act
        await render(ExplorerSortControlComponent)

        // Assert
        expect(screen.getAllByText(SortingOption.NAME).length).toBeGreaterThan(0)
        expect(screen.getByText(SortingOption.NUMBER_OF_FILES)).not.toBeNull()
        expect(screen.getByText(SortingOption.AREA_SIZE)).not.toBeNull()
    })

    it("should offer only the sort options the hosting view scopes it to", async () => {
        // Arrange — the domain view has no area metric, so it drops Area Size
        TestBed.resetTestingModule()
        configure({ sortOptions: [SortingOption.NAME, SortingOption.NUMBER_OF_FILES] })

        // Act
        await render(ExplorerSortControlComponent)

        // Assert
        expect(screen.getAllByText(SortingOption.NAME).length).toBeGreaterThan(0)
        expect(screen.getByText(SortingOption.NUMBER_OF_FILES)).not.toBeNull()
        expect(screen.queryByText(SortingOption.AREA_SIZE)).toBeNull()
    })

    it("should show the current option and order from the per-view sort", async () => {
        // Arrange — a view whose sort is Number of Files, descending
        TestBed.resetTestingModule()
        configure({
            sort: createExplorerSortMock({
                option$: new BehaviorSubject(SortingOption.NUMBER_OF_FILES),
                ascending$: new BehaviorSubject(false)
            })
        })

        // Act
        const { container } = await render(ExplorerSortControlComponent)

        // Assert — the trigger reflects THIS view's sort
        expect(container.querySelector("[data-testid='explorer-sort-trigger']")?.textContent).toContain(SortingOption.NUMBER_OF_FILES)
    })

    it("should set the option on the per-view sort when an option is selected", async () => {
        // Arrange
        await render(ExplorerSortControlComponent)

        // Act
        await userEvent.click(screen.getByText(SortingOption.AREA_SIZE))

        // Assert
        expect(sort.setOption).toHaveBeenCalledWith(SortingOption.AREA_SIZE)
    })

    it("should toggle the order on the per-view sort when the order toggle is clicked", async () => {
        // Arrange
        await render(ExplorerSortControlComponent)

        // Act
        await userEvent.click(screen.getByText(/Sort (ascending|descending)/))

        // Assert
        expect(sort.toggleAscending).toHaveBeenCalledTimes(1)
    })

    it("should close the menu after acting on it", async () => {
        // Arrange
        const { container } = await render(ExplorerSortControlComponent)

        // Act & Assert — every menu item hides the popover it lives in
        for (const item of container.querySelectorAll("#explorer-sort-menu button")) {
            expect(item.getAttribute("popovertarget")).toBe("explorer-sort-menu")
            expect(item.getAttribute("popovertargetaction")).toBe("hide")
        }
    })
})
