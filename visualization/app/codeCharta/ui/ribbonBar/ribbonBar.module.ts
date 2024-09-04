import { NgModule } from "@angular/core"
import { RibbonBarComponent } from "./ribbonBar.component"
import { AreaMetricChooserModule } from "./areaMetricChooser/areaMetricChooser.module"
import { HeightMetricChooserModule } from "./heightMetricChooser/heightMetricChooser.module"
import { ColorMetricChooserModule } from "./colorMetricChooser/colorMetricChooser.module"
import { EdgeMetricChooserModule } from "./edgeMetricChooser/edgeMetricChooser.module"
import { ShowScenariosButtonModule } from "./showScenariosButton/showScenariosButton.module"
import { EdgeSettingsPanelModule } from "./edgeSettingsPanel/edgeSettingsPanel.module"
import { ArtificialIntelligenceModule } from "./artificialIntelligence/artificialIntelligence.module"
import { AreaSettingsPanelModule } from "./areaSettingsPanel/areaSettingsPanel.module"
import { CustomConfigsModule } from "../customConfigs/customConfigs.module"
import { HeightSettingsPanelModule } from "./heightSettingsPanel/heightSettingsPanel.module"
import { ColorSettingsPanelModule } from "./colorSettingsPanel/colorSettingsPanel.module"
import { CommonModule } from "@angular/common"
import { MaterialModule } from "../../../material/material.module"
import { LinkColorMetricToHeightMetricButtonModule } from "./linkColorMetricToHeightMetricButton/linkColorMetricToHeightMetricButton.module"
import { SearchPanelModule } from "./searchPanel/searchPanel.module"
import { RibbonBarPanelModule } from "./ribbonBarPanel/ribbonBarPanel.module"

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        SearchPanelModule,
        ShowScenariosButtonModule,
        CustomConfigsModule,
        ArtificialIntelligenceModule,
        AreaMetricChooserModule,
        AreaSettingsPanelModule,
        HeightSettingsPanelModule,
        HeightMetricChooserModule,
        LinkColorMetricToHeightMetricButtonModule,
        ColorMetricChooserModule,
        ColorSettingsPanelModule,
        EdgeMetricChooserModule,
        EdgeSettingsPanelModule,
        RibbonBarPanelModule
    ],
    declarations: [RibbonBarComponent],
    exports: [RibbonBarComponent]
})
export class RibbonBarModule {}
