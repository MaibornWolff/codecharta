import { TestBed } from "@angular/core/testing"
import { SaveScenarioDialogComponent } from "./saveScenarioDialog.component"
import { ScenariosService } from "../../services/scenarios.service"

describe("SaveScenarioDialogComponent", () => {
    let component: SaveScenarioDialogComponent
    let scenariosService: { saveScenario: jest.Mock }

    beforeEach(() => {
        scenariosService = { saveScenario: jest.fn().mockResolvedValue({}) }

        TestBed.configureTestingModule({
            imports: [SaveScenarioDialogComponent],
            providers: [{ provide: ScenariosService, useValue: scenariosService }]
        })

        const fixture = TestBed.createComponent(SaveScenarioDialogComponent)
        component = fixture.componentInstance
        fixture.detectChanges()

        component.dialogElement().nativeElement.showModal = jest.fn()
        component.dialogElement().nativeElement.close = jest.fn()
    })

    it("should require a name", () => {
        // Assert
        expect(component.nameValid()).toBe(false)
    })

    it("should be valid when name is provided", () => {
        // Act
        component.name.set("My Scenario")

        // Assert
        expect(component.nameValid()).toBe(true)
    })

    it("should call saveScenario on save", async () => {
        // Arrange
        component.name.set("My Scenario")
        component.description.set("A description")

        // Act
        await component.save()

        // Assert
        expect(scenariosService.saveScenario).toHaveBeenCalledWith("My Scenario", "A description")
    })

    it("should not call saveScenario when name is invalid", async () => {
        // Act
        await component.save()

        // Assert
        expect(scenariosService.saveScenario).not.toHaveBeenCalled()
    })

    it("should pass undefined description when empty", async () => {
        // Arrange
        component.name.set("Test")
        component.description.set("")

        // Act
        await component.save()

        // Assert
        expect(scenariosService.saveScenario).toHaveBeenCalledWith("Test", undefined)
    })
})
