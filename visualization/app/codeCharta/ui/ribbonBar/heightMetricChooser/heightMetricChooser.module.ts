import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricChooserModule } from "../../metricChooser/metricChooser.module"
import { MetricChooserValueHoveredModule } from "../../metricChooser/metricChooserValueHovered/metricChooserValueHovered.module"
import { HeightMetricChooserComponent } from "./areaMetricChooser.component"

@NgModule({
	imports: [CommonModule, MetricChooserModule, MetricChooserValueHoveredModule],
	declarations: [HeightMetricChooserComponent],
	exports: [HeightMetricChooserComponent]
})
export class HeightMetricChooserModule {}
