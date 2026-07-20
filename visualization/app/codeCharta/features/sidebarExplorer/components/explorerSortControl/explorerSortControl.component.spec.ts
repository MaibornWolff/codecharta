import { TestBed } from "@angular/core/testing"
import { Store, StoreModule } from "@ngrx/store"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { SortingOption } from "../../../../model/codeCharta.model"
import { setSortingOption, toggleSortingOrderAscending } from "../../../../stores/preferences/preferences.write.facade"
import { appReducers, setStateMiddleware } from "../../../../stores/rootStore/store"
import { ExplorerSortControlComponent } from "./explorerSortControl.component"

describe("ExplorerSortControlComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ExplorerSortControlComponent, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
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

    it("should render every sorting option in the menu", async () => {
        // Arrange & Act
        await render(ExplorerSortControlComponent)

        // Assert
        expect(screen.getAllByText(SortingOption.NAME).length).toBeGreaterThan(0)
        expect(screen.getByText(SortingOption.NUMBER_OF_FILES)).not.toBeNull()
        expect(screen.getByText(SortingOption.AREA_SIZE)).not.toBeNull()
    })

    it("should dispatch setSortingOption when an option is selected", async () => {
        // Arrange
        await render(ExplorerSortControlComponent)
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")

        // Act
        await userEvent.click(screen.getByText(SortingOption.AREA_SIZE))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setSortingOption({ value: SortingOption.AREA_SIZE }))
    })

    it("should dispatch toggleSortingOrderAscending when the order toggle is clicked", async () => {
        // Arrange
        await render(ExplorerSortControlComponent)
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")

        // Act
        await userEvent.click(screen.getByText(/Sort (ascending|descending)/))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(toggleSortingOrderAscending())
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
