import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MetricChooserTypeModule } from "../metricChooserType/metricChooserType.module"
import { MetricChooserValueComponent } from "./metricChooserValue.component"
import { RoundedBoxModule } from "../../ribbonBar/roundedBox/roundedBox.module"

@NgModule({
    imports: [CommonModule, MetricChooserTypeModule, RoundedBoxModule],
    declarations: [MetricChooserValueComponent],
    exports: [MetricChooserValueComponent]
})
export class MetricChooserValueModule {}
