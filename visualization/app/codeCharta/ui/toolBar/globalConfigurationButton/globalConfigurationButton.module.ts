import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { ResetSettingsButtonModule } from "../../resetSettingsButton/resetSettingsButton.module"
import { GlobalConfigurationButtonComponent } from "./globalConfigurationButton.component"
import { GlobalConfigurationDialogComponent } from "./globalConfigurationDialog/globalConfigurationDialog.component"

@NgModule({
	imports: [MaterialModule, ResetSettingsButtonModule],
	declarations: [GlobalConfigurationButtonComponent, GlobalConfigurationDialogComponent],
	exports: [GlobalConfigurationButtonComponent],
	entryComponents: [GlobalConfigurationButtonComponent, GlobalConfigurationDialogComponent]
})
export class GlobalConfigurationButtonModule {}
