import { ComponentFixture, TestBed } from "@angular/core/testing"

import { ManageCustomConfigNoteDialogComponent } from "./manageCustomConfigNoteDialog.component"

describe("ManageCustomConfigNoteDialogComponent", () => {
	let component: ManageCustomConfigNoteDialogComponent
	let fixture: ComponentFixture<ManageCustomConfigNoteDialogComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ManageCustomConfigNoteDialogComponent]
		}).compileComponents()

		fixture = TestBed.createComponent(ManageCustomConfigNoteDialogComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it("should create", () => {
		expect(component).toBeTruthy()
	})
})
