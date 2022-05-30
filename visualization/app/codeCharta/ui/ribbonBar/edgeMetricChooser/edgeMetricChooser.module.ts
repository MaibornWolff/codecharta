import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricChooserModule } from "../../metricChooser/metricChooser.module"
import { MetricChooserTypeHoveredModule } from "../../metricChooser/metricChooserTypeHovered/metricChooserTypeHovered.module"
import { EdgeMetricChooserComponent } from "./edgeMetricChooser.component"

@NgModule({
	imports: [CommonModule, MetricChooserModule, MetricChooserTypeHoveredModule],
	declarations: [EdgeMetricChooserComponent],
	exports: [EdgeMetricChooserComponent]
})
export class EdgeMetricChooserModule {}
