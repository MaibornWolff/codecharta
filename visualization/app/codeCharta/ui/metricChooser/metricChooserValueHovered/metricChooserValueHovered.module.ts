import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricChooserTypeHoveredModule } from "../metricChooserTypeHovered/metricChooserTypeHovered.module"
import { MetricChooserValueHoveredComponent } from "./metricChooserValueHovered.component"

@NgModule({
	imports: [CommonModule, MetricChooserTypeHoveredModule],
	declarations: [MetricChooserValueHoveredComponent],
	exports: [MetricChooserValueHoveredComponent]
})
export class MetricChooserValueHoveredModule {}
