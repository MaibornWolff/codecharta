import { TestBed } from "@angular/core/testing"
import { fireEvent, render, screen, waitForElementToBeRemoved } from "@testing-library/angular"
import { Store } from "../../../../../state/store/store"
import { DisplayQualitySelectionComponent } from "./displayQualitySelection.component"
import { DisplayQualitySelectionModule } from "./displayQualitySelection.module"

describe("DisplayQualitySelectionComponent", () => {
	beforeEach(() => {
		Store["initialize"]()
		TestBed.configureTestingModule({
			imports: [DisplayQualitySelectionModule]
		})
	})

	it("should change display quality selection", async () => {
		const { detectChanges } = await render(DisplayQualitySelectionComponent, { excludeComponentDeclaration: true })
		detectChanges()

		const initialDisplayQualitySelection = screen.getByText("High")
		expect(initialDisplayQualitySelection).not.toBe(null)

		fireEvent.click(initialDisplayQualitySelection)
		const anotherDisplayQualityOption = screen.getByText("Low")
		fireEvent.click(anotherDisplayQualityOption)
		await waitForElementToBeRemoved(() => screen.getByRole("listbox"))
		expect(screen.getByText("Low")).not.toBe(null)
	})
})
