import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricChooserModule } from "../../metricChooser/metricChooser.module"
import { AreaMetricChooserComponent } from "./areaMetricChooser.component"

@NgModule({
    imports: [CommonModule, MetricChooserModule],
    declarations: [AreaMetricChooserComponent],
    exports: [AreaMetricChooserComponent]
})
export class AreaMetricChooserModule {}
