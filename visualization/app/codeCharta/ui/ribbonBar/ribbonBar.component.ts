import { Component, computed } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"
import { Store } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"
import { SearchPanelComponent } from "./searchPanel/searchPanel.component"
import { RibbonBarPanelComponent } from "./ribbonBarPanel/ribbonBarPanel.component"
import { ShowScenariosButtonComponent } from "./showScenariosButton/showScenariosButton.component"
import { CustomConfigsComponent } from "../customConfigs/customConfigs.component"
import { ArtificialIntelligenceComponent } from "./artificialIntelligence/artificialIntelligence.component"
import { AreaMetricChooserComponent } from "./areaMetricChooser/areaMetricChooser.component"
import { RibbonBarPanelSettingsComponent } from "./ribbonBarPanel/ribbonBarPanelSettings.component"
import { AreaSettingsPanelComponent } from "./areaSettingsPanel/areaSettingsPanel.component"
import { HeightMetricChooserComponent } from "./heightMetricChooser/heightMetricChooser.component"
import { HeightSettingsPanelComponent } from "./heightSettingsPanel/heightSettingsPanel.component"
import { LinkColorMetricToHeightMetricButtonComponent } from "./linkColorMetricToHeightMetricButton/linkColorMetricToHeightMetricButton.component"
import { ColorMetricChooserComponent } from "./colorMetricChooser/colorMetricChooser.component"
import { ColorSettingsPanelComponent } from "./colorSettingsPanel/colorSettingsPanel.component"
import { EdgeMetricChooserComponent } from "./edgeMetricChooser/edgeMetricChooser.component"
import { EdgeSettingsPanelComponent } from "./edgeSettingsPanel/edgeSettingsPanel.component"

@Component({
    selector: "cc-ribbon-bar",
    templateUrl: "./ribbonBar.component.html",
    imports: [
        SearchPanelComponent,
        RibbonBarPanelComponent,
        ShowScenariosButtonComponent,
        CustomConfigsComponent,
        ArtificialIntelligenceComponent,
        AreaMetricChooserComponent,
        RibbonBarPanelSettingsComponent,
        AreaSettingsPanelComponent,
        HeightMetricChooserComponent,
        HeightSettingsPanelComponent,
        LinkColorMetricToHeightMetricButtonComponent,
        ColorMetricChooserComponent,
        ColorSettingsPanelComponent,
        EdgeMetricChooserComponent,
        EdgeSettingsPanelComponent
    ]
})
export class RibbonBarComponent {
    isDeltaState = toSignal(this.store.select(isDeltaStateSelector))
    metricData = toSignal(this.store.select(metricDataSelector))
    hasEdgeMetric = computed(() => (this.metricData()?.edgeMetricData.length ?? 0) > 0)

    constructor(private readonly store: Store<CcState>) {}
}
