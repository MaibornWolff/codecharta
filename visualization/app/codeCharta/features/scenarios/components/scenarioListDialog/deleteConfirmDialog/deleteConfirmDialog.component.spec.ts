import { TestBed } from "@angular/core/testing"
import { DeleteConfirmDialogComponent } from "./deleteConfirmDialog.component"

describe("DeleteConfirmDialogComponent", () => {
    let component: DeleteConfirmDialogComponent

    beforeEach(() => {
        HTMLDialogElement.prototype.showModal = jest.fn()
        HTMLDialogElement.prototype.close = jest.fn()

        TestBed.configureTestingModule({ imports: [DeleteConfirmDialogComponent] })
        const fixture = TestBed.createComponent(DeleteConfirmDialogComponent)
        fixture.componentRef.setInput("scenarioName", "My Scenario")
        fixture.detectChanges()
        component = fixture.componentInstance
    })

    it("should open the dialog", () => {
        // Act
        component.open()

        // Assert
        expect(component.dialogElement().nativeElement.showModal).toHaveBeenCalled()
    })

    it("should emit confirmed and close dialog on confirm", () => {
        // Arrange
        const spy = jest.fn()
        component.confirmed.subscribe(spy)

        // Act
        component.confirm()

        // Assert
        expect(spy).toHaveBeenCalled()
        expect(component.dialogElement().nativeElement.close).toHaveBeenCalled()
    })

    it("should emit cancelled and close dialog on cancel", () => {
        // Arrange
        const spy = jest.fn()
        component.cancelled.subscribe(spy)

        // Act
        component.cancel()

        // Assert
        expect(spy).toHaveBeenCalled()
        expect(component.dialogElement().nativeElement.close).toHaveBeenCalled()
    })
})
