import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricChooserModule } from "../../metricChooser/metricChooser.module"
import { MetricChooserValueHoveredModule } from "../../metricChooser/metricChooserValueHovered/metricChooserValueHovered.module"
import { ColorMetricChooserComponent } from "./colorMetricChooser.component"

@NgModule({
	imports: [CommonModule, MetricChooserModule, MetricChooserValueHoveredModule],
	declarations: [ColorMetricChooserComponent],
	exports: [ColorMetricChooserComponent]
})
export class ColorMetricChooserModule {}
