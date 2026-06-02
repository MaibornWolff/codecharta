import { TestBed } from "@angular/core/testing"
import { Store, StoreModule } from "@ngrx/store"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { SortingOption } from "../../../../codeCharta.model"
import { toggleSortingOrderAscending } from "../../../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"
import { setSortingOption } from "../../../../state/store/dynamicSettings/sortingOption/sortingOption.actions"
import { appReducers, setStateMiddleware } from "../../../../state/store/state.manager"
import { ExplorerSortControlComponent } from "./explorerSortControl.component"

describe("ExplorerSortControlComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ExplorerSortControlComponent, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
    })

    it("should not render the option list initially", async () => {
        // Arrange & Act
        await render(ExplorerSortControlComponent)

        // Assert
        expect(screen.queryByText(SortingOption.NUMBER_OF_FILES)).toBeNull()
        expect(screen.queryByText(SortingOption.AREA_SIZE)).toBeNull()
    })

    it("should render every sorting option once the trigger is clicked", async () => {
        // Arrange
        await render(ExplorerSortControlComponent)

        // Act
        await userEvent.click(screen.getByTitle(`Sort: ${SortingOption.NAME}`))

        // Assert
        expect(screen.getAllByText(SortingOption.NAME).length).toBeGreaterThan(0)
        expect(screen.getByText(SortingOption.NUMBER_OF_FILES)).not.toBeNull()
        expect(screen.getByText(SortingOption.AREA_SIZE)).not.toBeNull()
    })

    it("should dispatch setSortingOption and close the menu when an option is selected", async () => {
        // Arrange
        await render(ExplorerSortControlComponent)
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")
        await userEvent.click(screen.getByTitle(`Sort: ${SortingOption.NAME}`))

        // Act
        await userEvent.click(screen.getByText(SortingOption.AREA_SIZE))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setSortingOption({ value: SortingOption.AREA_SIZE }))
        expect(screen.queryByText(SortingOption.NUMBER_OF_FILES)).toBeNull()
    })

    it("should dispatch toggleSortingOrderAscending and close the menu when the order toggle is clicked", async () => {
        // Arrange
        await render(ExplorerSortControlComponent)
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")
        await userEvent.click(screen.getByTitle(`Sort: ${SortingOption.NAME}`))

        // Act
        await userEvent.click(screen.getByText(/Sort (ascending|descending)/))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(toggleSortingOrderAscending())
        expect(screen.queryByText(SortingOption.NUMBER_OF_FILES)).toBeNull()
    })

    it("should close the menu when clicking outside the component", async () => {
        // Arrange
        await render(ExplorerSortControlComponent)
        await userEvent.click(screen.getByTitle(`Sort: ${SortingOption.NAME}`))
        expect(screen.queryByText(SortingOption.AREA_SIZE)).not.toBeNull()

        // Act
        await userEvent.click(document.body)

        // Assert
        expect(screen.queryByText(SortingOption.AREA_SIZE)).toBeNull()
    })
})
