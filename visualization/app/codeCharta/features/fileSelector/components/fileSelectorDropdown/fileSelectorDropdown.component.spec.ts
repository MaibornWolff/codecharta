import { render, screen } from "@testing-library/angular"
import { BehaviorSubject } from "rxjs"
import { FileSelectorDropdownComponent } from "./fileSelectorDropdown.component"
import { FilesService } from "../../services/files.service"
import { TEST_FILE_DATA, TEST_FILE_DATA_JAVA } from "../../../../util/dataMocks"
import { FileSelectionState, FileState } from "../../../../model/files/files"
import { TestBed } from "@angular/core/testing"

describe("FileSelectorDropdownComponent", () => {
    let mockFilesSubject: BehaviorSubject<FileState[]>
    let mockFilesService: Partial<FilesService>

    beforeEach(() => {
        mockFilesSubject = new BehaviorSubject<FileState[]>([])
        mockFilesService = {
            files$: () => mockFilesSubject.asObservable(),
            setStandard: jest.fn(),
            removeFiles: jest.fn()
        }
    })

    afterEach(() => {
        TestBed.resetTestingModule()
    })

    async function renderComponent(fileStates: FileState[]) {
        mockFilesSubject.next(fileStates)
        const result = await render(FileSelectorDropdownComponent, {
            providers: [{ provide: FilesService, useValue: mockFilesService }]
        })
        return result
    }

    it("should render the dropdown with display text", async () => {
        // Arrange
        const fileStates: FileState[] = [
            { file: TEST_FILE_DATA, selectedAs: FileSelectionState.Partial },
            { file: TEST_FILE_DATA_JAVA, selectedAs: FileSelectionState.None }
        ]

        // Act
        await renderComponent(fileStates)

        // Assert
        const displayTextElement = screen.getAllByText("fileA")
        expect(displayTextElement.length).toBeGreaterThan(0)
    })

    it("should show all file names when all files are selected", async () => {
        // Arrange
        const fileStates: FileState[] = [
            { file: TEST_FILE_DATA, selectedAs: FileSelectionState.Partial },
            { file: TEST_FILE_DATA_JAVA, selectedAs: FileSelectionState.Partial }
        ]

        // Act
        await renderComponent(fileStates)

        // Assert
        expect(screen.getByText("fileA, fileB")).toBeTruthy()
    })

    it("should show 'No files selected' when no files are selected", async () => {
        // Arrange
        const fileStates: FileState[] = [{ file: TEST_FILE_DATA, selectedAs: FileSelectionState.None }]

        // Act
        await renderComponent(fileStates)

        // Assert
        expect(screen.getByText("No files selected")).toBeTruthy()
    })

    it("should have action buttons in dropdown", async () => {
        // Arrange
        const fileStates: FileState[] = [{ file: TEST_FILE_DATA, selectedAs: FileSelectionState.Partial }]

        // Act
        const { fixture } = await renderComponent(fileStates)
        const dropdown = fixture.nativeElement.querySelector("details")
        dropdown.open = true
        fixture.detectChanges()

        // Assert
        expect(screen.getByText("All")).toBeTruthy()
        expect(screen.getByText("None")).toBeTruthy()
        expect(screen.getByText("Invert")).toBeTruthy()
        expect(screen.getByText("Apply")).toBeTruthy()
    })

    it("should select all files when clicking All button", async () => {
        // Arrange
        const fileStates: FileState[] = [
            { file: TEST_FILE_DATA, selectedAs: FileSelectionState.Partial },
            { file: TEST_FILE_DATA_JAVA, selectedAs: FileSelectionState.None }
        ]

        // Act
        const { fixture } = await renderComponent(fileStates)
        const component = fixture.componentInstance
        component.handleSelectAllFiles()
        fixture.detectChanges()

        // Assert
        expect(component.selectedFileNames().size).toBe(2)
    })

    it("should deselect all files when clicking None button", async () => {
        // Arrange
        const fileStates: FileState[] = [
            { file: TEST_FILE_DATA, selectedAs: FileSelectionState.Partial },
            { file: TEST_FILE_DATA_JAVA, selectedAs: FileSelectionState.Partial }
        ]

        // Act
        const { fixture } = await renderComponent(fileStates)
        const component = fixture.componentInstance
        component.handleSelectZeroFiles()
        fixture.detectChanges()

        // Assert
        expect(component.selectedFileNames().size).toBe(0)
    })

    it("should invert selection when clicking Invert button", async () => {
        // Arrange
        const fileStates: FileState[] = [
            { file: TEST_FILE_DATA, selectedAs: FileSelectionState.Partial },
            { file: TEST_FILE_DATA_JAVA, selectedAs: FileSelectionState.None }
        ]

        // Act
        const { fixture } = await renderComponent(fileStates)
        const component = fixture.componentInstance
        component.handleInvertSelectedFiles()
        fixture.detectChanges()

        // Assert
        expect(component.selectedFileNames().has(TEST_FILE_DATA.fileMeta.fileName)).toBe(false)
        expect(component.selectedFileNames().has(TEST_FILE_DATA_JAVA.fileMeta.fileName)).toBe(true)
    })

    it("should disable apply button when no changes", async () => {
        // Arrange
        const fileStates: FileState[] = [{ file: TEST_FILE_DATA, selectedAs: FileSelectionState.Partial }]

        // Act
        const { fixture } = await renderComponent(fileStates)
        const component = fixture.componentInstance

        // Assert
        expect(component.applyButtonDisabled()).toBe(true)
    })

    it("should enable apply button when selection changes", async () => {
        // Arrange
        const fileStates: FileState[] = [
            { file: TEST_FILE_DATA, selectedAs: FileSelectionState.Partial },
            { file: TEST_FILE_DATA_JAVA, selectedAs: FileSelectionState.None }
        ]

        // Act
        const { fixture } = await renderComponent(fileStates)
        const component = fixture.componentInstance
        component.handleSelectAllFiles()
        fixture.detectChanges()

        // Assert
        expect(component.applyButtonDisabled()).toBe(false)
    })

    it("should mark file as removed when clicking remove button", async () => {
        // Arrange
        const fileStates: FileState[] = [
            { file: TEST_FILE_DATA, selectedAs: FileSelectionState.Partial },
            { file: TEST_FILE_DATA_JAVA, selectedAs: FileSelectionState.Partial }
        ]

        // Act
        const { fixture } = await renderComponent(fileStates)
        const component = fixture.componentInstance
        const mockEvent = { stopPropagation: jest.fn(), preventDefault: jest.fn() } as unknown as MouseEvent
        component.handleAddOrRemoveFile(TEST_FILE_DATA.fileMeta.fileName, mockEvent)
        fixture.detectChanges()

        // Assert
        const removedFile = component.filesInUI().find(f => f.file.fileMeta.fileName === TEST_FILE_DATA.fileMeta.fileName)
        expect(removedFile?.isRemoved).toBe(true)
    })
})
