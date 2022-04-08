import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricTypeHoveredComponent } from "./metricTypeHovered.component"

@NgModule({
	imports: [CommonModule],
	declarations: [MetricTypeHoveredComponent],
	exports: [MetricTypeHoveredComponent],
	entryComponents: [MetricTypeHoveredComponent]
})
export class MetricTypeHoveredModule {}
