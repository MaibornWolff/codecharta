import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../../material/material.module"
import { RangeSliderLabelsComponent } from "./rangeSliderLabels/rangeSliderLabels.component"
import { MetricColorRangeSliderComponent } from "./metricColorRangeSlider.component"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [MetricColorRangeSliderComponent, RangeSliderLabelsComponent],
	exports: [MetricColorRangeSliderComponent]
})
export class MetricColorRangeSliderModule {}