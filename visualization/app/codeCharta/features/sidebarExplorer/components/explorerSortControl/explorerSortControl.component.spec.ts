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

    it("should render every sorting option", async () => {
        // Arrange & Act
        await render(ExplorerSortControlComponent)

        // Assert
        expect(screen.getAllByText(SortingOption.NAME).length).toBeGreaterThan(0)
        expect(screen.getByText(SortingOption.NUMBER_OF_FILES)).not.toBe(null)
        expect(screen.getByText(SortingOption.AREA_SIZE)).not.toBe(null)
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

    it("should dispatch toggleSortingOrderAscending when sort order toggle is clicked", async () => {
        // Arrange
        await render(ExplorerSortControlComponent)
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")

        // Act
        await userEvent.click(screen.getByText(/Sort (ascending|descending)/))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(toggleSortingOrderAscending())
    })
})
