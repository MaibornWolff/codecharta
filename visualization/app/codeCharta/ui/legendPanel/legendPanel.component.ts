import { isDeltaStateSelector } from "../../state/selectors/isDeltaState.selector"
import { IsAttributeSideBarVisibleService } from "../../services/isAttributeSideBarVisible.service"
import { Store } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"
import { heightMetricSelector } from "../../state/store/dynamicSettings/heightMetric/heightMetric.selector"
import { areaMetricSelector } from "../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { colorMetricSelector } from "../../state/store/dynamicSettings/colorMetric/colorMetric.selector"
import { edgeMetricSelector } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"
import { Component } from "@angular/core"

@Component({
    selector: "cc-legend-panel",
    templateUrl: "./legendPanel.component.html",
    styleUrls: ["./legendPanel.component.scss"]
})
export class LegendPanelComponent {
    isLegendVisible = false
    isDeltaState$ = this.store.select(isDeltaStateSelector)
    heightMetric$ = this.store.select(heightMetricSelector)
    areaMetric$ = this.store.select(areaMetricSelector)
    colorMetric$ = this.store.select(colorMetricSelector)
    edgeMetric$ = this.store.select(edgeMetricSelector)

    constructor(
        private store: Store<CcState>,
        public isAttributeSideBarVisibleService: IsAttributeSideBarVisibleService
    ) {}

    toggleIsLegendVisible() {
        this.isLegendVisible = !this.isLegendVisible
    }
}
