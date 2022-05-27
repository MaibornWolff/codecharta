import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricChooserModule } from "../../metricChooser/metricChooser.module"
import { HeightMetricChooserComponent } from "./areaMetricChooser.component"

@NgModule({
	imports: [CommonModule, MetricChooserModule],
	declarations: [HeightMetricChooserComponent],
	exports: [HeightMetricChooserComponent]
})
export class HeightMetricChooserModule {}
