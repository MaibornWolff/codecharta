import { fireEvent, render, screen } from "@testing-library/angular"

import { sortingOrderAscendingSelector } from "../../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.selector"
import { SortingButtonComponent } from "./sortingButton.component"
import { toggleSortingOrderAscending } from "../../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { TestBed } from "@angular/core/testing"

describe("SortingButtonComponent", () => {
	it("should toggle SortingOrderAscending on click", async () => {
		const { detectChanges } = await render(SortingButtonComponent, {
			providers: [provideMockStore({ selectors: [{ selector: sortingOrderAscendingSelector, value: true }] })]
		})
		const store = TestBed.inject(MockStore)

		expect(screen.getByTitle("Toggle sort order (currently ascending)")).toBeTruthy()

		const dispatchSpy = jest.spyOn(store, "dispatch")
		const button = screen.getByRole("button")
		fireEvent.click(button)
		expect(dispatchSpy).toHaveBeenCalledWith(toggleSortingOrderAscending())

		store.overrideSelector(sortingOrderAscendingSelector, false)
		store.refreshState()
		detectChanges()

		expect(screen.getByTitle("Toggle sort order (currently descending)")).toBeTruthy()
	})
})
