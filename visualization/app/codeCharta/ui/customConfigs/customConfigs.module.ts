import "../../state/state.module"
import { CustomConfigsComponent } from "./customConfigs.component"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../material/material.module"
import { CommonModule } from "@angular/common"
import { UploadCustomConfigButtonModule } from "./uploadCustomConfigButton/uploadCustomConfigButton.module"
import { AddCustomConfigButtonModule } from "./addCustomConfigButton/addCustomConfigButton.module"
import { DownloadCustomConfigButtonModule } from "./downloadCustomConfigsButton/downloadCustomConfigButton.module"
import { CustomConfigListComponent } from "./customConfigList/customConfigList.component"
import { CustomConfigItemGroupComponent } from "./customConfigList/customConfigItemGroup/customConfigItemGroup.component"
import { CustomConfig2ApplicableMessage } from "./customConfigList/customConfigItemGroup/customConfig2ApplicableMessage.pipe"
import { CustomConfig2ApplicableColor } from "./customConfigList/customConfigItemGroup/customConfig2ApplicableColor.pipe"

@NgModule({
	imports: [MaterialModule, CommonModule, UploadCustomConfigButtonModule, AddCustomConfigButtonModule, DownloadCustomConfigButtonModule],
	declarations: [
		CustomConfigsComponent,
		CustomConfigListComponent,
		CustomConfigItemGroupComponent,
		CustomConfig2ApplicableMessage,
		CustomConfig2ApplicableColor
	],
	exports: [CustomConfigsComponent],
	entryComponents: [CustomConfigListComponent]
})
export class CustomConfigsModule {}
