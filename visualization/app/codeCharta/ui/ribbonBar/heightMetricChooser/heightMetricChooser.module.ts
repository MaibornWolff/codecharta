import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricChooserModule } from "../../metricChooser/metricChooser.module"
import { MetricChooserValueModule } from "../../metricChooser/metricChooserValue/metricChooserValue.module"
import { HeightMetricChooserComponent } from "./heightMetricChooser.component"

@NgModule({
	imports: [CommonModule, MetricChooserModule, MetricChooserValueModule],
	declarations: [HeightMetricChooserComponent],
	exports: [HeightMetricChooserComponent]
})
export class HeightMetricChooserModule {}
