import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricChooserModule } from "../../metricChooser/metricChooser.module"
import { EdgeMetricChooserComponent } from "./edgeMetricChooser.component"

@NgModule({
    imports: [CommonModule, MetricChooserModule],
    declarations: [EdgeMetricChooserComponent],
    exports: [EdgeMetricChooserComponent]
})
export class EdgeMetricChooserModule {}
