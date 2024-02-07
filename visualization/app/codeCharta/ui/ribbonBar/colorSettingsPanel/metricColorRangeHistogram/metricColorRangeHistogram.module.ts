import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricColorRangeHistogramComponent as MetricColorRangeHistogramComponent } from "./metricColorRangeHistogram.component"
import { RangeHistogramModule } from "./rangeHistogram/rangeHistogram.module"

@NgModule({
	imports: [CommonModule, RangeHistogramModule],
	declarations: [MetricColorRangeHistogramComponent],
	exports: [MetricColorRangeHistogramComponent]
})
export class MetricColorRangeHistogramModule {}
