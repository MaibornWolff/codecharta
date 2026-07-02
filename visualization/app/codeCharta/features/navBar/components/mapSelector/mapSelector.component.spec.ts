import { TestBed } from "@angular/core/testing"
import { Store, StoreModule } from "@ngrx/store"
import { fireEvent, render, screen } from "@testing-library/angular"
import { addFile, removeFiles, setStandard } from "../../../../fileStore/store/files.actions"
import { appReducers, setStateMiddleware } from "../../../../state/store/state.manager"
import { TEST_FILE_DATA, TEST_FILE_DATA_TWO } from "../../../../mocks/dataMocks"
import { MapSelectorComponent } from "./mapSelector.component"

describe("MapSelectorComponent", () => {
    it("should display 'Select map' when no file is selected", async () => {
        // Arrange & Act
        await render(MapSelectorComponent, {
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })

        // Assert
        expect(screen.getByText("Select map")).toBeTruthy()
    })

    it("should display the file name (without extension) when a single file is selected", async () => {
        // Arrange
        await render(MapSelectorComponent, {
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        const store = TestBed.inject(Store)

        // Act
        store.dispatch(addFile({ file: TEST_FILE_DATA }))
        store.dispatch(setStandard({ files: [TEST_FILE_DATA] }))

        // Assert
        const expected = TEST_FILE_DATA.fileMeta.fileName.replace(/(\.cc)?\.json(\.gz)?$/, "")
        expect(await screen.findByText(expected)).toBeTruthy()
    })

    it("should open the dropdown on trigger click and show files", async () => {
        // Arrange
        await render(MapSelectorComponent, {
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        const store = TestBed.inject(Store)
        store.dispatch(addFile({ file: TEST_FILE_DATA }))
        store.dispatch(addFile({ file: TEST_FILE_DATA_TWO }))
        store.dispatch(setStandard({ files: [TEST_FILE_DATA] }))

        // Act
        fireEvent.click(screen.getAllByRole("button")[0])

        // Assert
        const checkboxes = screen.getAllByRole("checkbox")
        expect(checkboxes).toHaveLength(2)
    })

    it("should dispatch setStandard and removeFiles on Apply", async () => {
        // Arrange
        await render(MapSelectorComponent, {
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        const store = TestBed.inject(Store)
        const dispatchSpy = jest.spyOn(store, "dispatch")
        store.dispatch(addFile({ file: TEST_FILE_DATA }))
        store.dispatch(addFile({ file: TEST_FILE_DATA_TWO }))
        store.dispatch(setStandard({ files: [TEST_FILE_DATA] }))
        dispatchSpy.mockClear()

        fireEvent.click(screen.getAllByRole("button")[0])
        const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[]

        // Act — toggle the second file on
        fireEvent.click(checkboxes[1])
        fireEvent.click(screen.getByRole("button", { name: "Apply" }))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setStandard({ files: [TEST_FILE_DATA, TEST_FILE_DATA_TWO] }))
        expect(dispatchSpy).toHaveBeenCalledWith(removeFiles({ fileNames: [] }))
    })

    it("should reset selection when closing the dropdown without applying", async () => {
        // Arrange
        const { fixture } = await render(MapSelectorComponent, {
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        const store = TestBed.inject(Store)
        store.dispatch(addFile({ file: TEST_FILE_DATA }))
        store.dispatch(addFile({ file: TEST_FILE_DATA_TWO }))
        store.dispatch(setStandard({ files: [TEST_FILE_DATA] }))

        const trigger = screen.getAllByRole("button")[0]
        fireEvent.click(trigger)
        const checkboxes = screen.getAllByRole("checkbox") as HTMLInputElement[]

        // Act — toggle second file then close without Apply
        fireEvent.click(checkboxes[1])
        expect(fixture.componentInstance.selectedFilesInUI()).toContain(TEST_FILE_DATA_TWO)
        fireEvent.click(document.body) // outside click
        fixture.detectChanges()

        // Assert — selection is reset to store
        expect(fixture.componentInstance.selectedFilesInUI()).toEqual([TEST_FILE_DATA])
    })

    it("should mark a file as removed when its remove button is clicked", async () => {
        // Arrange
        const { fixture } = await render(MapSelectorComponent, {
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        const store = TestBed.inject(Store)
        store.dispatch(addFile({ file: TEST_FILE_DATA }))
        store.dispatch(setStandard({ files: [TEST_FILE_DATA] }))

        fireEvent.click(screen.getAllByRole("button")[0])

        // Act
        const removeButton = screen.getByTitle("Remove map")
        fireEvent.click(removeButton)

        // Assert
        const filesInUI = fixture.componentInstance.filesInUI()
        expect(filesInUI[0].isRemoved).toBe(true)
        expect(fixture.componentInstance.selectedFilesInUI()).toEqual([])
    })

    it("should select all files when clicking All", async () => {
        // Arrange
        const { fixture } = await render(MapSelectorComponent, {
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        const store = TestBed.inject(Store)
        store.dispatch(addFile({ file: TEST_FILE_DATA }))
        store.dispatch(addFile({ file: TEST_FILE_DATA_TWO }))
        store.dispatch(setStandard({ files: [TEST_FILE_DATA] }))

        fireEvent.click(screen.getAllByRole("button")[0])

        // Act
        fireEvent.click(screen.getByRole("button", { name: "All" }))

        // Assert
        expect(fixture.componentInstance.selectedFilesInUI()).toEqual([TEST_FILE_DATA, TEST_FILE_DATA_TWO])
    })

    it("should clear the selection when clicking None", async () => {
        // Arrange
        const { fixture } = await render(MapSelectorComponent, {
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        const store = TestBed.inject(Store)
        store.dispatch(addFile({ file: TEST_FILE_DATA }))
        store.dispatch(setStandard({ files: [TEST_FILE_DATA] }))

        fireEvent.click(screen.getAllByRole("button")[0])

        // Act
        fireEvent.click(screen.getByRole("button", { name: "None" }))

        // Assert
        expect(fixture.componentInstance.selectedFilesInUI()).toEqual([])
    })

    it("should invert the selection when clicking Invert", async () => {
        // Arrange
        const { fixture } = await render(MapSelectorComponent, {
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        const store = TestBed.inject(Store)
        store.dispatch(addFile({ file: TEST_FILE_DATA }))
        store.dispatch(addFile({ file: TEST_FILE_DATA_TWO }))
        store.dispatch(setStandard({ files: [TEST_FILE_DATA] }))

        fireEvent.click(screen.getAllByRole("button")[0])

        // Act
        fireEvent.click(screen.getByRole("button", { name: "Invert" }))

        // Assert
        expect(fixture.componentInstance.selectedFilesInUI()).toEqual([TEST_FILE_DATA_TWO])
    })

    it("should dispatch removeFiles with the flagged file name on Apply", async () => {
        // Arrange
        await render(MapSelectorComponent, {
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        const store = TestBed.inject(Store)
        store.dispatch(addFile({ file: TEST_FILE_DATA }))
        store.dispatch(addFile({ file: TEST_FILE_DATA_TWO }))
        store.dispatch(setStandard({ files: [TEST_FILE_DATA, TEST_FILE_DATA_TWO] }))
        const dispatchSpy = jest.spyOn(store, "dispatch")

        fireEvent.click(screen.getAllByRole("button")[0])
        const removeButtons = screen.getAllByTitle("Remove map")

        // Act — flag first file as removed, apply
        fireEvent.click(removeButtons[0])
        fireEvent.click(screen.getByRole("button", { name: "Apply" }))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(removeFiles({ fileNames: [TEST_FILE_DATA.fileMeta.fileName] }))
    })
})
