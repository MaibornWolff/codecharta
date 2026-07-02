import { TestBed } from "@angular/core/testing"
import { Store, StoreModule } from "@ngrx/store"
import { fireEvent, render, screen, within } from "@testing-library/angular"
import {
    addFile,
    setDelta,
    setDeltaComparison,
    setDeltaReference,
    switchReferenceAndComparison
} from "../../../../fileStore/store/files.actions"
import { appReducers, setStateMiddleware } from "../../../../state/store/state.manager"
import { TEST_FILE_DATA, TEST_FILE_DATA_TWO } from "../../../../mocks/dataMocks"
import { DeltaSelectorComponent } from "./deltaSelector.component"

describe("DeltaSelectorComponent", () => {
    async function setup() {
        const result = await render(DeltaSelectorComponent, {
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        const store = TestBed.inject(Store)
        store.dispatch(addFile({ file: TEST_FILE_DATA }))
        store.dispatch(addFile({ file: TEST_FILE_DATA_TWO }))
        store.dispatch(setDelta({ referenceFile: TEST_FILE_DATA, comparisonFile: TEST_FILE_DATA_TWO }))
        result.detectChanges()
        return { ...result, store }
    }

    function getDropdownList(): HTMLElement {
        const lists = document.querySelectorAll(".dropdown-content ul")
        return lists[lists.length - 1] as HTMLElement
    }

    it("should show the current reference and comparison labels", async () => {
        // Arrange & Act
        const { fixture } = await setup()

        // Assert
        expect(fixture.componentInstance.referenceLabel()).toBe("fileA")
        expect(fixture.componentInstance.comparisonLabel()).toBe("fileTwo")
    })

    it("should dispatch setDeltaReference when a reference option is picked", async () => {
        // Arrange
        const { store } = await setup()
        const dispatchSpy = jest.spyOn(store, "dispatch")
        const triggers = screen.getAllByRole("button")

        // Act — open the reference dropdown (first trigger), then click the option
        fireEvent.click(triggers[0])
        const list = getDropdownList()
        fireEvent.click(within(list).getByText("fileTwo"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setDeltaReference({ file: TEST_FILE_DATA_TWO }))
    })

    it("should dispatch setDeltaComparison when a comparison option is picked", async () => {
        // Arrange
        const { store, fixture } = await setup()
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act — call the handler directly to avoid relying on dropdown DOM ordering
        fixture.componentInstance.handleComparisonChange(TEST_FILE_DATA)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setDeltaComparison({ file: TEST_FILE_DATA }))
    })

    it("should dispatch switchReferenceAndComparison when the swap button is clicked", async () => {
        // Arrange
        const { store } = await setup()
        const dispatchSpy = jest.spyOn(store, "dispatch")

        // Act
        fireEvent.click(screen.getByTitle("Switch reference and comparison file"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(switchReferenceAndComparison())
    })

    it("should disable the swap button when no comparison file is selected", async () => {
        // Arrange
        const { fixture } = await render(DeltaSelectorComponent, {
            imports: [StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
        const store = TestBed.inject(Store)
        store.dispatch(addFile({ file: TEST_FILE_DATA }))
        store.dispatch(setDelta({ referenceFile: TEST_FILE_DATA, comparisonFile: undefined }))
        fixture.detectChanges()

        // Assert
        expect(fixture.componentInstance.swapDisabled()).toBe(true)
    })
})
