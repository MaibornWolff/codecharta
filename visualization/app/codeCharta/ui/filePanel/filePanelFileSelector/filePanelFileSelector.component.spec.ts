import { TestBed } from "@angular/core/testing"
import { fireEvent, render, screen, waitForElementToBeRemoved } from "@testing-library/angular"
import { addFile, removeFiles, setStandard } from "../../../state/store/files/files.actions"
import { TEST_FILE_DATA, TEST_FILE_DATA_JAVA, TEST_FILE_DATA_TWO } from "../../../util/dataMocks"
import { FilePanelComponent } from "../filePanel.component"
import { FilePanelFileSelectorComponent } from "./filePanelFileSelector.component"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"
import { Store, StoreModule } from "@ngrx/store"
import { CCFile, CcState } from "../../../codeCharta.model"
import { MatSelect } from "@angular/material/select"
import { filesSelector } from "../../../state/store/files/files.selector"
import { of } from "rxjs"
import { FileSelectionState } from "../../../model/files/files"

describe("filePanelFileSelectorComponent", () => {
    it("should reset selected files to selected in store when closing with zero selections", async () => {
        const { detectChanges, fixture } = await render(FilePanelFileSelectorComponent, {
            imports: [FilePanelComponent, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
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

    describe("handle-methods", () => {
        let component: FilePanelFileSelectorComponent
        let mockedStore: Store<CcState>
        let defaultMockedFilesInUI: { isRemoved: boolean; file: CCFile }[]
        let defaultMockedSelectedFilesInUI: CCFile[]

        beforeEach(() => {
            mockedStore = createMockedStore()

            const mockMatSelect = { close: jest.fn() } as Partial<MatSelect>
            component = new FilePanelFileSelectorComponent(mockedStore)
            component.select = mockMatSelect as MatSelect

            defaultMockedFilesInUI = [
                { isRemoved: false, file: TEST_FILE_DATA },
                { isRemoved: false, file: TEST_FILE_DATA_TWO }
            ]
            component.filesInUI = defaultMockedFilesInUI

            defaultMockedSelectedFilesInUI = [TEST_FILE_DATA]
            component.selectedFilesInUI = defaultMockedSelectedFilesInUI
        })

        describe("handleOpenedChanged", () => {
            it("should reset selected files to selected in store when closed without applying", async () => {
                component.handleInvertSelectedFiles()
                component.handleOpenedChanged(false)

                expect(component.selectedFilesInUI).toEqual([TEST_FILE_DATA])
            })

            it("should update selected files to selected in store when closed with applying", async () => {
                component.handleInvertSelectedFiles()
                component.handleApplyFileChanges()

                expect(mockedStore.dispatch).toHaveBeenCalledWith(setStandard({ files: [TEST_FILE_DATA_TWO] }))
                expect(component.selectedFilesInUI).toEqual([TEST_FILE_DATA_TWO])
                expect(component.filesInUI).toEqual(defaultMockedFilesInUI)
            })
        })

        describe("handleSelectedFilesChanged", () => {
            it("should dispatch selection to store, when new selection is applied", () => {
                component.handleSelectedFilesChanged([TEST_FILE_DATA])
                component.handleApplyFileChanges()

                expect(mockedStore.dispatch).toHaveBeenCalledWith(setStandard({ files: [TEST_FILE_DATA] }))
            })
        })

        describe("handleSelectAll", () => {
            it("should select all files", () => {
                component.selectedFilesInUI = []

                component.handleSelectAllFiles()

                expect(component.selectedFilesInUI).toEqual([TEST_FILE_DATA, TEST_FILE_DATA_TWO])
            })

            it("should only select files not flagged as removed", () => {
                component.filesInUI = [
                    { isRemoved: false, file: TEST_FILE_DATA },
                    { isRemoved: true, file: TEST_FILE_DATA_TWO }
                ]
                component.selectedFilesInUI = []

                component.handleSelectAllFiles()

                expect(component.selectedFilesInUI).toEqual([TEST_FILE_DATA])
            })
        })

        describe("handleInvertSelectedFiles", () => {
            it("should invert selection", () => {
                component.handleInvertSelectedFiles()
                component.handleApplyFileChanges()

                expect(mockedStore.dispatch).toHaveBeenCalledWith(setStandard({ files: [TEST_FILE_DATA_TWO] }))
            })

            it("should not invert removed files", () => {
                component.filesInUI = [
                    { isRemoved: false, file: TEST_FILE_DATA },
                    { isRemoved: true, file: TEST_FILE_DATA_TWO },
                    { isRemoved: false, file: TEST_FILE_DATA_TWO }
                ]

                component.handleInvertSelectedFiles()

                expect(component.selectedFilesInUI).toEqual([TEST_FILE_DATA_TWO])
            })

            it("should set selectedFilesInUI to an empty array if all not removed files are selected", () => {
                component.filesInUI = [
                    { isRemoved: false, file: TEST_FILE_DATA },
                    { isRemoved: false, file: TEST_FILE_DATA_TWO },
                    { isRemoved: true, file: TEST_FILE_DATA_TWO }
                ]
                component.selectedFilesInUI = [TEST_FILE_DATA, TEST_FILE_DATA_TWO]

                component.handleInvertSelectedFiles()

                expect(component.selectedFilesInUI).toEqual([])
            })

            it("should not crash if all files are flagged as removed", () => {
                component.filesInUI = []
                component.selectedFilesInUI = []

                component.handleInvertSelectedFiles()

                expect(component.selectedFilesInUI).toEqual([])
            })

            it("should select all files if no file is visible", () => {
                component.selectedFilesInUI = []

                component.handleInvertSelectedFiles()

                expect(component.selectedFilesInUI).toEqual([TEST_FILE_DATA, TEST_FILE_DATA_TWO])
            })
        })

        describe("handleAddOrRemoveFile", () => {
            beforeEach(() => {
                component.filesInUI = [
                    { isRemoved: false, file: TEST_FILE_DATA },
                    { isRemoved: true, file: TEST_FILE_DATA_TWO }
                ]
                component.selectedFilesInUI = [TEST_FILE_DATA]
            })

            it("should flag file as removed when file is removed", () => {
                const fileNameToRemove = TEST_FILE_DATA.fileMeta.fileName
                component.handleAddOrRemoveFile(fileNameToRemove)

                expect(component.filesInUI.find(file => file.file.fileMeta.fileName === fileNameToRemove).isRemoved).toBeTruthy()
            })

            it("should remove file from selectedFilesInUI when file is removed", () => {
                const fileNameToRemove = TEST_FILE_DATA.fileMeta.fileName
                component.handleAddOrRemoveFile(fileNameToRemove)

                expect(component.selectedFilesInUI).toEqual([])
            })

            it("should add a file if it is already flagged as removed", () => {
                const fileNameToAdd = TEST_FILE_DATA_TWO.fileMeta.fileName
                component.handleAddOrRemoveFile(fileNameToAdd)

                expect(component.filesInUI.find(file => file.file.fileMeta.fileName === fileNameToAdd).isRemoved).toBeFalsy()
            })

            it("should dispatch an action to remove the flagged files if applied", () => {
                const fileNameToRemove = TEST_FILE_DATA.fileMeta.fileName

                component.handleAddOrRemoveFile(fileNameToRemove)
                component.handleApplyFileChanges()

                expect(mockedStore.dispatch).toHaveBeenCalledWith(
                    removeFiles({ fileNames: [fileNameToRemove, TEST_FILE_DATA_TWO.fileMeta.fileName] })
                )
            })
        })
    })

    describe("Button State", () => {
        let component: FilePanelFileSelectorComponent

        beforeEach(() => {
            const mockedStore = createMockedStore()
            component = new FilePanelFileSelectorComponent(mockedStore)
            component.filesInUI = [
                { isRemoved: false, file: TEST_FILE_DATA },
                { isRemoved: false, file: TEST_FILE_DATA_TWO }
            ]
            component.filesInStore = [
                { selectedAs: FileSelectionState.Partial, file: TEST_FILE_DATA },
                { selectedAs: FileSelectionState.None, file: TEST_FILE_DATA_TWO }
            ]
            component.selectedFilesInUI = [TEST_FILE_DATA]
        })

        it("should set button state to 'No Changes To Apply' if selection is opened", () => {
            component.handleOpenedChanged(true)

            expect(component.applyButtonTooltip).toBe("No changes to apply")
            expect(component.applyButtonDisabled).toBe(true)
        })

        it("should set button state to 'No Map Selected' if no files are selected", () => {
            component.selectedFilesInUI = []

            component.handleAddOrRemoveFile("do_something")

            expect(component.applyButtonTooltip).toBe("Select at least one map")
            expect(component.applyButtonDisabled).toBe(true)
        })

        it("should set button state to 'No Map Selected' if only selected file is deleted", () => {
            component.handleAddOrRemoveFile(TEST_FILE_DATA.fileMeta.fileName)

            expect(component.applyButtonTooltip).toBe("Select at least one map")
            expect(component.applyButtonDisabled).toBe(true)
        })

        it("should set button state to 'Enabled' if UI selection differs from store", () => {
            component.handleInvertSelectedFiles()

            expect(component.applyButtonTooltip).toBe("")
            expect(component.applyButtonDisabled).toBe(false)
        })

        it("should set button state to 'No Changes To Apply' if UI selection matches store", () => {
            component.handleSelectedFilesChanged([TEST_FILE_DATA])

            expect(component.applyButtonTooltip).toBe("No changes to apply")
            expect(component.applyButtonDisabled).toBe(true)
        })

        it("should enable button if at least one file is flagged as removed", () => {
            component.handleAddOrRemoveFile(TEST_FILE_DATA_TWO.fileMeta.fileName)

            expect(component.applyButtonDisabled).toBe(false)
        })

        it("should enable button if length of selectedFilesInUI is different from length of selectedFilesInStore", () => {
            component.filesInStore = [
                { selectedAs: FileSelectionState.Partial, file: TEST_FILE_DATA },
                { selectedAs: FileSelectionState.Partial, file: TEST_FILE_DATA_TWO }
            ]

            component.handleSelectedFilesChanged([TEST_FILE_DATA])

            expect(component.applyButtonDisabled).toBe(false)
        })

        it("should enable button if content of selectedFilesInUI is different from selectedFilesInStore", () => {
            component.filesInStore = [
                { selectedAs: FileSelectionState.Partial, file: TEST_FILE_DATA },
                { selectedAs: FileSelectionState.None, file: TEST_FILE_DATA_TWO },
                { selectedAs: FileSelectionState.Partial, file: TEST_FILE_DATA_JAVA }
            ]

            component.handleSelectedFilesChanged([TEST_FILE_DATA_TWO, TEST_FILE_DATA_JAVA])

            expect(component.applyButtonDisabled).toBe(false)
        })
    })

    function createMockedStore() {
        return {
            dispatch: jest.fn(),
            select: jest.fn().mockImplementation(selector => {
                if (selector === filesSelector) {
                    return of([
                        { file: TEST_FILE_DATA, selectedAs: FileSelectionState.Partial },
                        { file: TEST_FILE_DATA_TWO, selectedAs: FileSelectionState.None }
                    ])
                }
                return of([])
            })
        } as unknown as Store<CcState>
    }
})
