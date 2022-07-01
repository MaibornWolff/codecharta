import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../../../material/material.module"
import { RangeSliderComponent } from "./rangeSlider.component"
import { RangeSliderLabelsComponent } from "./rangeSliderLabels/rangeSliderLabels.component"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [RangeSliderComponent, RangeSliderLabelsComponent],
	exports: [RangeSliderComponent]
})
export class RangeSliderModule {}
