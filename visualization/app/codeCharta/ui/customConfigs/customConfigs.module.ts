import "../../state/state.module"
import { CustomConfigsComponent } from "./customConfigs.component"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../material/material.module"
import { CommonModule } from "@angular/common"
import { UploadCustomConfigButtonModule } from "./uploadCustomConfigButton/uploadCustomConfigButton.module"
import { AddCustomConfigButtonModule } from "./addCustomConfigButton/addCustomConfigButton.module"
import { DownloadCustomConfigButtonModule } from "./downloadCustomConfigsButton/downloadCustomConfigButton.module"
import { CustomConfigListComponent } from "./customConfigList/customConfigList.component"
import { CustomConfigItemGroupComponent } from "./customConfigList/customConfigItemGroup.component"

@NgModule({
	imports: [MaterialModule, CommonModule, UploadCustomConfigButtonModule, AddCustomConfigButtonModule, DownloadCustomConfigButtonModule],
	declarations: [CustomConfigsComponent, CustomConfigListComponent, CustomConfigItemGroupComponent],
	exports: [CustomConfigsComponent],
	entryComponents: [CustomConfigListComponent]
})
export class CustomConfigsModule {}
