import { TestBed } from "@angular/core/testing"
import { fireEvent, render, screen, waitForElementToBeRemoved } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { LayoutAlgorithm } from "../../../../../codeCharta.model"
import { setLayoutAlgorithm } from "../../../../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
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

	it("should not display max tree map files slider when layout selection is NOT 'TreeMapStreet'", async () => {
		await render(MapLayoutSelectionComponent, { excludeComponentDeclaration: true })
		expect(screen.queryByText("Maximum TreeMap Files")).toBe(null)
	})

	it("should display max tree map files slider when layout selection is 'TreeMapStreet'", async () => {
		Store.dispatch(setLayoutAlgorithm(LayoutAlgorithm.TreeMapStreet))
		await render(MapLayoutSelectionComponent, { excludeComponentDeclaration: true })

		expect(screen.queryByText("Maximum TreeMap Files")).not.toBe(null)
		const maxTreeMapFilesValue = "100"
		expect(screen.queryByText(maxTreeMapFilesValue)).not.toBe(null)

		const inputField = screen.getByRole("spinbutton") as HTMLInputElement
		await userEvent.type(inputField, "42", { initialSelectionStart: 0, initialSelectionEnd: 3 })
		await waitForElementToBeRemoved(() => screen.queryByText(maxTreeMapFilesValue))
		expect(screen.queryByText("42")).not.toBe(null)
	})
})
