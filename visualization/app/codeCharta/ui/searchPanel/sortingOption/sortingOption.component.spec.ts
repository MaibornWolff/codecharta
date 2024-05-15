import { TestBed } from "@angular/core/testing"
import { MatSelectModule } from "@angular/material/select"
import { fireEvent, render, screen, getByText, waitForElementToBeRemoved } from "@testing-library/angular"

import { SortingOption } from "../../../codeCharta.model"
import { SortingOptionComponent } from "./sortingOption.component"
import { provideMockStore } from "@ngrx/store/testing"
import { sortingOrderSelector } from "../../../state/store/dynamicSettings/sortingOption/sortingOrder.selector"

describe("SortingOptionComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSelectModule],
            providers: [provideMockStore({ selectors: [{ selector: sortingOrderSelector, value: SortingOption.NAME }] })]
        })
    })

    it("should be a select for the sorting option", async () => {
        const { detectChanges } = await render(SortingOptionComponent)
        detectChanges()

        expect(await screen.findByTitle("Sort by")).toBeTruthy()

        // it has initial sorting order
        expect(screen.getByText("Name")).toBeTruthy()

        // it offers all possible sorting Options, when clicking on it
        const selectBoxTrigger = screen.getByRole("combobox").firstChild as HTMLElement
        fireEvent.click(selectBoxTrigger)
        const selectOptionsWrapper = screen.getByRole("listbox")
        for (const option of Object.values(SortingOption)) {
            expect(getByText(selectOptionsWrapper, option)).toBeTruthy()
        }

        // it closes itself and sets new sorting option, when clicking an option
        const sortByNumberOfFiles = getByText(selectOptionsWrapper, "Number of Files")
        fireEvent.click(sortByNumberOfFiles)
        await waitForElementToBeRemoved(() => screen.getByRole("listbox"))
        expect(screen.getByText("Number of Files")).toBeTruthy()
    })
})
