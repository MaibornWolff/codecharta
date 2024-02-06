import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { ColorPickerForMapColorModule } from "../../colorPickerForMapColor/colorPickerForMapColor.module"
import { ResetSettingsButtonModule } from "../../resetSettingsButton/resetSettingsButton.module"
import { ColorSettingsPanelComponent } from "./colorSettingsPanel.component"
import { MetricColorRangeSliderModule } from "./metricColorRangeSlider/metricColorRangeSlider.module"
import { MetricColorRangeHistogramComponent } from "./metric-color-range-histogram/metric-color-range-histogram.component"

@NgModule({
	imports: [CommonModule, ColorPickerForMapColorModule, MetricColorRangeSliderModule, ResetSettingsButtonModule, MaterialModule],
	declarations: [ColorSettingsPanelComponent, MetricColorRangeHistogramComponent],
	exports: [ColorSettingsPanelComponent]
})
export class ColorSettingsPanelModule {}
