import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { Export3DMapButtonComponent } from "./export3DMapButton.component"
import { ActionIconModule } from "../actionIcon/actionIcon.module"
import { HttpClientModule } from "@angular/common/http"
import { MaterialModule } from "../../../material/material.module"
import { Export3DMapDialogComponent } from "./export3DMapDialog/export3DMapDialog.component"
import { DisplayQualitySelectionModule } from "../toolBar/globalConfigurationButton/globalConfigurationDialog/displayQualitySelection/displayQualitySelection.module"
import { MapLayoutSelectionModule } from "../toolBar/globalConfigurationButton/globalConfigurationDialog/mapLayoutSelection/mapLayoutSelection.module"
import { ResetSettingsButtonModule } from "../resetSettingsButton/resetSettingsButton.module"

@NgModule({
	imports: [
		CommonModule,
		ActionIconModule,
		HttpClientModule,
		MaterialModule,
		DisplayQualitySelectionModule,
		MapLayoutSelectionModule,
		ResetSettingsButtonModule
	],
	declarations: [Export3DMapButtonComponent, Export3DMapDialogComponent],
	exports: [Export3DMapButtonComponent]
})
export class Export3DMapButtonModule {}
