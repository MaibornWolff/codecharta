import { TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { SaveScenarioDialogComponent } from "./saveScenarioDialog.component"
import { ScenariosService } from "../../services/scenarios.service"
import { defaultState } from "../../../../state/store/state.manager"
import { FileSelectionState, FileState } from "../../../../model/files/files"

const createFileState = (fileName: string): FileState => ({
    file: {
        fileMeta: { fileName, fileChecksum: "abc", apiVersion: "1.3", projectName: "test", exportedFileSize: 100 },
        map: { name: "root", type: "Folder", children: [], attributes: {} },
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
            providers: [provideMockStore({ initialState: defaultState }), { provide: ScenariosService, useValue: scenariosService }]
        })

        store = TestBed.inject(MockStore)
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
        expect(scenariosService.saveScenario).toHaveBeenCalledWith("My Scenario", "A description", undefined)
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
        expect(scenariosService.saveScenario).toHaveBeenCalledWith("Test", undefined, undefined)
    })

    it("should have no files when files state is empty", () => {
        // Assert
        expect(component.hasFiles()).toBe(false)
        expect(component.visibleFileNames()).toEqual([])
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
        expect(scenariosService.saveScenario).toHaveBeenCalledWith("Bound Scenario", undefined, ["project.cc.json", "other.cc.json"])
    })

    it("should not pass mapFileNames when bindToMap is unchecked", async () => {
        // Arrange
        store.setState({ ...defaultState, files: [createFileState("project.cc.json")] })
        component.name.set("Global Scenario")
        component.bindToMap.set(false)

        // Act
        await component.save()

        // Assert
        expect(scenariosService.saveScenario).toHaveBeenCalledWith("Global Scenario", undefined, undefined)
    })

    it("should reset bindToMap on open", () => {
        // Arrange
        component.bindToMap.set(true)

        // Act
        component.open()

        // Assert
        expect(component.bindToMap()).toBe(false)
    })
})
