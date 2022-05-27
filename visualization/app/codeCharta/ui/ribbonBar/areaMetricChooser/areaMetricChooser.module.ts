import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricChooserModule } from "../../metricChooser/metricChooser.module"
import { MetricChooserValueHoveredModule } from "../../metricChooser/metricChooserValueHovered/metricChooserValueHovered.module"
import { AreaMetricChooserComponent } from "./areaMetricChooser.component"

@NgModule({
	imports: [CommonModule, MetricChooserModule, MetricChooserValueHoveredModule],
	declarations: [AreaMetricChooserComponent],
	exports: [AreaMetricChooserComponent]
})
export class AreaMetricChooserModule {}
