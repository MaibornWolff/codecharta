import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { ColorPickerForMapColorModule } from "../../colorPickerForMapColor/colorPickerForMapColor.module"
import { ResetSettingsButtonModule } from "../../resetSettingsButton/resetSettingsButton.module"
import { SliderModule } from "../../slider/slider.module"
import { EdgeMetricToggleComponent } from "./edgeMetricToggle/edgeMetricToggle.component"
import { EdgeSettingsPanelComponent } from "./edgeSettingsPanel.component"

@NgModule({
	imports: [CommonModule, ResetSettingsButtonModule, SliderModule, MaterialModule, ColorPickerForMapColorModule],
	declarations: [EdgeSettingsPanelComponent, EdgeMetricToggleComponent],
	exports: [EdgeSettingsPanelComponent]
})
export class EdgeSettingsPanelModule {}
