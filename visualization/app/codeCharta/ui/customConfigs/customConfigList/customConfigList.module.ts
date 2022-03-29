import { NgModule } from "@angular/core"

import { CustomConfigListComponent } from "./customConfigList.component"
import { MaterialModule } from "../../../../material/material.module"
import { CommonModule } from "@angular/common"

@NgModule({
	imports: [MaterialModule, CommonModule],
	declarations: [CustomConfigListComponent],
	exports: [CustomConfigListComponent],
	entryComponents: [CustomConfigListComponent]
})
export class CustomConfigListModule {}
