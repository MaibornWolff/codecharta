import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"

import { AttributeSideBarComponent } from "./attributeSideBar.component"
import { AttributeSideBarSecondaryMetricsComponent } from "./attributeSideBarSecondaryMetrics/attributeSideBarSecondaryMetrics.component"
import { AttributeTypeSelectorModule } from "./attributeTypeSelector/attributeTypeSelector.module"
import { MetricDeltaSelectedModule } from "./metricDeltaSelected/metricDeltaSelected.module"
import { AttributeSideBarPrimaryMetricsComponent } from "./attributeSideBarPrimaryMetrics/attributeSideBarPrimaryMetrics.component"
import { AttributeSideBarPrimaryMetricComponent } from "./attributeSideBarPrimaryMetrics/attributeSideBarPrimaryMetric/attributeSideBarPrimaryMetric.component"
import { AttributeSideBarHeaderSectionComponent } from "./attributeSideBarHeaderSection/attributeSideBarHeaderSection.component"
import { NodePathComponent } from "./attributeSideBarHeaderSection/nodePath/nodePath.component"
import { MaterialModule } from "../../../material/material.module"

@NgModule({
	imports: [CommonModule, MaterialModule, AttributeTypeSelectorModule, MetricDeltaSelectedModule],
	declarations: [
		AttributeSideBarComponent,
		AttributeSideBarHeaderSectionComponent,
		NodePathComponent,
		AttributeSideBarPrimaryMetricsComponent,
		AttributeSideBarPrimaryMetricComponent,
		AttributeSideBarSecondaryMetricsComponent
	],
	exports: [AttributeSideBarComponent]
})
export class AttributeSideBarModule {}
