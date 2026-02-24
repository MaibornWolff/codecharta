import { Component } from "@angular/core"
import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"
import { map } from "rxjs"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"
import { Store } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"
import { SearchPanelComponent } from "./searchPanel/searchPanel.component"
import { RibbonBarPanelComponent } from "./ribbonBarPanel/ribbonBarPanel.component"
import { ScenariosPanelComponent } from "../../features/scenarios/components/scenariosPanel/scenariosPanel.component"
import { AreaMetricChooserComponent } from "./areaMetricChooser/areaMetricChooser.component"
import { RibbonBarPanelSettingsComponent } from "./ribbonBarPanel/ribbonBarPanelSettings.component"
import { AreaSettingsPanelComponent } from "./areaSettingsPanel/areaSettingsPanel.component"
import { HeightMetricChooserComponent } from "./heightMetricChooser/heightMetricChooser.component"
import { HeightSettingsPanelComponent } from "./heightSettingsPanel/heightSettingsPanel.component"
import { LabelSettingsComponent } from "./labelSettingsPanel/labelSettings.component"
import { MatCard } from "@angular/material/card"
import { LinkColorMetricToHeightMetricButtonComponent } from "./linkColorMetricToHeightMetricButton/linkColorMetricToHeightMetricButton.component"
import { ColorMetricChooserComponent } from "./colorMetricChooser/colorMetricChooser.component"
import { ColorSettingsPanelComponent } from "./colorSettingsPanel/colorSettingsPanel.component"
import { EdgeMetricChooserComponent } from "./edgeMetricChooser/edgeMetricChooser.component"
import { EdgeSettingsPanelComponent } from "./edgeSettingsPanel/edgeSettingsPanel.component"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-ribbon-bar",
    templateUrl: "./ribbonBar.component.html",
    styleUrls: ["./ribbonBar.component.scss"],
    imports: [
        SearchPanelComponent,
        RibbonBarPanelComponent,
        ScenariosPanelComponent,
        AreaMetricChooserComponent,
        RibbonBarPanelSettingsComponent,
        AreaSettingsPanelComponent,
        HeightMetricChooserComponent,
        HeightSettingsPanelComponent,
        LabelSettingsComponent,
        MatCard,
        LinkColorMetricToHeightMetricButtonComponent,
        ColorMetricChooserComponent,
        ColorSettingsPanelComponent,
        EdgeMetricChooserComponent,
        EdgeSettingsPanelComponent,
        AsyncPipe
    ]
})
export class RibbonBarComponent {
    isDeltaState$ = this.store.select(isDeltaStateSelector)
    hasEdgeMetric$ = this.store.select(metricDataSelector).pipe(map(metricData => metricData.edgeMetricData.length > 0))

    constructor(private readonly store: Store<CcState>) {}
}
