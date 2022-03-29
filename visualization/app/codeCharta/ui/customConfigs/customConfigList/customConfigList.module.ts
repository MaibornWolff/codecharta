import { NgModule } from "@angular/core"

import { CustomConfigListComponent } from "./customConfigList.component"
import { MaterialModule } from "../../../../material/material.module"
import { CommonModule } from "@angular/common"
import { CustomConfigItemGroupComponent } from "./customConfigItemGroup.component"

@NgModule({
	imports: [MaterialModule, CommonModule],
	declarations: [CustomConfigListComponent, CustomConfigItemGroupComponent],
	exports: [CustomConfigListComponent]
})
export class CustomConfigListModule {}
