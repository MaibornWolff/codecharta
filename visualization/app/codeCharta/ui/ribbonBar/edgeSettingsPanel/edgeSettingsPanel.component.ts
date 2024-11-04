import { Component } from "@angular/core"
import { MatCheckboxChange } from "@angular/material/checkbox"
import { Store } from "@ngrx/store"
import { map } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { setAmountOfEdgePreviews } from "../../../state/store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.actions"
import { amountOfEdgePreviewsSelector } from "../../../state/store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.selector"
import { setEdgeHeight } from "../../../state/store/appSettings/edgeHeight/edgeHeight.actions"
import { edgeHeightSelector } from "../../../state/store/appSettings/edgeHeight/edgeHeight.selector"
import { setShowOnlyBuildingsWithEdges } from "../../../state/store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.actions"
import { showOnlyBuildingsWithEdgesSelector } from "../../../state/store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.selector"
import { amountOfBuildingsWithSelectedEdgeMetricSelector } from "./selectors/amountOfBuildingsWithSelectedEdgeMetric.selector"

@Component({
    selector: "cc-edge-settings-panel",
    templateUrl: "./edgeSettingsPanel.component.html"
})
export class EdgeSettingsPanelComponent {
    amountOfBuildingsWithSelectedEdgeMetric$ = this.store.select(amountOfBuildingsWithSelectedEdgeMetricSelector)
    edgePreviewLabel$ = this.amountOfBuildingsWithSelectedEdgeMetric$.pipe(
        map(
            amountOfBuildingsWithSelectedEdge =>
                `Preview the edges of up to ${amountOfBuildingsWithSelectedEdge} buildings with the highest amount of incoming and outgoing edges`
        )
    )
    amountOfEdgePreviews$ = this.store.select(amountOfEdgePreviewsSelector)
    edgeHeight$ = this.store.select(edgeHeightSelector)
    showOnlyBuildingsWithEdges$ = this.store.select(showOnlyBuildingsWithEdgesSelector)

    constructor(private store: Store<CcState>) {}

    applySettingsAmountOfEdgePreviews = (value: number) => {
        this.store.dispatch(setAmountOfEdgePreviews({ value }))
    }

    applySettingsEdgeHeight = (value: number) => {
        this.store.dispatch(setEdgeHeight({ value }))
    }

    applyShowOnlyBuildingsWithEdges(event: MatCheckboxChange) {
        this.store.dispatch(setShowOnlyBuildingsWithEdges({ value: event.checked }))
    }
}
