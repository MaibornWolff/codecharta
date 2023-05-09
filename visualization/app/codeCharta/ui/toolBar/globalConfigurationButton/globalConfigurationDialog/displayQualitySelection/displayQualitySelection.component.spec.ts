import { TestBed } from "@angular/core/testing"
import { fireEvent, render, screen, waitForElementToBeRemoved } from "@testing-library/angular"
import { provideMockStore, MockStore } from "@ngrx/store/testing"
import { DisplayQualitySelectionComponent } from "./displayQualitySelection.component"
import { DisplayQualitySelectionModule } from "./displayQualitySelection.module"
import { sharpnessModeSelector } from "../../../../../state/store/appSettings/sharpnessMode/sharpnessMode.selector"
import { SharpnessMode } from "../../../../../codeCharta.model"
import { getLastAction } from "../../../../../util/testUtils/store.utils"
import { setSharpnessMode } from "../../../../../state/store/appSettings/sharpnessMode/sharpnessMode.actions"

describe("DisplayQualitySelectionComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [DisplayQualitySelectionModule],
			providers: [
				provideMockStore({
					selectors: [{ selector: sharpnessModeSelector, value: SharpnessMode.Standard }]
				})
			]
		})
	})

	it("should change display quality selection", async () => {
		const { detectChanges } = await render(DisplayQualitySelectionComponent, { excludeComponentDeclaration: true })
		const store = TestBed.inject(MockStore)
		detectChanges()

		const initialDisplayQualitySelection = screen.getByText("High")

		fireEvent.click(initialDisplayQualitySelection)
		const anotherDisplayQualityOption = screen.getByText("Low")
		fireEvent.click(anotherDisplayQualityOption)
		await waitForElementToBeRemoved(() => screen.getByRole("listbox"))
		expect(await getLastAction(store)).toEqual(setSharpnessMode({ value: SharpnessMode.PixelRatioNoAA }))
	})
})
