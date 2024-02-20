import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MatInputModule } from "@angular/material/input"
import { MetricColorRangeDiagramComponent } from "./metricColorRangeDiagram.component"

@NgModule({
	imports: [CommonModule, MatInputModule],
	declarations: [MetricColorRangeDiagramComponent],
	exports: [MetricColorRangeDiagramComponent]
})
export class MetricColorRangeDiagramModule {}
