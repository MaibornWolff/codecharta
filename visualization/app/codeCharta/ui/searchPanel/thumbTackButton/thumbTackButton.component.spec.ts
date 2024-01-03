import { fireEvent, render, screen } from "@testing-library/angular"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { TestBed } from "@angular/core/testing"

import { ThumbTackButtonComponent } from "./thumbTackButton.component"
import { isFileExplorerPinnedSelector } from "../../../state/store/appSettings/isFileExplorerPinned/isFileExplorerPinned.selector"
import { toggleIsFileExplorerPinned } from "../../../state/store/appSettings/isFileExplorerPinned/isFileExplorerPinned.actions"

describe("ThumbTackButtonComponent", () => {
	it("should toggle isFileExplorerPinned on click", async () => {
		const { detectChanges } = await render(ThumbTackButtonComponent, {
			providers: [provideMockStore({ selectors: [{ selector: isFileExplorerPinnedSelector, value: true }] })]
		})
		const store = TestBed.inject(MockStore)

		expect(screen.getByTitle("Pin file explorer")).toBeTruthy()

		const dispatchSpy = jest.spyOn(store, "dispatch")
		const button = screen.getByRole("button")
		fireEvent.click(button)
		expect(dispatchSpy).toHaveBeenCalledWith(toggleIsFileExplorerPinned())

		store.overrideSelector(isFileExplorerPinnedSelector, false)
		store.refreshState()
		detectChanges()

		expect(screen.getByTitle("Pin file explorer")).toBeTruthy()
	})
})
