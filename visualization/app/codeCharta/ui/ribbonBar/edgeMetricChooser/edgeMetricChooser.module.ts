import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricChooserModule } from "../../metricChooser/metricChooser.module"
import { EdgeMetricChooserComponent } from "./edgeMetricChooser.component"
import { MetricChooserTypeModule } from "../../metricChooser/metricChooserType/metricChooserType.module"
import { RoundedBoxModule } from "../roundedBox/roundedBox.module";

@NgModule({
    imports: [CommonModule, MetricChooserModule, MetricChooserTypeModule, RoundedBoxModule],
    declarations: [EdgeMetricChooserComponent],
    exports: [EdgeMetricChooserComponent]
})
export class EdgeMetricChooserModule {}
