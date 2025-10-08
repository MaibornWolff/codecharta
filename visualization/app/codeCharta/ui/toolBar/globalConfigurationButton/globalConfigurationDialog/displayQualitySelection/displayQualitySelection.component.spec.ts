import { HarnessLoader } from "@angular/cdk/testing"
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed"
import { ComponentFixture, TestBed } from "@angular/core/testing"
import { MatSelectHarness } from "@angular/material/select/testing"
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async"
import { provideMockStore, MockStore } from "@ngrx/store/testing"
import { DisplayQualitySelectionComponent } from "./displayQualitySelection.component"
import { sharpnessModeSelector } from "../../../../../state/store/appSettings/sharpnessMode/sharpnessMode.selector"
import { SharpnessMode } from "../../../../../codeCharta.model"
import { getLastAction } from "../../../../../util/testUtils/store.utils"
import { setSharpnessMode } from "../../../../../state/store/appSettings/sharpnessMode/sharpnessMode.actions"

describe("DisplayQualitySelectionComponent", () => {
    let fixture: ComponentFixture<DisplayQualitySelectionComponent>
    let loader: HarnessLoader
    let store: MockStore

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [DisplayQualitySelectionComponent],
            providers: [
                provideAnimationsAsync(),
                provideMockStore({
                    selectors: [{ selector: sharpnessModeSelector, value: SharpnessMode.Standard }]
                })
            ]
        })

        fixture = TestBed.createComponent(DisplayQualitySelectionComponent)
        loader = TestbedHarnessEnvironment.loader(fixture)
        store = TestBed.inject(MockStore)
    })

    it("should change display quality selection", async () => {
        const select = await loader.getHarness(MatSelectHarness)

        await select.open()
        await select.clickOptions({ text: "Low" })

        expect(await getLastAction(store)).toEqual(setSharpnessMode({ value: SharpnessMode.PixelRatioNoAA }))
    })
})
