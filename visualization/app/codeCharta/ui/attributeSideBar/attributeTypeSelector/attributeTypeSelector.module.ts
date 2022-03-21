import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"

import { AttributeTypeSelectorComponent } from "./attributeTypeSelector.component"
import { MaterialModule } from "../../../../material/material.module"
import { NodeMetricAggregationTypeModule } from "../../../pipes/nodeMetricAggregationType/nodeMetricAggregationType.module"

@NgModule({
	imports: [CommonModule, MaterialModule, NodeMetricAggregationTypeModule],
	declarations: [AttributeTypeSelectorComponent],
	exports: [AttributeTypeSelectorComponent]
})
export class AttributeTypeSelectorModule {}
