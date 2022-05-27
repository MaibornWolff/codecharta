import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricTypeHoveredModule } from "../metricTypeHovered/metricTypeHovered.module"
import { MetricValueHoveredComponent } from "./metricValueHovered.component"

@NgModule({
	imports: [CommonModule, MetricTypeHoveredModule],
	declarations: [MetricValueHoveredComponent],
	exports: [MetricValueHoveredComponent],
	entryComponents: [MetricValueHoveredComponent]
})
export class MetricValueHoveredModule {}
