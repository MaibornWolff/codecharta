import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"

import { AttributeTypeSelectorComponent } from "./attributeTypeSelector.component"
import { MaterialModule } from "../../../../material/material.module"
import { AggregationTypeModule } from "../../../pipes/aggregationType/aggregationType.module"

@NgModule({
	imports: [CommonModule, MaterialModule, AggregationTypeModule],
	declarations: [AttributeTypeSelectorComponent],
	exports: [AttributeTypeSelectorComponent]
})
export class AttributeTypeSelectorModule {}
