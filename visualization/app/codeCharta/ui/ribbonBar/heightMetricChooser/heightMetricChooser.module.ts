import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricChooserModule } from "../../metricChooser/metricChooser.module"
import { HeightMetricChooserComponent } from "./heightMetricChooser.component"

@NgModule({
    imports: [CommonModule, MetricChooserModule, HeightMetricChooserComponent],
    exports: [HeightMetricChooserComponent]
})
export class HeightMetricChooserModule {}
