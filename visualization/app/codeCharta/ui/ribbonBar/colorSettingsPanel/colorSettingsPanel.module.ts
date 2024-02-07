import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { ColorPickerForMapColorModule } from "../../colorPickerForMapColor/colorPickerForMapColor.module"
import { ResetSettingsButtonModule } from "../../resetSettingsButton/resetSettingsButton.module"
import { ColorSettingsPanelComponent } from "./colorSettingsPanel.component"
import { MetricColorRangeHistogramModule } from "./metricColorRangeHistogram/metricColorRangeHistogram.module"

@NgModule({
	imports: [CommonModule, ColorPickerForMapColorModule, MetricColorRangeHistogramModule, ResetSettingsButtonModule, MaterialModule],
	declarations: [ColorSettingsPanelComponent],
	exports: [ColorSettingsPanelComponent]
})
export class ColorSettingsPanelModule {}
