import { TestBed } from "@angular/core/testing"
import { MatSelectModule } from "@angular/material/select"
import { fireEvent, render, screen, getByText, waitForElementToBeRemoved } from "@testing-library/angular"

import { SortingOption } from "../../../codeCharta.model"
import { Store } from "../../../state/store/store"
import { SortingOptionComponent } from "./sortingOption.component"

describe("SortingOptionComponent", () => {
	beforeEach(() => {
		Store["initialize"]()

		TestBed.configureTestingModule({
			imports: [MatSelectModule]
		})
	})

	it("should have an explaining title", async () => {
		await render(SortingOptionComponent)
		expect(await screen.findByTitle("Sort by")).toBeTruthy()
	})

	it("should be a select for the sorting option", async () => {
		const { detectChanges } = await render(SortingOptionComponent)
		detectChanges()

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
