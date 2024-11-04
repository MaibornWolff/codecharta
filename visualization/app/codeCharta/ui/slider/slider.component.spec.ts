import { HarnessLoader } from "@angular/cdk/testing"
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed"
import { ComponentFixture, TestBed } from "@angular/core/testing"
import { MatInputHarness } from "@angular/material/input/testing"
import { MatSliderHarness } from "@angular/material/slider/testing"
import { SliderComponent } from "./slider.component"
import { SliderModule } from "./slider.module"

let loader: HarnessLoader
let fixture: ComponentFixture<SliderComponent>

describe("SliderComponent", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SliderModule],
            declarations: [SliderComponent]
        }).compileComponents()
        fixture = TestBed.createComponent(SliderComponent)
        loader = TestbedHarnessEnvironment.loader(fixture)
    })

    it("should update given value on input changes", async () => {
        let value = 21
        fixture.componentInstance.value = value
        fixture.componentInstance.min = 1
        fixture.componentInstance.max = 100
        fixture.componentInstance.onChange = (newValue: number) => {
            value = newValue
        }
        fixture.detectChanges()

        const input = await loader.getHarness(MatInputHarness)
        await input.setValue("42")

        expect(await input.getValue()).toBe("42")
        expect(value).toBe(42)
    })

    it("should update given value on slider changes", async () => {
        let value = 21
        fixture.componentInstance.value = value
        fixture.componentInstance.min = 1
        fixture.componentInstance.max = 100
        fixture.componentInstance.onChange = (newValue: number) => {
            value = newValue
        }
        fixture.detectChanges()

        const slider = await loader.getHarness(MatSliderHarness)
        const sliderThumb = await slider.getEndThumb()
        await sliderThumb.setValue(42)

        expect(await sliderThumb.getValue()).toBe(42)
        expect(value).toBe(42)
    })
})
