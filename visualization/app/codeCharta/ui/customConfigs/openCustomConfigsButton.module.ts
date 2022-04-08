import { NgModule } from "@angular/core"

import { CustomConfigListComponent } from "./customConfigList/customConfigList.component"
import { MaterialModule } from "../../../material/material.module"
import { CommonModule } from "@angular/common"
import { CustomConfigItemGroupComponent } from "./customConfigList/customConfigItemGroup.component"
import { OpenCustomConfigsButtonComponent } from "./openCustomConfigsButton.component"

@NgModule({
	imports: [MaterialModule, CommonModule],
	declarations: [OpenCustomConfigsButtonComponent, CustomConfigListComponent, CustomConfigItemGroupComponent],
	exports: [OpenCustomConfigsButtonComponent],
	entryComponents: [OpenCustomConfigsButtonComponent, CustomConfigListComponent]
})
export class OpenCustomConfigsButtonModule {}
