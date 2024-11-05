import { HarnessLoader } from "@angular/cdk/testing"
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed"
import { ComponentFixture, TestBed } from "@angular/core/testing"
import { MatInputHarness } from "@angular/material/input/testing"
import { MatSelectHarness } from "@angular/material/select/testing"
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { screen } from "@testing-library/angular"
import { LayoutAlgorithm } from "../../../../../codeCharta.model"
import { setLayoutAlgorithm } from "../../../../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.actions"
import { layoutAlgorithmSelector } from "../../../../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.selector"
import { setMaxTreeMapFiles } from "../../../../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.actions"
import { maxTreeMapFilesSelector } from "../../../../../state/store/appSettings/maxTreeMapFiles/maxTreeMapFiles.selector"
import { getLastAction } from "../../../../../util/testUtils/store.utils"
import { MapLayoutSelectionComponent } from "./mapLayoutSelection.component"

let loader: HarnessLoader
let fixture: ComponentFixture<MapLayoutSelectionComponent>

describe("MapLayoutSelectionComponent", () => {
    let store: MockStore
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MapLayoutSelectionComponent],
            providers: [
                provideAnimationsAsync(),
                provideMockStore({
                    selectors: [
                        { selector: layoutAlgorithmSelector, value: LayoutAlgorithm.SquarifiedTreeMap },
                        { selector: maxTreeMapFilesSelector, value: 100 }
                    ]
                })
            ]
        }).compileComponents()
        fixture = TestBed.createComponent(MapLayoutSelectionComponent)
        loader = TestbedHarnessEnvironment.loader(fixture)
        store = TestBed.inject(MockStore)
    })

    it("should change map layout selection", async () => {
        const select = await loader.getHarness(MatSelectHarness)
        expect(await select.getValueText()).toBe("Squarified TreeMap")

        await select.open()
        await select.clickOptions({ text: "StreetMap" })

        expect(await getLastAction(store)).toEqual(setLayoutAlgorithm({ value: LayoutAlgorithm.StreetMap }))
    })

    it("should not display max tree map files slider when layout selection is NOT 'TreeMapStreet'", async () => {
        await loader.getHarness(MatSelectHarness)
        expect(screen.queryByText("Maximum TreeMap Files")).toBe(null)
    })

    it("should display max tree map files slider when layout selection is 'TreeMapStreet'", async () => {
        store.overrideSelector(layoutAlgorithmSelector, LayoutAlgorithm.TreeMapStreet)
        store.refreshState()
        fixture.detectChanges()
        const select = await loader.getHarness(MatSelectHarness)
        expect(await select.getValueText()).toBe("TreeMapStreet")
        expect(screen.queryByText("Maximum TreeMap Files")).not.toBe(null)

        const input = await loader.getHarness(MatInputHarness)
        expect(await input.getValue()).toBe("100")

        await input.setValue("42")
        expect(await getLastAction(store)).toEqual(setMaxTreeMapFiles({ value: 42 }))
    })
})
