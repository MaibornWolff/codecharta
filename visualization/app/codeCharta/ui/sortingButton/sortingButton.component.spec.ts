import { fireEvent, render, screen } from "@testing-library/angular"

import { Store } from "../../state/store/store"
import { sortingOrderAscendingSelector } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.selector"
import { SortingButtonComponent } from "./sortingButton.component"

describe("SortingButtonComponent", () => {
	beforeEach(() => {
		Store["initialize"]()
	})

	it("should toggle SortingOrderAscending on click", async () => {
		await render(SortingButtonComponent)
		const initialSortingOrder = sortingOrderAscendingSelector(Store.store.getState())
		expect(initialSortingOrder).toBe(false)

		const button = screen.getByTitle("Toggle sort order (currently descending)")
		fireEvent.click(button)

		expect(screen.getByTitle("Toggle sort order (currently ascending)")).toBeTruthy()
		expect(sortingOrderAscendingSelector(Store.store.getState())).toBe(!initialSortingOrder)
	})
})
