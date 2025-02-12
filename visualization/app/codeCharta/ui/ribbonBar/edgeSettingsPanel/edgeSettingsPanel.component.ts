import { Component } from "@angular/core"
import { MatCheckboxChange, MatCheckbox } from "@angular/material/checkbox"
import { Store } from "@ngrx/store"
import { map } from "rxjs"
import { CcState } from "../../../codeCharta.model"
import { setAmountOfEdgePreviews } from "../../../state/store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.actions"
import { amountOfEdgePreviewsSelector } from "../../../state/store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.selector"
import { setEdgeHeight } from "../../../state/store/appSettings/edgeHeight/edgeHeight.actions"
import { edgeHeightSelector } from "../../../state/store/appSettings/edgeHeight/edgeHeight.selector"
import { setShowOnlyBuildingsWithEdges } from "../../../state/store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.actions"
import { showOnlyBuildingsWithEdgesSelector } from "../../../state/store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.selector"
import { amountOfBuildingsWithSelectedEdgeMetricSelector } from "../../../state/selectors/amountOfBuildingsWithSelectedEdgeMetric/amountOfBuildingsWithSelectedEdgeMetric.selector"
import { SliderComponent } from "../../slider/slider.component"
import { ColorPickerForMapColorComponent } from "../../colorPickerForMapColor/colorPickerForMapColor.component"
import { EdgeMetricToggleComponent } from "./edgeMetricToggle/edgeMetricToggle.component"
import { ResetSettingsButtonComponent } from "../../resetSettingsButton/resetSettingsButton.component"
import { AsyncPipe } from "@angular/common"
import { showOutgoingEdgesSelector } from "../../../state/store/appSettings/showEdges/outgoing/showOutgoingEdges.selector"
import { showIncomingEdgesSelector } from "../../../state/store/appSettings/showEdges/incoming/showIncomingEdges.selector"
import { setShowOutgoingEdges } from "../../../state/store/appSettings/showEdges/outgoing/showOutgoingEdges.actions"
import { setShowIncomingEdges } from "../../../state/store/appSettings/showEdges/incoming/showIncomingEdges.actions"

@Component({
    selector: "cc-edge-settings-panel",
    templateUrl: "./edgeSettingsPanel.component.html",
    styleUrls: ["./edgeSettingsPanel.component.scss"],
    standalone: true,
    imports: [
        SliderComponent,
        ColorPickerForMapColorComponent,
        MatCheckbox,
        EdgeMetricToggleComponent,
        ResetSettingsButtonComponent,
        AsyncPipe
    ]
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
    showOutgoingEdges$ = this.store.select(showOutgoingEdgesSelector)
    showIncomingEdges$ = this.store.select(showIncomingEdgesSelector)
    showOnlyBuildingsWithEdges$ = this.store.select(showOnlyBuildingsWithEdgesSelector)

    constructor(private store: Store<CcState>) {}

    applySettingsAmountOfEdgePreviews = (value: number) => {
        this.store.dispatch(setAmountOfEdgePreviews({ value }))
    }

    applySettingsEdgeHeight = (value: number) => {
        this.store.dispatch(setEdgeHeight({ value }))
    }

    applyShowOutgoingEdges(value: boolean) {
        this.store.dispatch(setShowOutgoingEdges({ value }))
    }

    applyShowIncomingEdges(value: boolean) {
        this.store.dispatch(setShowIncomingEdges({ value }))
    }

    applyShowOnlyBuildingsWithEdges(event: MatCheckboxChange) {
        this.store.dispatch(setShowOnlyBuildingsWithEdges({ value: event.checked }))
    }
}
