import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"

import { AttributeTypeSelectorComponent } from "./attributeTypeSelector.component"
import { MaterialModule } from "../../../material/material.module"
import { AggregationSymbolPipe } from "./aggregationSymbol.pipe"

@NgModule({
	imports: [CommonModule, MaterialModule],
	declarations: [AttributeTypeSelectorComponent, AggregationSymbolPipe],
	exports: [AttributeTypeSelectorComponent]
})
export class AttributeTypeSelectorModule {}
