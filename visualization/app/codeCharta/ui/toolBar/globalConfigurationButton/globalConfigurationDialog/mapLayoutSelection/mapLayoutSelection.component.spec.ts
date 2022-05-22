import { TestBed } from "@angular/core/testing"
import { fireEvent, render, screen, waitForElementToBeRemoved } from "@testing-library/angular"
import { Store } from "../../../../../state/store/store"
import { MapLayoutSelectionComponent } from "./mapLayoutSelection.component"
import { MapLayoutSelectionModule } from "./mapLayoutSelection.module"

describe("MapLayoutSelectionComponent", () => {
	beforeEach(() => {
		Store["initialize"]()
		TestBed.configureTestingModule({
			imports: [MapLayoutSelectionModule]
		})
	})

	it("should change map layout selection", async () => {
		const { detectChanges } = await render(MapLayoutSelectionComponent, { excludeComponentDeclaration: true })
		detectChanges()

		const initialLayoutSelection = screen.getByText("Squarified TreeMap")
		expect(initialLayoutSelection).not.toBe(null)

		fireEvent.click(initialLayoutSelection)
		const anotherLayoutOption = screen.getByText("StreetMap")
		fireEvent.click(anotherLayoutOption)
		await waitForElementToBeRemoved(() => screen.getByRole("listbox"))
		expect(screen.getByText("StreetMap")).not.toBe(null)
	})
})
