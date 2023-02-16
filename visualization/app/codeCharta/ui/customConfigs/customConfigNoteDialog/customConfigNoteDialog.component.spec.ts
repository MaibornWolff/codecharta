import { ComponentFixture, TestBed } from "@angular/core/testing"

import { CustomConfigNoteDialogComponent } from "./editCustomConfigNoteDialog.component"

describe("EditCustomConfigNoteDialogComponent", () => {
	let component: CustomConfigNoteDialogComponent
	let fixture: ComponentFixture<CustomConfigNoteDialogComponent>

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [CustomConfigNoteDialogComponent]
		}).compileComponents()

		fixture = TestBed.createComponent(CustomConfigNoteDialogComponent)
		component = fixture.componentInstance
		fixture.detectChanges()
	})

	it("should create", () => {
		expect(component).toBeTruthy()
	})
})
