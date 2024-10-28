import { NgModule } from "@angular/core"
import { RibbonBarComponent } from "./ribbonBar.component"
import { AreaMetricChooserModule } from "./areaMetricChooser/areaMetricChooser.module"
import { HeightMetricChooserModule } from "./heightMetricChooser/heightMetricChooser.module"
import { ColorMetricChooserModule } from "./colorMetricChooser/colorMetricChooser.module"
import { EdgeMetricChooserModule } from "./edgeMetricChooser/edgeMetricChooser.module"
import { ShowScenariosButtonModule } from "./showScenariosButton/showScenariosButton.module"

import { CustomConfigsModule } from "../customConfigs/customConfigs.module"

import { CommonModule } from "@angular/common"

@NgModule({
    imports: [
        CommonModule,
        ShowScenariosButtonModule,
        CustomConfigsModule,
        AreaMetricChooserModule,
        HeightMetricChooserModule,
        ColorMetricChooserModule,
        EdgeMetricChooserModule,
        RibbonBarComponent
    ],
    exports: [RibbonBarComponent]
})
export class RibbonBarModule {}
