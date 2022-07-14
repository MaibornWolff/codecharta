import { TestBed } from "@angular/core/testing"
import { fireEvent, render, screen } from "@testing-library/angular"
import { State } from "../../../state/angular-redux/state"
import { Store } from "../../../state/angular-redux/store"
import { addFile, setStandard } from "../../../state/store/files/files.actions"
import { TEST_FILE_DATA } from "../../../util/dataMocks"
import { FilePanelModule } from "../filePanel.module"
import { FilePanelFileSelectorComponent } from "./filePanelFileSelector.component"

describe("filePanelFileSelectorComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [FilePanelModule]
		})
	})

	it("should not apply zero selection to store and restore it on close", async () => {
		const { debug, detectChanges, fixture } = await render(FilePanelFileSelectorComponent, { excludeComponentDeclaration: true })
		const store = TestBed.inject(Store)
		const state = TestBed.inject(State)
		store.dispatch(addFile(TEST_FILE_DATA))
		store.dispatch(setStandard([TEST_FILE_DATA]))
		detectChanges()

		console.log(fixture.componentInstance["selectedFilesInStore"][0])
		console.log(state.getValue().files[0])
		console.log(state.getValue().files[0].file === fixture.componentInstance["selectedFilesInStore"][0])

		const selectBoxTrigger = screen.getByRole("combobox").querySelector(".mat-select-trigger") as HTMLElement
		fireEvent.click(selectBoxTrigger)
		detectChanges()
		let selectOptionsWrapper = screen.getByRole("listbox")
		expect(selectOptionsWrapper.querySelectorAll('[ng-reflect-state="checked"]').length).toBe(1)

		const deselectAllButton = screen.getByText("None")
		fireEvent.click(deselectAllButton)
		// detectChanges()

		selectOptionsWrapper = screen.getByRole("listbox")
		debug(selectOptionsWrapper)
		expect(selectOptionsWrapper.querySelectorAll('[ng-reflect-state="unchecked"]').length).toBe(1)
	})
})
