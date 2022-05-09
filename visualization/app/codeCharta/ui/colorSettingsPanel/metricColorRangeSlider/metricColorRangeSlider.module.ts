import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricColorRangeSliderComponent } from "./metricColorRangeSlider.component"
import { RangeSliderModule } from "./rangeSlider/rangeSlider.module"

@NgModule({
	imports: [CommonModule, RangeSliderModule],
	declarations: [MetricColorRangeSliderComponent],
	exports: [MetricColorRangeSliderComponent],
	entryComponents: [MetricColorRangeSliderComponent]
})
export class MetricColorRangeSliderModule {}
