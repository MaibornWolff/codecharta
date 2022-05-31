import { InvertAreaOptionComponent } from "./invertAreaOption.component"
import { fireEvent, render } from "@testing-library/angular"
import { TestBed } from "@angular/core/testing"
import { MaterialModule } from "../../../../../material/material.module"
import { invertAreaSelector } from "../../../../state/store/appSettings/invertArea/invertArea.selector"
import { Store } from "../../../../state/store/store"

describe("InvertAreaOptionComponent", () => {
	beforeEach(() => {
		Store["initialize"]()
		TestBed.configureTestingModule({
			imports: [MaterialModule]
		})
	})

	it("should toggle inverting the area of buildings on click", async () => {
		const { container } = await render(InvertAreaOptionComponent)
		const isInvertedArea = invertAreaSelector(Store.store.getState())
		const checkbox = container.querySelector("input")

		expect(checkbox.checked).toBeFalsy()

		fireEvent.click(checkbox)

		expect(checkbox.checked).toBeTruthy()

		expect(invertAreaSelector(Store.store.getState())).toBe(!isInvertedArea)
	})
})
