import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricChooserTypeModule } from "../metricChooserType/metricChooserType.module"
import { MetricChooserValueComponent } from "./metricChooserValue.component"

@NgModule({
    imports: [CommonModule, MetricChooserTypeModule],
    declarations: [MetricChooserValueComponent],
    exports: [MetricChooserValueComponent]
})
export class MetricChooserValueModule {}
