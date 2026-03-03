import { TestBed } from "@angular/core/testing"
import { ScenarioItemComponent } from "./scenarioItem.component"
import { ScenarioView } from "../scenarioView.model"
import { Scenario } from "../../../model/scenario.model"

const createTestView = (overrides: Partial<ScenarioView> = {}): ScenarioView => {
    const scenario: Scenario = {
        id: "test-id",
        name: "Test Scenario",
        createdAt: Date.now(),
        sections: { metrics: { areaMetric: "rloc", heightMetric: "mcc", colorMetric: "mcc" } }
    }
    return {
        scenario,
        warning: false,
        mapMismatch: false,
        mapBound: false,
        sectionKeys: ["metrics"],
        formattedDate: "1/1/2024",
        ...overrides
    }
}

describe("ScenarioItemComponent", () => {
    let component: ScenarioItemComponent

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [ScenarioItemComponent] })
        const fixture = TestBed.createComponent(ScenarioItemComponent)
        fixture.componentRef.setInput("view", createTestView())
        fixture.detectChanges()
        component = fixture.componentInstance
    })

    it("should emit applyRequested when clicked", () => {
        // Arrange
        const spy = jest.fn()
        component.applyRequested.subscribe(spy)

        // Act
        component.applyRequested.emit()

        // Assert
        expect(spy).toHaveBeenCalled()
    })

    it("should emit exportRequested", () => {
        // Arrange
        const spy = jest.fn()
        component.exportRequested.subscribe(spy)

        // Act
        component.exportRequested.emit()

        // Assert
        expect(spy).toHaveBeenCalled()
    })

    it("should emit deleteRequested", () => {
        // Arrange
        const spy = jest.fn()
        component.deleteRequested.subscribe(spy)

        // Act
        component.deleteRequested.emit()

        // Assert
        expect(spy).toHaveBeenCalled()
    })
})
