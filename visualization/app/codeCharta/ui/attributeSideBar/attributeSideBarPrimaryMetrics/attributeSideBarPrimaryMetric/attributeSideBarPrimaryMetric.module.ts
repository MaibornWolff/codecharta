import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"

import { AttributeTypeSelectorModule } from "../../../attributeTypeSelector/attributeTypeSelector.module"
import { MetricDeltaSelectedModule } from "../../../metricDeltaSelected/metricDeltaSelected.module"
import { AttributeSideBarPrimaryMetricComponent } from "./attributeSideBarPrimaryMetric.component"

@NgModule({
	imports: [CommonModule, AttributeTypeSelectorModule, MetricDeltaSelectedModule],
	declarations: [AttributeSideBarPrimaryMetricComponent],
	exports: [AttributeSideBarPrimaryMetricComponent]
})
export class AttributeSideBarPrimaryMetricModule {}
