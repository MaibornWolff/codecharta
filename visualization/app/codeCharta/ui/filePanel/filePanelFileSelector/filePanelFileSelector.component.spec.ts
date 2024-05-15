import { TestBed } from "@angular/core/testing"
import { fireEvent, render, screen, waitForElementToBeRemoved } from "@testing-library/angular"
import { FileSelectionState } from "../../../model/files/files"
import { addFile, invertStandard, setStandard } from "../../../state/store/files/files.actions"
import { TEST_FILE_DATA } from "../../../util/dataMocks"
import { FilePanelModule } from "../filePanel.module"
import { FilePanelFileSelectorComponent } from "./filePanelFileSelector.component"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"
import { Store, StoreModule } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"

describe("filePanelFileSelectorComponent", () => {
    it("should reset selected files to selected in store when closing with zero selections", async () => {
        const { detectChanges, fixture } = await render(FilePanelFileSelectorComponent, {
            imports: [FilePanelModule, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })],
            excludeComponentDeclaration: true
        })
        const store = TestBed.inject(Store)
        store.dispatch(addFile({ file: TEST_FILE_DATA }))
        store.dispatch(setStandard({ files: [TEST_FILE_DATA] }))
        detectChanges()
        expect(fixture.componentInstance["selectedFilesInUI"].length).toBe(1)
        expect(fixture.componentInstance["selectedFilesInUI"][0]).toEqual(TEST_FILE_DATA)

        const selectFilesElement = screen.getByRole("combobox").querySelector(".mat-mdc-select-trigger")
        fireEvent.click(selectFilesElement)
        const deselectAllButton = screen.getByText("None")
        fireEvent.click(deselectAllButton)
        expect(fixture.componentInstance["selectedFilesInUI"].length).toBe(0)

        fireEvent.click(document.querySelector(".cdk-overlay-backdrop"))
        await waitForElementToBeRemoved(() => screen.getByRole("listbox"))
        expect(fixture.componentInstance["selectedFilesInUI"].length).toBe(1)
        expect(fixture.componentInstance["selectedFilesInUI"][0]).toEqual(TEST_FILE_DATA)
    })

    describe("handleSelectedFilesChanged", () => {
        it("should not dispatch selection to store, when new selection is empty", () => {
            const mockedStore = createMockedStore()
            const component = new FilePanelFileSelectorComponent(mockedStore)
            component.handleSelectedFilesChanged([])
            expect(mockedStore.dispatch).not.toHaveBeenCalled()
        })

        it("should dispatch selection to store, when new selection is not empty", () => {
            const mockedStore = createMockedStore()
            const component = new FilePanelFileSelectorComponent(mockedStore)
            component.handleSelectedFilesChanged([TEST_FILE_DATA])
            expect(mockedStore.dispatch).toHaveBeenCalledWith(setStandard({ files: [TEST_FILE_DATA] }))
        })
    })

    describe("handleInvertSelectedFiles", () => {
        it("should invert selection", () => {
            const mockedStore = createMockedStore()
            const component = new FilePanelFileSelectorComponent(mockedStore)
            component.fileStates = [
                { selectedAs: FileSelectionState.Partial, file: TEST_FILE_DATA },
                { selectedAs: FileSelectionState.None, file: TEST_FILE_DATA }
            ]
            component.selectedFilesInUI = [TEST_FILE_DATA]

            component.handleInvertSelectedFiles()

            expect(mockedStore.dispatch).toHaveBeenCalledWith(invertStandard())
        })

        it("should not invert selection in store, when new selection would be empty", () => {
            const mockedStore = createMockedStore()
            const component = new FilePanelFileSelectorComponent(mockedStore)
            component.fileStates = [{ selectedAs: FileSelectionState.Partial, file: TEST_FILE_DATA }]
            component.selectedFilesInUI = [TEST_FILE_DATA]

            component.handleInvertSelectedFiles()

            expect(mockedStore.dispatch).not.toHaveBeenCalled()
            expect(component.selectedFilesInUI).toEqual([])
        })
    })

    function createMockedStore() {
        return {
            dispatch: jest.fn(),
            select: () => ({ subscribe: jest.fn() })
        } as unknown as Store<CcState>
    }
})
