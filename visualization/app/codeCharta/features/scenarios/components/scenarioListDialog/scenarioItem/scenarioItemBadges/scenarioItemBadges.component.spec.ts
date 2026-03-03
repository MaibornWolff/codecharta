import { TestBed } from "@angular/core/testing"
import { ScenarioItemBadgesComponent } from "./scenarioItemBadges.component"
import { ScenarioView } from "../../scenarioListDialog.component"
import { Scenario } from "../../../../model/scenario.model"

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

describe("ScenarioItemBadgesComponent", () => {
    it("should create with required view input", () => {
        // Arrange
        TestBed.configureTestingModule({ imports: [ScenarioItemBadgesComponent] })
        const fixture = TestBed.createComponent(ScenarioItemBadgesComponent)

        // Act
        fixture.componentRef.setInput("view", createTestView())
        fixture.detectChanges()

        // Assert
        expect(fixture.componentInstance).toBeTruthy()
    })

    it("should show built-in badge for built-in scenarios", () => {
        // Arrange
        TestBed.configureTestingModule({ imports: [ScenarioItemBadgesComponent] })
        const fixture = TestBed.createComponent(ScenarioItemBadgesComponent)

        // Act
        fixture.componentRef.setInput("view", createTestView({ scenario: { ...createTestView().scenario, isBuiltIn: true } }))
        fixture.detectChanges()

        // Assert
        const badge = fixture.nativeElement.querySelector(".badge-info")
        expect(badge.textContent.trim()).toBe("Built-in")
    })

    it("should show formatted date for custom scenarios", () => {
        // Arrange
        TestBed.configureTestingModule({ imports: [ScenarioItemBadgesComponent] })
        const fixture = TestBed.createComponent(ScenarioItemBadgesComponent)

        // Act
        fixture.componentRef.setInput("view", createTestView({ formattedDate: "3/1/2026" }))
        fixture.detectChanges()

        // Assert
        const dateSpan = fixture.nativeElement.querySelector(".text-base-content\\/40")
        expect(dateSpan.textContent.trim()).toBe("3/1/2026")
    })

    it("should show map-pin badge when map is bound", () => {
        // Arrange
        TestBed.configureTestingModule({ imports: [ScenarioItemBadgesComponent] })
        const fixture = TestBed.createComponent(ScenarioItemBadgesComponent)
        const view = createTestView({
            mapBound: true,
            scenario: { ...createTestView().scenario, mapFileNames: ["file1.cc.json"] }
        })

        // Act
        fixture.componentRef.setInput("view", view)
        fixture.detectChanges()

        // Assert
        const pinBadge = fixture.nativeElement.querySelector(".fa-map-pin")
        expect(pinBadge).toBeTruthy()
    })

    it("should render section icons for each section key", () => {
        // Arrange
        TestBed.configureTestingModule({ imports: [ScenarioItemBadgesComponent] })
        const fixture = TestBed.createComponent(ScenarioItemBadgesComponent)

        // Act
        fixture.componentRef.setInput("view", createTestView({ sectionKeys: ["metrics", "colors"] }))
        fixture.detectChanges()

        // Assert
        const icons = fixture.nativeElement.querySelectorAll(".fa-bar-chart, .fa-paint-brush")
        expect(icons.length).toBe(2)
    })
})
