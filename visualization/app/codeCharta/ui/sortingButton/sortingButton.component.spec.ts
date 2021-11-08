import { fireEvent, render, screen } from "@testing-library/angular"

import { Store } from "../../state/store/store"
import { sortingOrderAscendingSelector } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.selector"
import { SortingButtonComponent } from "./sortingButton.component"
import { setSortingOrderAscending } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"

describe("SortingButtonComponent", () => {
	beforeEach(() => {
		Store["initialize"]()
	})

	it("should toggle SortingOrderAscending on click", async () => {
		await render(SortingButtonComponent)
		const initialSortingOrder = sortingOrderAscendingSelector(Store.store.getState())

		const button = screen.getByRole("button")
		fireEvent.click(button)

		expect(sortingOrderAscendingSelector(Store.store.getState())).toBe(!initialSortingOrder)
	})

	it("should set title of button according to current sorting order", async () => {
		const { detectChanges } = await render(SortingButtonComponent)
		expect(screen.getByTitle("Toggle sort order (currently ascending)")).toBeTruthy()

		Store.store.dispatch(setSortingOrderAscending(false))
		detectChanges()

		expect(screen.getByTitle("Toggle sort order (currently descending)")).toBeTruthy()
	})
})
