import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricTypeModule } from "../metricType/metricType.module"
import { MetricValueHoveredComponent } from "./metricValueHovered.component"

@NgModule({
	imports: [CommonModule, MetricTypeModule],
	declarations: [MetricValueHoveredComponent],
	exports: [MetricValueHoveredComponent],
	entryComponents: [MetricValueHoveredComponent]
})
export class MetricValueHoveredModule {}
