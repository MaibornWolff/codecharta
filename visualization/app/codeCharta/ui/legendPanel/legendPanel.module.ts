import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"

import { LegendMarkedPackagesModule } from "./legendMarkedPackages/legendMarkedPackages.module"
import { LegendPanelComponent } from "./legendPanel.component"
import { MaterialModule } from "../../../material/material.module"
import { LegendBlockComponent } from "./legendBlock/legendBlock.component"
import { ColorPickerForMapColorModule } from "../colorPickerForMapColor/colorPickerForMapColor.module"
import { AttributeDescriptorTooltipPipeModule } from "../../util/pipes/AttributeDescriptorTooltipPipeModule"
import { LegendScreenshotButtonComponent } from "./legendScreenshotButton/legendScreenshotButton.component"

@NgModule({
	declarations: [LegendPanelComponent, LegendBlockComponent, LegendScreenshotButtonComponent],
	exports: [LegendPanelComponent],
	imports: [CommonModule, MaterialModule, LegendMarkedPackagesModule, ColorPickerForMapColorModule, AttributeDescriptorTooltipPipeModule]
})
export class LegendPanelModule {}
