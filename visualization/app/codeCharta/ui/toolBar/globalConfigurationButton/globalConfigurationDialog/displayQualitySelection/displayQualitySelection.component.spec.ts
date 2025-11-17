import { ComponentFixture, TestBed } from "@angular/core/testing"
import { provideMockStore, MockStore } from "@ngrx/store/testing"
import { screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { DisplayQualitySelectionComponent } from "./displayQualitySelection.component"
import { GlobalSettingsFacade } from "../../../../../features/globalSettings/facade"
import { SharpnessMode } from "../../../../../codeCharta.model"
import { getLastAction } from "../../../../../util/testUtils/store.utils"
import { setSharpnessMode } from "../../../../../state/store/appSettings/sharpnessMode/sharpnessMode.actions"
import { of } from "rxjs"

describe("DisplayQualitySelectionComponent", () => {
    let fixture: ComponentFixture<DisplayQualitySelectionComponent>
    let store: MockStore

    beforeEach(() => {
        const mockFacade = {
            sharpnessMode$: () => of(SharpnessMode.Standard)
        }

        TestBed.configureTestingModule({
            imports: [DisplayQualitySelectionComponent],
            providers: [provideMockStore(), { provide: GlobalSettingsFacade, useValue: mockFacade }]
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
