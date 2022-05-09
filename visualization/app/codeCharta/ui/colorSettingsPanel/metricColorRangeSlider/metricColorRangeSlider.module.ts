import { NgModule } from "@angular/core"
import { MetricColorRangeSliderComponent } from "./metricColorRangeSlider.component"
import { RangeSliderModule } from "./rangeSlider/rangeSlider.module"

@NgModule({
	imports: [RangeSliderModule],
	declarations: [MetricColorRangeSliderComponent],
	exports: [MetricColorRangeSliderComponent],
	entryComponents: [MetricColorRangeSliderComponent]
})
export class MetricColorRangeSliderModule {}
