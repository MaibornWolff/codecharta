import { NgModule } from "@angular/core"
import { CommonModule } from "@angular/common"

import { LegendMarkedPackagesModule } from "./legendMarkedPackages/legendMarkedPackages.module"
import { LegendPanelComponent } from "./legendPanel.component"
import { MaterialModule } from "../../../material/material.module"
import { LegendBlockComponent } from "./legendBlock/legendBlock.component"
import { ColorPickerForMapColorModule } from "../colorPickerForMapColor/colorPickerForMapColor.module"
import { SimplePipesModule } from "../../util/simplePipes/SimplePipesModule"

@NgModule({
	declarations: [LegendPanelComponent, LegendBlockComponent],
	exports: [LegendPanelComponent],
	imports: [CommonModule, MaterialModule, LegendMarkedPackagesModule, ColorPickerForMapColorModule, SimplePipesModule]
})
export class LegendPanelModule {}
