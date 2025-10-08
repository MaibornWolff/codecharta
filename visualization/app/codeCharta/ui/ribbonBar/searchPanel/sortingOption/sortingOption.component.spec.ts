import { TestBed } from "@angular/core/testing"
import { render, screen, waitFor, within } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { SortingOption } from "../../../../codeCharta.model"
import { SortingOptionComponent } from "./sortingOption.component"
import { provideMockStore } from "@ngrx/store/testing"
import { sortingOrderSelector } from "../../../../state/store/dynamicSettings/sortingOption/sortingOrder.selector"

describe("SortingOptionComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideMockStore({ selectors: [{ selector: sortingOrderSelector, value: SortingOption.NAME }] })]
        })
    })

    it("should be a select for the sorting option", async () => {
        await render(SortingOptionComponent)

        const selectElement = await screen.findByTitle("Sort by")
        expect(selectElement).toBeTruthy()

        // it offers all possible sorting Options, when clicking on it
        const trigger = selectElement.querySelector(".mat-mdc-select-trigger")
        await userEvent.click(trigger)
        const listbox = await screen.findByRole("listbox")

        // Check that Name is initially selected
        const nameOption = within(listbox).getByRole("option", { name: "Name" })
        expect(nameOption).toBeTruthy()
        expect(nameOption.getAttribute("aria-selected")).toBe("true")

        for (const option of Object.values(SortingOption)) {
            expect(within(listbox).getByRole("option", { name: option })).toBeTruthy()
        }

        // it closes itself and sets new sorting option, when clicking an option
        await userEvent.click(within(listbox).getByRole("option", { name: "Number of Files" }))
        await waitFor(() => expect(screen.queryByRole("listbox")).toBe(null))

        // Check that the value is now displayed in the select
        await waitFor(() => {
            expect(within(selectElement).getByText("Number of Files")).toBeTruthy()
        })
    })
})
