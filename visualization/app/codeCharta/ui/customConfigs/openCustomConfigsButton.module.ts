import { NgModule } from "@angular/core"

import { CustomConfigListComponent } from "./customConfigList/customConfigList.component"
import { MaterialModule } from "../../../material/material.module"
import { CommonModule } from "@angular/common"
import { CustomConfigItemGroupComponent } from "./customConfigList/customConfigItemGroup.component"
import { OpenCustomConfigsButtonComponent } from "./openCustomConfigsButton.component"
import { UploadCustomConfigButtonModule } from "./uploadCustomConfigButton/uploadCustomConfigButton.module"
import { AddCustomConfigButtonModule } from "./addCustomConfigButton/addCustomConfigButton.module"
import { DownloadCustomConfigButtonModule } from "./downloadCustomConfigsButton/downloadCustomConfigButton.module"

@NgModule({
	imports: [MaterialModule, CommonModule, UploadCustomConfigButtonModule, AddCustomConfigButtonModule, DownloadCustomConfigButtonModule],
	declarations: [OpenCustomConfigsButtonComponent, CustomConfigListComponent, CustomConfigItemGroupComponent],
	exports: [OpenCustomConfigsButtonComponent],
	entryComponents: [OpenCustomConfigsButtonComponent, CustomConfigListComponent]
})
export class OpenCustomConfigsButtonModule {}
