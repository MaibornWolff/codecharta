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
import { RemoveExtensionPipeModule } from "../../util/pipes/RemoveExtensionPipeModule"
import { AttributeDescriptorTooltipPipeModule } from "../../util/pipes/AttributeDescriptorTooltipPipeModule"

@NgModule({
	imports: [
		CommonModule,
		MaterialModule,
		AttributeTypeSelectorModule,
		MetricDeltaSelectedModule,
		RemoveExtensionPipeModule,
		AttributeDescriptorTooltipPipeModule
	],
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
