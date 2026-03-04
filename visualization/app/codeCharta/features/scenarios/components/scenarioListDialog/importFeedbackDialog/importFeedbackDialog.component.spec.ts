import { TestBed } from "@angular/core/testing"
import { ImportFeedbackDialogComponent } from "./importFeedbackDialog.component"

describe("ImportFeedbackDialogComponent", () => {
    let component: ImportFeedbackDialogComponent

    beforeEach(() => {
        HTMLDialogElement.prototype.showModal = jest.fn()
        HTMLDialogElement.prototype.close = jest.fn()

        TestBed.configureTestingModule({ imports: [ImportFeedbackDialogComponent] })
        const fixture = TestBed.createComponent(ImportFeedbackDialogComponent)
        fixture.detectChanges()
        component = fixture.componentInstance
    })

    it("should open dialog when there are errors", () => {
        // Arrange
        const result = { imported: 0, duplicates: [], invalid: ["bad.json"], parseErrors: [] }

        // Act
        component.open(result)

        // Assert
        expect(component.feedback.invalid).toEqual(["bad.json"])
        expect(component.dialogElement().nativeElement.showModal).toHaveBeenCalled()
    })

    it("should not open dialog when import has no issues", () => {
        // Arrange
        const result = { imported: 1, duplicates: [], invalid: [], parseErrors: [] }

        // Act
        component.open(result)

        // Assert
        expect(component.dialogElement().nativeElement.showModal).not.toHaveBeenCalled()
    })

    it("should clear feedback and close dialog on close", () => {
        // Arrange
        component.open({ imported: 0, duplicates: ["Dup"], invalid: [], parseErrors: [] })
        const closeSpy = jest.fn()
        component.closed.subscribe(closeSpy)

        // Act
        component.close()

        // Assert
        expect(component.feedback).toEqual({ duplicates: [], invalid: [], parseErrors: [] })
        expect(component.dialogElement().nativeElement.close).toHaveBeenCalled()
        expect(closeSpy).toHaveBeenCalled()
    })

    it("should show duplicates as warnings", () => {
        // Arrange
        const result = { imported: 0, duplicates: ["My Scenario"], invalid: [], parseErrors: [] }

        // Act
        component.open(result)

        // Assert
        expect(component.feedback.duplicates).toEqual(["My Scenario"])
    })

    it("should show parse errors", () => {
        // Arrange
        const result = { imported: 0, duplicates: [], invalid: [], parseErrors: ["broken.json"] }

        // Act
        component.open(result)

        // Assert
        expect(component.feedback.parseErrors).toEqual(["broken.json"])
    })
})
