import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MaterialModule } from "../../../../material/material.module"
import { AreaSettingsPanelComponent } from "./areaSettingsPanel.component"
import { InvertAreaOptionComponent } from "./invertAreaOption/invertAreaOption.component"
import { SliderModule } from "../../slider/slider.module"
import { ResetSettingsButtonModule } from "../../resetSettingsButton/resetSettingsButton.module"

@NgModule({
	imports: [CommonModule, MaterialModule, SliderModule, ResetSettingsButtonModule],
	declarations: [AreaSettingsPanelComponent, InvertAreaOptionComponent],
	exports: [AreaSettingsPanelComponent]
})
export class AreaSettingsPanelModule {}
