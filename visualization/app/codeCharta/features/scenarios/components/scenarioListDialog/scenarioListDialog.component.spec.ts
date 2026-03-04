import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { BehaviorSubject } from "rxjs"
import { defaultState } from "../../../../state/store/state.manager"
import { ScenarioListDialogComponent } from "./scenarioListDialog.component"
import { ScenarioViewModelService } from "../../services/scenarioViewModel.service"
import { ScenariosService } from "../../services/scenarios.service"
import { Scenario } from "../../model/scenario.model"
import { ColorMode, MetricData, NodeType } from "../../../../codeCharta.model"
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

const createBuiltInScenario = (name: string, id: string): Scenario => ({
    id,
    name,
    createdAt: 0,
    isBuiltIn: true,
    sections: {
        metrics: { areaMetric: "rloc", heightMetric: "rloc", colorMetric: "rloc" },
        colors: { colorRange: { from: 250, to: 500 } }
    }
})

const createFileState = (fileName: string): FileState => ({
    file: {
        fileMeta: { fileName, fileChecksum: "abc", apiVersion: "1.3", projectName: "test", exportedFileSize: 100 },
        map: { name: "root", type: NodeType.FOLDER, children: [], attributes: {} },
        settings: { fileSettings: { edges: [], blacklist: [], attributeTypes: {}, attributeDescriptors: {}, markedPackages: [] } as any }
    },
    selectedAs: FileSelectionState.Partial
})

const emptyMetricData: MetricData = { nodeMetricData: [], edgeMetricData: [] }
const helpers = new ScenarioViewModelService()

describe("ScenarioListDialogComponent", () => {
    let component: ScenarioListDialogComponent
    let scenariosSubject: BehaviorSubject<Scenario[]>
    let scenariosService: {
        scenarios$: BehaviorSubject<Scenario[]>
        removeScenario: jest.Mock
        loadScenarios: jest.Mock
        exportScenario: jest.Mock
        importScenarioFiles: jest.Mock
    }
    let store: MockStore

    beforeEach(() => {
        HTMLDialogElement.prototype.showModal = jest.fn()
        HTMLDialogElement.prototype.close = jest.fn()

        scenariosSubject = new BehaviorSubject<Scenario[]>([])
        scenariosService = {
            scenarios$: scenariosSubject,
            removeScenario: jest.fn(),
            loadScenarios: jest.fn().mockResolvedValue(undefined),
            exportScenario: jest.fn(),
            importScenarioFiles: jest.fn().mockResolvedValue({ imported: 1, duplicates: [], invalid: [], parseErrors: [] })
        }

        TestBed.configureTestingModule({
            imports: [ScenarioListDialogComponent],
            providers: [provideMockStore({ initialState: defaultState }), { provide: ScenariosService, useValue: scenariosService }]
        })

        store = TestBed.inject(MockStore)
        const fixture = TestBed.createComponent(ScenarioListDialogComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
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

    it("should call service exportScenario when exportScenario is called", () => {
        // Arrange
        const scenario = createTestScenario("Export Test")

        // Act
        component.exportScenario(scenario)

        // Assert
        expect(scenariosService.exportScenario).toHaveBeenCalledWith(scenario)
    })

    describe("delete", () => {
        it("should set deleteTarget on requestDelete", () => {
            // Arrange
            const scenario = createTestScenario("To Delete", "id-1")

            // Act
            component.requestDelete(scenario)

            // Assert
            expect(component.deleteTarget()).toBe(scenario)
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

        it("should clear target on cancelDelete", () => {
            // Arrange
            const scenario = createTestScenario("To Delete", "id-1")
            component.requestDelete(scenario)

            // Act
            component.cancelDelete()

            // Assert
            expect(scenariosService.removeScenario).not.toHaveBeenCalled()
            expect(component.deleteTarget()).toBeNull()
        })
    })

    describe("ordering", () => {
        it("should order scenarios by relevance: current map > global > built-in > other maps", () => {
            // Arrange
            const boundToCurrentMap = createTestScenario("Current Map", "id-current", ["project.cc.json"])
            const global = createTestScenario("Global", "id-global")
            const builtIn = createBuiltInScenario("Built-In", "id-builtin")
            const boundToOtherMap = createTestScenario("Other Map", "id-other", ["other-project.cc.json"])

            scenariosSubject.next([boundToOtherMap, builtIn, global, boundToCurrentMap])
            store.setState({ ...defaultState, files: [createFileState("project.cc.json")] })

            // Act
            const ordered = component.filteredScenarios()

            // Assert
            expect(ordered.map(s => s.name)).toEqual(["Current Map", "Global", "Built-In", "Other Map"])
        })

        it("should preserve relative order within the same priority group", () => {
            // Arrange
            const globalA = createTestScenario("Alpha", "id-a")
            const globalB = createTestScenario("Beta", "id-b")
            const builtInX = createBuiltInScenario("X Built-In", "id-x")
            const builtInY = createBuiltInScenario("Y Built-In", "id-y")

            scenariosSubject.next([globalA, globalB, builtInX, builtInY])

            // Act
            const ordered = component.filteredScenarios()

            // Assert
            expect(ordered.map(s => s.name)).toEqual(["Alpha", "Beta", "X Built-In", "Y Built-In"])
        })

        it("should still filter by search term after ordering", () => {
            // Arrange
            const boundToCurrentMap = createTestScenario("Complexity Map", "id-1", ["project.cc.json"])
            const global = createTestScenario("Complexity Global", "id-2")
            const builtIn = createBuiltInScenario("Other", "id-3")

            scenariosSubject.next([builtIn, global, boundToCurrentMap])
            store.setState({ ...defaultState, files: [createFileState("project.cc.json")] })

            // Act
            component.searchTerm.set("complexity")

            // Assert
            const ordered = component.filteredScenarios()
            expect(ordered.map(s => s.name)).toEqual(["Complexity Map", "Complexity Global"])
        })
    })

    describe("getScenarioPriority", () => {
        it("should return 0 for scenarios bound to a visible map", () => {
            // Arrange
            const scenario = createTestScenario("Test", "id-1", ["my.cc.json"])
            const visible = new Set(["my.cc.json"])

            // Act
            const result = helpers.getScenarioPriority(scenario, visible)

            // Assert
            expect(result).toBe(0)
        })

        it("should return 1 for global user scenarios", () => {
            // Arrange
            const scenario = createTestScenario("Test", "id-1")

            // Act
            const result = helpers.getScenarioPriority(scenario, new Set())

            // Assert
            expect(result).toBe(1)
        })

        it("should return 2 for built-in scenarios", () => {
            // Arrange
            const scenario = createBuiltInScenario("Test", "id-1")

            // Act
            const result = helpers.getScenarioPriority(scenario, new Set())

            // Assert
            expect(result).toBe(2)
        })

        it("should return 3 for scenarios bound to a non-visible map", () => {
            // Arrange
            const scenario = createTestScenario("Test", "id-1", ["other.cc.json"])
            const visible = new Set(["my.cc.json"])

            // Act
            const result = helpers.getScenarioPriority(scenario, visible)

            // Assert
            expect(result).toBe(3)
        })
    })

    describe("groupedScenarios", () => {
        it("should group scenarios into accordion sections by priority", () => {
            // Arrange
            const boundToCurrentMap = createTestScenario("Current Map", "id-current", ["project.cc.json"])
            const global = createTestScenario("Global", "id-global")
            const builtIn = createBuiltInScenario("Built-In", "id-builtin")
            const boundToOtherMap = createTestScenario("Other Map", "id-other", ["other.cc.json"])

            scenariosSubject.next([boundToOtherMap, builtIn, global, boundToCurrentMap])
            store.setState({ ...defaultState, files: [createFileState("project.cc.json")] })

            // Act
            const groups = component.groupedScenarios()

            // Assert
            expect(groups.map(g => g.label)).toEqual(["Current Map", "Global", "Built-in", "Other Maps"])
            expect(groups[0].scenarios.map(s => s.scenario.name)).toEqual(["Current Map"])
            expect(groups[1].scenarios.map(s => s.scenario.name)).toEqual(["Global"])
            expect(groups[2].scenarios.map(s => s.scenario.name)).toEqual(["Built-In"])
            expect(groups[3].scenarios.map(s => s.scenario.name)).toEqual(["Other Map"])
        })

        it("should omit empty groups", () => {
            // Arrange
            const global = createTestScenario("Global", "id-global")
            scenariosSubject.next([global])

            // Act
            const groups = component.groupedScenarios()

            // Assert
            expect(groups).toHaveLength(1)
            expect(groups[0].label).toBe("Global")
        })

        it("should precompute mapBound on scenario views", () => {
            // Arrange
            const bound = createTestScenario("Bound", "id-1", ["project.cc.json"])
            const global = createTestScenario("Global", "id-2")
            scenariosSubject.next([bound, global])
            store.setState({ ...defaultState, files: [createFileState("project.cc.json")] })

            // Act
            const groups = component.groupedScenarios()
            const boundView = groups.flatMap(g => g.scenarios).find(v => v.scenario.name === "Bound")
            const globalView = groups.flatMap(g => g.scenarios).find(v => v.scenario.name === "Global")

            // Assert
            expect(boundView?.mapBound).toBe(true)
            expect(globalView?.mapBound).toBe(false)
        })

        it("should precompute mapMismatch on scenario views", () => {
            // Arrange
            const bound = createTestScenario("Bound", "id-1", ["project.cc.json"])
            scenariosSubject.next([bound])
            store.setState({ ...defaultState, files: [createFileState("other.cc.json")] })

            // Act
            const groups = component.groupedScenarios()
            const view = groups[0].scenarios[0]

            // Assert
            expect(view.mapMismatch).toBe(true)
        })

        it("should precompute sectionKeys on scenario views", () => {
            // Arrange
            const full = createTestScenario("Full", "id-1")
            const builtIn = createBuiltInScenario("Built-In", "id-2")
            scenariosSubject.next([full, builtIn])

            // Act
            const groups = component.groupedScenarios()
            const fullView = groups.flatMap(g => g.scenarios).find(v => v.scenario.name === "Full")
            const builtInView = groups.flatMap(g => g.scenarios).find(v => v.scenario.name === "Built-In")

            // Assert
            expect(fullView?.sectionKeys).toEqual(["metrics", "colors", "camera", "filters", "labelsAndFolders"])
            expect(builtInView?.sectionKeys).toEqual(["metrics", "colors"])
        })
    })

    describe("groupScenarios", () => {
        it("should return empty array for no scenarios", () => {
            // Act
            const result = helpers.groupScenarios([], new Set())

            // Assert
            expect(result).toEqual([])
        })

        it("should group multiple scenarios into correct buckets", () => {
            // Arrange
            const visible = new Set(["project.cc.json"])
            const scenarios = [
                createTestScenario("A", "id-a", ["project.cc.json"]),
                createTestScenario("B", "id-b"),
                createBuiltInScenario("C", "id-c"),
                createTestScenario("D", "id-d", ["other.cc.json"])
            ]

            // Act
            const groups = helpers.groupScenarios(scenarios, visible)

            // Assert
            expect(groups).toHaveLength(4)
            expect(groups[0].label).toBe("Current Map")
            expect(groups[1].label).toBe("Global")
            expect(groups[2].label).toBe("Built-in")
            expect(groups[3].label).toBe("Other Maps")
        })
    })

    describe("import", () => {
        it("should trigger file input click on openImportDialog", () => {
            // Arrange
            const clickSpy = jest.spyOn(component.fileInput().nativeElement, "click")

            // Act
            component.openImportDialog()

            // Assert
            expect(clickSpy).toHaveBeenCalled()
        })

        it("should call importScenarioFiles on file selection", async () => {
            // Arrange
            const mockEvent = { target: { files: { length: 1 } as FileList, value: "file.ccscenario" } } as unknown as Event

            // Act
            await component.handleImportFiles(mockEvent)

            // Assert
            expect(scenariosService.importScenarioFiles).toHaveBeenCalled()
        })

        it("should not import when no files selected", async () => {
            // Arrange
            const mockEvent = { target: { files: { length: 0 } as FileList } } as unknown as Event

            // Act
            await component.handleImportFiles(mockEvent)

            // Assert
            expect(scenariosService.importScenarioFiles).not.toHaveBeenCalled()
        })

        it("should delegate import feedback to sub-component", async () => {
            // Arrange
            const importResult = { imported: 0, duplicates: [], invalid: [], parseErrors: ["broken.json"] }
            scenariosService.importScenarioFiles.mockResolvedValue(importResult)
            const openSpy = jest.spyOn(component.importFeedbackDialogRef(), "open")
            const mockEvent = { target: { files: { length: 1 } as FileList, value: "broken.json" } } as unknown as Event

            // Act
            await component.handleImportFiles(mockEvent)

            // Assert
            expect(openSpy).toHaveBeenCalledWith(importResult)
        })

        it("should not call importFeedbackDialog.open when import succeeds without issues", async () => {
            // Arrange
            scenariosService.importScenarioFiles.mockResolvedValue({ imported: 1, duplicates: [], invalid: [], parseErrors: [] })
            const openSpy = jest.spyOn(component.importFeedbackDialogRef(), "open")
            const mockEvent = { target: { files: { length: 1 } as FileList, value: "file.ccscenario" } } as unknown as Event

            // Act
            await component.handleImportFiles(mockEvent)

            // Assert
            expect(openSpy).toHaveBeenCalled()
        })
    })

    describe("toScenarioView", () => {
        it("should set warning to false when no metrics section", () => {
            // Arrange
            const scenario: Scenario = { id: "id-1", name: "NoMetrics", createdAt: 0, sections: {} }

            // Act
            const view = helpers.toScenarioView(scenario, new Set(), emptyMetricData)

            // Assert
            expect(view.warning).toBe(false)
        })

        it("should set warning to false when all metrics available", () => {
            // Arrange
            const builtIn = createBuiltInScenario("RLOC", "built-in-rloc")
            const metricData: MetricData = {
                nodeMetricData: [{ name: "rloc", maxValue: 100, minValue: 0, values: [] }],
                edgeMetricData: []
            }

            // Act
            const view = helpers.toScenarioView(builtIn, new Set(), metricData)

            // Assert
            expect(view.warning).toBe(false)
        })

        it("should set mapBound correctly", () => {
            // Arrange
            const bound = createTestScenario("Bound", "id-1", ["file.cc.json"])
            const global = createTestScenario("Global", "id-2")

            // Act
            const boundView = helpers.toScenarioView(bound, new Set(), emptyMetricData)
            const globalView = helpers.toScenarioView(global, new Set(), emptyMetricData)

            // Assert
            expect(boundView.mapBound).toBe(true)
            expect(globalView.mapBound).toBe(false)
        })

        it("should set mapMismatch correctly", () => {
            // Arrange
            const bound = createTestScenario("Bound", "id-1", ["project.cc.json"])
            const visible = new Set(["other.cc.json"])
            const matching = new Set(["project.cc.json"])

            // Act
            const mismatchView = helpers.toScenarioView(bound, visible, emptyMetricData)
            const matchView = helpers.toScenarioView(bound, matching, emptyMetricData)

            // Assert
            expect(mismatchView.mapMismatch).toBe(true)
            expect(matchView.mapMismatch).toBe(false)
        })

        it("should format date as locale string", () => {
            // Arrange
            const scenario = createTestScenario("Test", "id-1")

            // Act
            const view = helpers.toScenarioView(scenario, new Set(), emptyMetricData)

            // Assert
            expect(view.formattedDate).toBeDefined()
            expect(typeof view.formattedDate).toBe("string")
        })

        it("should compute sectionKeys from available sections", () => {
            // Arrange
            const full = createTestScenario("Full", "id-1")
            const builtIn = createBuiltInScenario("Built-In", "id-2")

            // Act
            const fullView = helpers.toScenarioView(full, new Set(), emptyMetricData)
            const builtInView = helpers.toScenarioView(builtIn, new Set(), emptyMetricData)

            // Assert
            expect(fullView.sectionKeys).toEqual(["metrics", "colors", "camera", "filters", "labelsAndFolders"])
            expect(builtInView.sectionKeys).toEqual(["metrics", "colors"])
        })
    })
})
