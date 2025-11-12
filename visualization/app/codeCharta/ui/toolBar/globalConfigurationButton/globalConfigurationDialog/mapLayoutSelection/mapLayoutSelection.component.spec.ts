import { ComponentFixture, TestBed } from "@angular/core/testing"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { LayoutAlgorithm } from "../../../../../codeCharta.model"
import { setLayoutAlgorithm } from "../../../../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { setMaxTreeMapFiles } from "../../../../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { getLastAction } from "../../../../../util/testUtils/store.utils"
import { MapLayoutSelectionComponent } from "./mapLayoutSelection.component"
import { GlobalSettingsFacade } from "../../../../../features/globalSettings/facade"
import { BehaviorSubject } from "rxjs"

let fixture: ComponentFixture<MapLayoutSelectionComponent>
let layoutAlgorithmSubject: BehaviorSubject<LayoutAlgorithm>
let maxTreeMapFilesSubject: BehaviorSubject<number>

describe("MapLayoutSelectionComponent", () => {
    let store: MockStore

    beforeEach(() => {
        layoutAlgorithmSubject = new BehaviorSubject<LayoutAlgorithm>(LayoutAlgorithm.SquarifiedTreeMap)
        maxTreeMapFilesSubject = new BehaviorSubject<number>(100)

        const mockFacade = {
            layoutAlgorithm$: () => layoutAlgorithmSubject.asObservable(),
            maxTreeMapFiles$: () => maxTreeMapFilesSubject.asObservable()
        }

        TestBed.configureTestingModule({
            imports: [MapLayoutSelectionComponent],
            providers: [provideMockStore(), { provide: GlobalSettingsFacade, useValue: mockFacade }]
        }).compileComponents()
        fixture = TestBed.createComponent(MapLayoutSelectionComponent)
        store = TestBed.inject(MockStore)
        fixture.detectChanges()
    })

    it("should change map layout selection", async () => {
        // Arrange
        const selectElement = screen.getByRole("combobox", { name: /map layout/i }) as HTMLSelectElement
        expect(selectElement.value).toBe("Squarified TreeMap")

        // Act
        await userEvent.selectOptions(selectElement, "StreetMap")

        // Assert
        expect(await getLastAction(store)).toEqual(setLayoutAlgorithm({ value: LayoutAlgorithm.StreetMap }))
    })

    it("should not display max tree map files slider when layout selection is NOT 'TreeMapStreet'", () => {
        // Arrange & Act
        fixture.detectChanges()

        // Assert
        expect(screen.queryByText("Maximum TreeMap Files")).toBe(null)
    })

    it("should display max tree map files slider when layout selection is 'TreeMapStreet'", async () => {
        // Arrange
        layoutAlgorithmSubject.next(LayoutAlgorithm.TreeMapStreet)
        fixture.detectChanges()

        const selectElement = screen.getByRole("combobox", { name: /map layout/i }) as HTMLSelectElement
        expect(selectElement.value).toBe("TreeMapStreet")
        expect(screen.queryByText("Maximum TreeMap Files")).not.toBe(null)

        // Act
        const input = screen.getByRole("spinbutton") as HTMLInputElement
        await userEvent.clear(input)
        await userEvent.type(input, "42")

        // Wait for debounce (400ms)
        await new Promise(resolve => setTimeout(resolve, 450))

        // Assert
        expect(await getLastAction(store)).toEqual(setMaxTreeMapFiles({ value: 42 }))
    })

    it("should update max tree map files when range slider is moved", async () => {
        // Arrange
        layoutAlgorithmSubject.next(LayoutAlgorithm.TreeMapStreet)
        maxTreeMapFilesSubject.next(100)
        fixture.detectChanges()

        // Act
        const rangeInput = screen.getByRole("slider") as HTMLInputElement
        expect(rangeInput.value).toBe("100")

        // Change the range slider value by directly setting it and triggering input event
        rangeInput.value = "250"
        rangeInput.dispatchEvent(new Event("input", { bubbles: true }))

        // Wait for debounce (400ms)
        await new Promise(resolve => setTimeout(resolve, 450))

        // Assert
        expect(await getLastAction(store)).toEqual(setMaxTreeMapFiles({ value: 250 }))
    })
})
