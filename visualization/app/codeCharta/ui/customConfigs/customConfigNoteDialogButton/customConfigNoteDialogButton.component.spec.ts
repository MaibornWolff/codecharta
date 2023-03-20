import { TestBed } from "@angular/core/testing"

import { CustomConfigHelper } from "../../../util/customConfigHelper"
import { CustomConfigNoteDialogButtonModule } from "./customConfigNoteDialogButton.module"
import { fireEvent, render, screen } from "@testing-library/angular"
import { CustomConfigNoteDialogButtonComponent } from "./customConfigNoteDialogButton.component"

describe("customConfigNoteDialogComponent", () => {
	jest.spyOn(CustomConfigHelper, "getConfigNameSuggestionByFileState").mockReturnValue("new custom view name")

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [CustomConfigNoteDialogButtonModule],
			providers: []
		})
	})

	it("should render a clickable button to add a custom note", async () => {
		await render(CustomConfigNoteDialogButtonComponent, { excludeComponentDeclaration: true })

		const button = screen.getByTitle("Edit/View Note").closest("button") as HTMLButtonElement
		expect(button).toBeTruthy()
		expect(button.disabled).not.toBeTruthy()
		fireEvent.click(button)
	})
})
