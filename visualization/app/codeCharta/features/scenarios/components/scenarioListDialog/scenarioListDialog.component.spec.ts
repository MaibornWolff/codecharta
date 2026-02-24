import { TestBed } from "@angular/core/testing"
import { provideMockStore } from "@ngrx/store/testing"
import { BehaviorSubject } from "rxjs"
import { defaultState } from "../../../../state/store/state.manager"
import { ScenarioListDialogComponent } from "./scenarioListDialog.component"
import { ScenariosService } from "../../services/scenarios.service"
import { Scenario } from "../../model/scenario.model"
import { ColorMode } from "../../../../codeCharta.model"

const createTestScenario = (name: string, id = "test-id"): Scenario => ({
    id,
    name,
    createdAt: Date.now(),
    sections: {
        metrics: {
            areaMetric: "rloc",
            heightMetric: "mcc",
            colorMetric: "mcc",
            edgeMetric: "",
            distributionMetric: "rloc",
            isColorMetricLinkedToHeightMetric: false
        },
        colors: {
            colorRange: { from: 1, to: 10 },
            colorMode: ColorMode.weightedGradient,
            mapColors: defaultState.appSettings.mapColors
        },
        camera: { position: { x: 0, y: 300, z: 1000 }, target: { x: 0, y: 0, z: 0 } },
        filters: { blacklist: [], focusedNodePath: [] },
        labelsAndFolders: {
            amountOfTopLabels: 1,
            showMetricLabelNameValue: true,
            showMetricLabelNodeName: true,
            enableFloorLabels: false,
            colorLabels: { positive: false, negative: false, neutral: false },
            markedPackages: []
        }
    }
})

describe("ScenarioListDialogComponent", () => {
    let component: ScenarioListDialogComponent
    let scenariosSubject: BehaviorSubject<Scenario[]>

    beforeEach(() => {
        scenariosSubject = new BehaviorSubject<Scenario[]>([])

        TestBed.configureTestingModule({
            imports: [ScenarioListDialogComponent],
            providers: [
                provideMockStore({ initialState: defaultState }),
                { provide: ScenariosService, useValue: { scenarios$: scenariosSubject, removeScenario: jest.fn() } }
            ]
        })

        const fixture = TestBed.createComponent(ScenarioListDialogComponent)
        component = fixture.componentInstance
        fixture.detectChanges()

        component.dialogElement().nativeElement.showModal = jest.fn()
        component.dialogElement().nativeElement.close = jest.fn()
    })

    it("should show scenarios from service", () => {
        // Arrange
        const scenarios = [createTestScenario("Scenario 1", "id-1"), createTestScenario("Scenario 2", "id-2")]

        // Act
        scenariosSubject.next(scenarios)

        // Assert
        expect(component.filteredScenarios()).toHaveLength(2)
    })

    it("should filter scenarios by name", () => {
        // Arrange
        scenariosSubject.next([createTestScenario("Complexity", "id-1"), createTestScenario("Coverage", "id-2")])

        // Act
        component.searchTerm.set("complex")

        // Assert
        expect(component.filteredScenarios()).toHaveLength(1)
        expect(component.filteredScenarios()[0].name).toBe("Complexity")
    })

    it("should emit applyRequested on scenario click", () => {
        // Arrange
        const scenario = createTestScenario("Test")
        const spy = jest.fn()
        component.applyRequested.subscribe(spy)

        // Act
        component.applyScenario(scenario)

        // Assert
        expect(spy).toHaveBeenCalledWith(expect.objectContaining({ scenario }))
    })

    it("should format date correctly", () => {
        // Act
        const formatted = component.formatDate(new Date("2024-01-15").getTime())

        // Assert
        expect(formatted).toBeDefined()
        expect(typeof formatted).toBe("string")
    })
})
