import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { RangeSliderComponent } from "./rangeSlider.component"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [RangeSliderComponent],
	exports: [RangeSliderComponent],
	entryComponents: [RangeSliderComponent]
})
export class RangeSliderModule {}
