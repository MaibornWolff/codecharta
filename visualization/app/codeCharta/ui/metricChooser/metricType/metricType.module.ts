import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricTypeComponent } from "./metricType.component"

@NgModule({
	imports: [CommonModule],
	declarations: [MetricTypeComponent],
	exports: [MetricTypeComponent],
	entryComponents: [MetricTypeComponent]
})
export class MetricTypeModule {}
