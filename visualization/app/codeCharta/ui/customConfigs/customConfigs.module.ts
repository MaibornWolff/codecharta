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
import { ApplyCustomConfigButtonComponent } from "./customConfigList/customConfigItemGroup/customConfigDescription/applyCustomConfigButton.component"
import { CustomConfigColorSchemaBySelectionMode } from "./customConfigList/customConfigItemGroup/customConfigDescription/customConfigColorSchemaBySelectionMode.pipe"
import { FormsModule } from "@angular/forms"
import { CustomConfigNoteDialogButtonModule } from "./customConfigNoteDialogButton/customConfigNoteDialogButton.module"
import { TruncateTextPipe } from "../../util/truncateText.pipe"

@NgModule({
	imports: [
		MaterialModule,
		CommonModule,
		CustomConfigNoteDialogButtonModule,
		UploadCustomConfigButtonModule,
		AddCustomConfigButtonModule,
		DownloadCustomConfigButtonModule,
		FormsModule
	],
	declarations: [
		CustomConfigsComponent,
		CustomConfigListComponent,
		CustomConfigItemGroupComponent,
		ApplyCustomConfigButtonComponent,
		CustomConfig2ApplicableMessage,
		CustomConfig2ApplicableColor,
		TruncateTextPipe,
		CustomConfigColorSchemaBySelectionMode
	],
	exports: [CustomConfigsComponent]
})
export class CustomConfigsModule {}
