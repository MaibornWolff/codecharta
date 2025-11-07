import { ComponentFixture, TestBed } from "@angular/core/testing"
import { provideMockStore, MockStore } from "@ngrx/store/testing"
import { State } from "@ngrx/store"
import { screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { DisplayQualitySelectionComponent } from "./displayQualitySelection.component"
import { sharpnessModeSelector } from "../../../selectors/globalSettings.selectors"
import { SharpnessMode } from "../../../../../codeCharta.model"
import { getLastAction } from "../../../../../util/testUtils/store.utils"
import { setSharpnessMode } from "../../../../../state/store/appSettings/sharpnessMode/sharpnessMode.actions"
import { defaultState } from "../../../../../state/store/state.manager"

describe("DisplayQualitySelectionComponent", () => {
    let fixture: ComponentFixture<DisplayQualitySelectionComponent>
    let store: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [DisplayQualitySelectionComponent],
            providers: [
                provideMockStore({
                    selectors: [{ selector: sharpnessModeSelector, value: SharpnessMode.Standard }]
                }),
                { provide: State, useValue: { getValue: () => defaultState } }
            ]
        })

        fixture = TestBed.createComponent(DisplayQualitySelectionComponent)
        store = TestBed.inject(MockStore)
        fixture.detectChanges()
    })

    it("should change display quality selection", async () => {
        // Arrange
        const selectElement = screen.getByRole("combobox", { name: /display quality/i }) as HTMLSelectElement
        expect(selectElement.value).toBe("High")

        // Act
        await userEvent.selectOptions(selectElement, "Low")

        // Assert
        expect(await getLastAction(store)).toEqual(setSharpnessMode({ value: SharpnessMode.PixelRatioNoAA }))
    })
})
