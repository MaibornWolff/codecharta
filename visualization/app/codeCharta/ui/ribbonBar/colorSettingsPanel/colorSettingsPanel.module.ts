import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { ColorPickerForMapColorModule } from "../../colorPickerForMapColor/colorPickerForMapColor.module"
import { ResetSettingsButtonModule } from "../../resetSettingsButton/resetSettingsButton.module"
import { ColorSettingsPanelComponent } from "./colorSettingsPanel.component"
import { MetricColorRangeDiagramModule } from "./metricColorRangeDiagram/metricColorRangeDiagram.module"
import { MetricColorRangeSliderModule } from "./metricColorRangeSlider/metricColorRangeSlider.module"

@NgModule({
	imports: [CommonModule, ColorPickerForMapColorModule, MetricColorRangeDiagramModule, MetricColorRangeSliderModule, ResetSettingsButtonModule, MaterialModule],
	declarations: [ColorSettingsPanelComponent],
	exports: [ColorSettingsPanelComponent]
})
export class ColorSettingsPanelModule {}
