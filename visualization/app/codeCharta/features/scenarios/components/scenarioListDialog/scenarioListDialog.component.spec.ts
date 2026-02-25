import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { BehaviorSubject } from "rxjs"
import { defaultState } from "../../../../state/store/state.manager"
import { ScenarioListDialogComponent } from "./scenarioListDialog.component"
import { ScenariosService } from "../../services/scenarios.service"
import { Scenario } from "../../model/scenario.model"
import { ColorMode } from "../../../../codeCharta.model"
import { FileSelectionState, FileState } from "../../../../model/files/files"

const createTestScenario = (name: string, id = "test-id", mapFileNames?: string[]): Scenario => ({
    id,
    name,
    mapFileNames,
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

const createFileState = (fileName: string): FileState => ({
    file: {
        fileMeta: { fileName, fileChecksum: "abc", apiVersion: "1.3", projectName: "test", exportedFileSize: 100 },
        map: { name: "root", type: "Folder", children: [], attributes: {} },
        settings: { fileSettings: {} as any }
    },
    selectedAs: FileSelectionState.Partial
})

describe("ScenarioListDialogComponent", () => {
    let component: ScenarioListDialogComponent
    let scenariosSubject: BehaviorSubject<Scenario[]>
    let scenariosService: {
        scenarios$: BehaviorSubject<Scenario[]>
        removeScenario: jest.Mock
        duplicateScenario: jest.Mock
        loadScenarios: jest.Mock
    }
    let store: MockStore

    beforeEach(() => {
        scenariosSubject = new BehaviorSubject<Scenario[]>([])
        scenariosService = {
            scenarios$: scenariosSubject,
            removeScenario: jest.fn(),
            duplicateScenario: jest.fn().mockResolvedValue({}),
            loadScenarios: jest.fn().mockResolvedValue(undefined)
        }

        TestBed.configureTestingModule({
            imports: [ScenarioListDialogComponent],
            providers: [provideMockStore({ initialState: defaultState }), { provide: ScenariosService, useValue: scenariosService }]
        })

        store = TestBed.inject(MockStore)
        const fixture = TestBed.createComponent(ScenarioListDialogComponent)
        component = fixture.componentInstance
        fixture.detectChanges()

        component.dialogElement().nativeElement.showModal = jest.fn()
        component.dialogElement().nativeElement.close = jest.fn()
        component.deleteConfirmDialog().nativeElement.showModal = jest.fn()
        component.deleteConfirmDialog().nativeElement.close = jest.fn()
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

    describe("map binding", () => {
        it("should detect map-bound scenarios", () => {
            // Arrange
            const bound = createTestScenario("Bound", "id-1", ["project.cc.json"])
            const global = createTestScenario("Global", "id-2")

            // Assert
            expect(component.isMapBound(bound)).toBe(true)
            expect(component.isMapBound(global)).toBe(false)
        })

        it("should detect map mismatch when bound file is not loaded", () => {
            // Arrange
            const bound = createTestScenario("Bound", "id-1", ["project.cc.json"])
            store.setState({ ...defaultState, files: [createFileState("other.cc.json")] })

            // Assert
            expect(component.isMapMismatch(bound)).toBe(true)
        })

        it("should not detect mismatch when bound file is loaded", () => {
            // Arrange
            const bound = createTestScenario("Bound", "id-1", ["project.cc.json"])
            store.setState({ ...defaultState, files: [createFileState("project.cc.json")] })

            // Assert
            expect(component.isMapMismatch(bound)).toBe(false)
        })

        it("should not detect mismatch for global scenarios", () => {
            // Arrange
            const global = createTestScenario("Global", "id-1")

            // Assert
            expect(component.isMapMismatch(global)).toBe(false)
        })
    })

    describe("delete", () => {
        it("should open confirm dialog and set deleteTarget on requestDelete", () => {
            // Arrange
            const scenario = createTestScenario("To Delete", "id-1")

            // Act
            component.requestDelete(scenario)

            // Assert
            expect(component.deleteTarget()).toBe(scenario)
            expect(component.deleteConfirmDialog().nativeElement.showModal).toHaveBeenCalled()
        })

        it("should call removeScenario and clear target on confirmDelete", async () => {
            // Arrange
            const scenario = createTestScenario("To Delete", "id-1")
            component.requestDelete(scenario)

            // Act
            await component.confirmDelete()

            // Assert
            expect(scenariosService.removeScenario).toHaveBeenCalledWith("id-1")
            expect(component.deleteTarget()).toBeNull()
        })

        it("should clear target and close dialog on cancelDelete", () => {
            // Arrange
            const scenario = createTestScenario("To Delete", "id-1")
            component.requestDelete(scenario)

            // Act
            component.cancelDelete()

            // Assert
            expect(scenariosService.removeScenario).not.toHaveBeenCalled()
            expect(component.deleteTarget()).toBeNull()
            expect(component.deleteConfirmDialog().nativeElement.close).toHaveBeenCalled()
        })
    })

    describe("duplicate", () => {
        it("should call duplicateScenario on service", async () => {
            // Arrange
            const scenario = createTestScenario("Test", "id-1")

            // Act
            await component.duplicateScenario(scenario)

            // Assert
            expect(scenariosService.duplicateScenario).toHaveBeenCalledWith(scenario)
        })
    })
})
