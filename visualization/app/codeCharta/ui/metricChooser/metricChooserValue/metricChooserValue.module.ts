import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricChooserTypeHoveredModule } from "../metricChooserTypeHovered/metricChooserTypeHovered.module"
import { MetricChooserValueComponent } from "./metricChooserValue.component"

@NgModule({
	imports: [CommonModule, MetricChooserTypeHoveredModule],
	declarations: [MetricChooserValueComponent],
	exports: [MetricChooserValueComponent]
})
export class MetricChooserValueModule {}
