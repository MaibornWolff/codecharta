import { render, screen } from "@testing-library/angular"
import { BehaviorSubject, of } from "rxjs"
import { DeltaSelectorComponent, ALERT_ON_INCOMPATIBLE_MAPS } from "./deltaSelector.component"
import { FilesService } from "../../services/files.service"
import { FileSelectionState, FileState } from "../../../../model/files/files"
import { TestBed } from "@angular/core/testing"
import { TEST_FILE_DATA, TEST_FILE_DATA_JAVA } from "../../../../util/dataMocks"

describe("DeltaSelectorComponent", () => {
    let mockFilesSubject: BehaviorSubject<FileState[]>
    let mockFilesService: Partial<FilesService>

    beforeEach(() => {
        mockFilesSubject = new BehaviorSubject<FileState[]>([])
        mockFilesService = {
            files$: () => mockFilesSubject.asObservable(),
            pictogramBackground$: () => of("linear-gradient(#00ff00 50%, #ff0000 50%)"),
            setDeltaReference: jest.fn(),
            setDeltaComparison: jest.fn(),
            switchReferenceAndComparison: jest.fn()
        }
        localStorage.clear()
    })

    afterEach(() => {
        TestBed.resetTestingModule()
        localStorage.clear()
    })

    async function renderComponent(fileStates: FileState[]) {
        mockFilesSubject.next(fileStates)
        const result = await render(DeltaSelectorComponent, {
            providers: [{ provide: FilesService, useValue: mockFilesService }]
        })
        return result
    }

    it("should render reference and comparison selects", async () => {
        // Arrange
        const fileStates: FileState[] = [
            { file: TEST_FILE_DATA, selectedAs: FileSelectionState.Reference },
            { file: TEST_FILE_DATA_JAVA, selectedAs: FileSelectionState.None }
        ]

        // Act
        const { fixture } = await renderComponent(fileStates)
        const selects = fixture.nativeElement.querySelectorAll("select")

        // Assert
        expect(selects.length).toBe(2)
    })

    it("should render switch button", async () => {
        // Arrange
        const fileStates: FileState[] = [
            { file: TEST_FILE_DATA, selectedAs: FileSelectionState.Reference },
            { file: TEST_FILE_DATA_JAVA, selectedAs: FileSelectionState.Comparison }
        ]

        // Act
        const { fixture } = await renderComponent(fileStates)
        const switchButton = fixture.nativeElement.querySelector("button")

        // Assert
        expect(switchButton).toBeTruthy()
    })

    it("should disable switch button when no comparison file", async () => {
        // Arrange
        const fileStates: FileState[] = [{ file: TEST_FILE_DATA, selectedAs: FileSelectionState.Reference }]

        // Act
        const { fixture } = await renderComponent(fileStates)
        const switchButton = fixture.nativeElement.querySelector("button")

        // Assert
        expect(switchButton.disabled).toBe(true)
    })

    it("should enable switch button when comparison file exists", async () => {
        // Arrange
        const fileStates: FileState[] = [
            { file: TEST_FILE_DATA, selectedAs: FileSelectionState.Reference },
            { file: TEST_FILE_DATA_JAVA, selectedAs: FileSelectionState.Comparison }
        ]

        // Act
        const { fixture } = await renderComponent(fileStates)
        const switchButton = fixture.nativeElement.querySelector("button")

        // Assert
        expect(switchButton.disabled).toBe(false)
    })

    it("should call switchReferenceAndComparison when switch button clicked", async () => {
        // Arrange
        const fileStates: FileState[] = [
            { file: TEST_FILE_DATA, selectedAs: FileSelectionState.Reference },
            { file: TEST_FILE_DATA_JAVA, selectedAs: FileSelectionState.Comparison }
        ]

        // Act
        const { fixture } = await renderComponent(fileStates)
        const switchButton = fixture.nativeElement.querySelector("button")
        switchButton.click()

        // Assert
        expect(mockFilesService.switchReferenceAndComparison).toHaveBeenCalled()
    })

    it("should call setDeltaReference when reference select changes", async () => {
        // Arrange
        const fileStates: FileState[] = [
            { file: TEST_FILE_DATA, selectedAs: FileSelectionState.Reference },
            { file: TEST_FILE_DATA_JAVA, selectedAs: FileSelectionState.None }
        ]

        // Act
        const { fixture } = await renderComponent(fileStates)
        const component = fixture.componentInstance
        const mockEvent = { target: { value: TEST_FILE_DATA_JAVA.fileMeta.fileName } } as unknown as Event
        component.handleDeltaReferenceFileChange(mockEvent)

        // Assert
        expect(mockFilesService.setDeltaReference).toHaveBeenCalledWith(TEST_FILE_DATA_JAVA)
    })

    it("should call setDeltaComparison when comparison select changes", async () => {
        // Arrange
        const fileStates: FileState[] = [
            { file: TEST_FILE_DATA, selectedAs: FileSelectionState.Reference },
            { file: TEST_FILE_DATA_JAVA, selectedAs: FileSelectionState.None }
        ]

        // Act
        const { fixture } = await renderComponent(fileStates)
        const component = fixture.componentInstance
        const mockEvent = { target: { value: TEST_FILE_DATA_JAVA.fileMeta.fileName } } as unknown as Event
        component.handleDeltaComparisonFileChange(mockEvent)

        // Assert
        expect(mockFilesService.setDeltaComparison).toHaveBeenCalledWith(TEST_FILE_DATA_JAVA)
    })

    it("should render pictogram with background color", async () => {
        // Arrange
        const fileStates: FileState[] = [{ file: TEST_FILE_DATA, selectedAs: FileSelectionState.Reference }]

        // Act
        const { fixture } = await renderComponent(fileStates)
        const pictogram = fixture.nativeElement.querySelector("[style*='background']")

        // Assert
        expect(pictogram).toBeTruthy()
    })

    it("should close dialog and save preference when closeDialog is called with doNotShowAgain", async () => {
        // Arrange
        const fileStates: FileState[] = [{ file: TEST_FILE_DATA, selectedAs: FileSelectionState.Reference }]

        // Act
        const { fixture } = await renderComponent(fileStates)
        const component = fixture.componentInstance
        component.dialogOpen.set(true)
        component.doNotShowAgain.set(true)
        component.closeDialog()

        // Assert
        expect(component.dialogOpen()).toBe(false)
        expect(localStorage.getItem(ALERT_ON_INCOMPATIBLE_MAPS)).toBe("false")
    })
})
