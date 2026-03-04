import { TestBed } from "@angular/core/testing"
import { ScenarioItemActionsComponent } from "./scenarioItemActions.component"

describe("ScenarioItemActionsComponent", () => {
    it("should show action buttons when not built-in", () => {
        // Arrange
        TestBed.configureTestingModule({ imports: [ScenarioItemActionsComponent] })
        const fixture = TestBed.createComponent(ScenarioItemActionsComponent)

        // Act
        fixture.componentRef.setInput("isBuiltIn", false)
        fixture.detectChanges()

        // Assert
        const buttons = fixture.nativeElement.querySelectorAll("button")
        expect(buttons.length).toBe(2)
    })

    it("should hide action buttons when built-in", () => {
        // Arrange
        TestBed.configureTestingModule({ imports: [ScenarioItemActionsComponent] })
        const fixture = TestBed.createComponent(ScenarioItemActionsComponent)

        // Act
        fixture.componentRef.setInput("isBuiltIn", true)
        fixture.detectChanges()

        // Assert
        const buttons = fixture.nativeElement.querySelectorAll("button")
        expect(buttons.length).toBe(0)
    })

    it("should emit exportRequested when export button is clicked", () => {
        // Arrange
        TestBed.configureTestingModule({ imports: [ScenarioItemActionsComponent] })
        const fixture = TestBed.createComponent(ScenarioItemActionsComponent)
        fixture.componentRef.setInput("isBuiltIn", false)
        fixture.detectChanges()
        const spy = jest.fn()
        fixture.componentInstance.exportRequested.subscribe(spy)

        // Act
        const exportButton = fixture.nativeElement.querySelector("[title='Export scenario']")
        exportButton.click()

        // Assert
        expect(spy).toHaveBeenCalled()
    })

    it("should emit deleteRequested when delete button is clicked", () => {
        // Arrange
        TestBed.configureTestingModule({ imports: [ScenarioItemActionsComponent] })
        const fixture = TestBed.createComponent(ScenarioItemActionsComponent)
        fixture.componentRef.setInput("isBuiltIn", false)
        fixture.detectChanges()
        const spy = jest.fn()
        fixture.componentInstance.deleteRequested.subscribe(spy)

        // Act
        const deleteButton = fixture.nativeElement.querySelector("[title='Delete scenario']")
        deleteButton.click()

        // Assert
        expect(spy).toHaveBeenCalled()
    })
})
