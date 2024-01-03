import { fireEvent, render, screen } from "@testing-library/angular"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { TestBed } from "@angular/core/testing"

import { ThumbTackButtonComponent } from "./thumbTackButton.component"
import { isSearchPanelPinnedSelector } from "../../../state/store/appSettings/isSearchPanelPinned/isSearchPanelPinned.selector"
import { toggleIsSearchPanelPinned } from "../../../state/store/appSettings/isSearchPanelPinned/isSearchPanelPinned.actions"

describe("ThumbTackButtonComponent", () => {
	it("should toggle isSearchPanelPinned on click", async () => {
		const { detectChanges } = await render(ThumbTackButtonComponent, {
			providers: [provideMockStore({ selectors: [{ selector: isSearchPanelPinnedSelector, value: true }] })]
		})
		const store = TestBed.inject(MockStore)

		expect(screen.getByTitle("Pin file explorer")).toBeTruthy()

		const dispatchSpy = jest.spyOn(store, "dispatch")
		const button = screen.getByRole("button")
		fireEvent.click(button)
		expect(dispatchSpy).toHaveBeenCalledWith(toggleIsSearchPanelPinned())

		store.overrideSelector(isSearchPanelPinnedSelector, false)
		store.refreshState()
		detectChanges()

		expect(screen.getByTitle("Pin file explorer")).toBeTruthy()
	})
})
