import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { ResetSettingsButtonModule } from "../../resetSettingsButton/resetSettingsButton.module"
import { GlobalConfigurationButtonComponent } from "./globalConfigurationButton.component"
import { GlobalConfigurationDialogComponent } from "./globalConfigurationDialog/globalConfigurationDialog.component"
import { MapLayoutSelectionModule } from "./globalConfigurationDialog/mapLayoutSelection/mapLayoutSelection.module"

@NgModule({
	imports: [MaterialModule, ResetSettingsButtonModule, MapLayoutSelectionModule],
	declarations: [GlobalConfigurationButtonComponent, GlobalConfigurationDialogComponent],
	exports: [GlobalConfigurationButtonComponent],
	entryComponents: [GlobalConfigurationButtonComponent, GlobalConfigurationDialogComponent]
})
export class GlobalConfigurationButtonModule {}
