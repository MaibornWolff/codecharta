import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { addFile, setDelta } from "../../../state/store/files/files.actions"
import { setInvertHeight } from "../../../state/store/appSettings/invertHeight/invertHeight.actions"
import { setHeightScaleMode } from "../../../state/store/appSettings/heightScaleMode/heightScaleMode.actions"
import { TEST_FILE_DATA } from "../../../util/dataMocks"
import { HeightSettingsPanelComponent } from "./heightSettingsPanel.component"
import { Store, StoreModule } from "@ngrx/store"
import { appReducers, setStateMiddleware } from "../../../state/store/state.manager"
import { HeightScaleMode } from "../../../codeCharta.model"

describe("HeightSettingsPanelComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HeightSettingsPanelComponent, StoreModule.forRoot(appReducers, { metaReducers: [setStateMiddleware] })]
        })
    })

    it("should display height slider", async () => {
        // Arrange / Act
        await render(HeightSettingsPanelComponent)

        // Assert
        expect(screen.getByTitle("Height")).not.toBe(null)
    })

    it("should dispatch setInvertHeight action when invertHeight checkbox is clicked", async () => {
        // Arrange
        await render(HeightSettingsPanelComponent)
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")

        // Act
        await userEvent.click(screen.getByText("Invert Height"))

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setInvertHeight({ value: true }))
    })

    it("should display height scale mode dropdown with label", async () => {
        // Arrange / Act
        await render(HeightSettingsPanelComponent)

        // Assert
        expect(screen.getByText("Height Scale Mode")).not.toBe(null)
        expect(screen.getByRole("combobox")).not.toBe(null)
    })

    it("should dispatch setHeightScaleMode action when mode is changed", async () => {
        // Arrange
        await render(HeightSettingsPanelComponent)
        const dispatchSpy = jest.spyOn(TestBed.inject(Store), "dispatch")

        // Act
        await userEvent.selectOptions(screen.getByRole("combobox"), HeightScaleMode.Logarithmic)

        // Assert
        expect(dispatchSpy).toHaveBeenCalledWith(setHeightScaleMode({ value: HeightScaleMode.Logarithmic }))
    })

    it("should not display invertHeight-checkbox when being in delta mode", async () => {
        // Arrange
        const { detectChanges } = await render(HeightSettingsPanelComponent)
        const store = TestBed.inject(Store)
        store.dispatch(addFile({ file: TEST_FILE_DATA }))
        store.dispatch(setDelta({ referenceFile: TEST_FILE_DATA, comparisonFile: TEST_FILE_DATA }))

        // Act
        detectChanges()

        // Assert
        expect(screen.queryByText("Invert Height")).toBe(null)
    })
})
