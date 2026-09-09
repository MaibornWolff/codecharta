import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { provideMockState } from "../../../../mocks/state.mocks"
import { NodeType } from "../../../../model/codeCharta.model"
import { FileSelectionState, FileState } from "../../../../model/files/files"
import { defaultState } from "../../../../stores/rootStore/state.manager"
import { SCENARIO_SETTINGS, ScenarioSettingKey } from "../../model/scenarioSettings.registry"
import { ScenariosService } from "../../services/scenarios.service"
import { SaveScenarioDialogComponent } from "./saveScenarioDialog.component"

const createFileState = (fileName: string): FileState => ({
    file: {
        fileMeta: { fileName, fileChecksum: "abc", apiVersion: "1.3", projectName: "test", exportedFileSize: 100 },
        map: { name: "root", type: NodeType.FOLDER, children: [], attributes: {} },
        settings: { fileSettings: {} as any }
    },
    selectedAs: FileSelectionState.Partial
})

describe("SaveScenarioDialogComponent", () => {
    let component: SaveScenarioDialogComponent
    let scenariosService: { saveScenario: jest.Mock }
    let store: MockStore

    beforeEach(() => {
        scenariosService = { saveScenario: jest.fn().mockResolvedValue({}) }

        TestBed.configureTestingModule({
            imports: [SaveScenarioDialogComponent],
            providers: [
                provideMockState(),
                provideMockStore({ initialState: defaultState }),
                { provide: ScenariosService, useValue: scenariosService }
            ]
        })

        store = TestBed.inject(MockStore)
        const fixture = TestBed.createComponent(SaveScenarioDialogComponent)
        component = fixture.componentInstance
        fixture.detectChanges()

        component.dialogElement().nativeElement.showModal = jest.fn()
        component.dialogElement().nativeElement.close = jest.fn()
    })

    it("should require a name", () => {
        // Act
        const result = component.nameValid()

        // Assert
        expect(result).toBe(false)
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
        expect(scenariosService.saveScenario).toHaveBeenCalledWith({
            name: "My Scenario",
            description: "A description",
            mapFileNames: undefined,
            selectedKeys: component.selectedKeys()
        })
    })

    it("should select every setting but the camera by default", () => {
        // Act
        const selected = component.selectedKeys()

        // Assert
        expect(selected.has("margin")).toBe(true)
        expect(selected.has("camera")).toBe(false)
        expect(component.selectionSummary()).toBe(`${component.availableKeys.length - 1} of ${component.availableKeys.length} settings`)
    })

    it("should name the number of settings its save button carries", () => {
        // Act
        component.selectedKeys.set(new Set<ScenarioSettingKey>(["margin", "colorRange"]))

        // Assert
        expect(component.saveLabel()).toBe("Save 2 settings")
    })

    it("should offer every setting of the registry", () => {
        // Assert
        expect(component.availableKeys).toEqual(Object.keys(SCENARIO_SETTINGS))
    })

    it("should save only the selected settings", async () => {
        // Arrange
        component.name.set("Margin only")
        component.selectedKeys.set(new Set<ScenarioSettingKey>(["margin"]))

        // Act
        await component.save()

        // Assert
        expect(scenariosService.saveScenario).toHaveBeenCalledWith(
            expect.objectContaining({ selectedKeys: new Set<ScenarioSettingKey>(["margin"]) })
        )
    })

    it("should not save when no setting is selected", async () => {
        // Arrange
        component.name.set("Nothing selected")
        component.selectedKeys.set(new Set<ScenarioSettingKey>())

        // Act
        await component.save()

        // Assert
        expect(scenariosService.saveScenario).not.toHaveBeenCalled()
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
        expect(scenariosService.saveScenario).toHaveBeenCalledWith(expect.objectContaining({ name: "Test", description: undefined }))
    })

    it("should have no files when files state is empty", () => {
        // Act
        const hasFiles = component.hasFiles()
        const fileNames = component.visibleFileNames()

        // Assert
        expect(hasFiles).toBe(false)
        expect(fileNames).toEqual([])
    })

    it("should resolve visible file names from store", () => {
        // Act
        store.setState({ ...defaultState, files: [createFileState("project.cc.json"), createFileState("other.cc.json")] })

        // Assert
        expect(component.visibleFileNames()).toEqual(["project.cc.json", "other.cc.json"])
        expect(component.hasFiles()).toBe(true)
    })

    it("should pass mapFileNames when bindToMap is checked and files are loaded", async () => {
        // Arrange
        store.setState({ ...defaultState, files: [createFileState("project.cc.json"), createFileState("other.cc.json")] })
        component.name.set("Bound Scenario")
        component.bindToMap.set(true)

        // Act
        await component.save()

        // Assert
        expect(scenariosService.saveScenario).toHaveBeenCalledWith(
            expect.objectContaining({ name: "Bound Scenario", mapFileNames: ["project.cc.json", "other.cc.json"] })
        )
    })

    it("should not pass mapFileNames when bindToMap is unchecked", async () => {
        // Arrange
        store.setState({ ...defaultState, files: [createFileState("project.cc.json")] })
        component.name.set("Global Scenario")
        component.bindToMap.set(false)

        // Act
        await component.save()

        // Assert
        expect(scenariosService.saveScenario).toHaveBeenCalledWith(
            expect.objectContaining({ name: "Global Scenario", mapFileNames: undefined })
        )
    })

    it("should reset bindToMap and the selection on open", () => {
        // Arrange
        component.bindToMap.set(true)
        component.selectedKeys.set(new Set<ScenarioSettingKey>(["margin"]))

        // Act
        component.open()

        // Assert
        expect(component.bindToMap()).toBe(false)
        expect(component.selectedKeys().size).toBe(component.availableKeys.length - 1)
    })
})
