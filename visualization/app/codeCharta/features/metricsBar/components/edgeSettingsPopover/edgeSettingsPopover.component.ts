import { ChangeDetectionStrategy, Component, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { map } from "rxjs"
import { CcState } from "../../../../codeCharta.model"
import { amountOfBuildingsWithSelectedEdgeMetricSelector } from "../../../../state/selectors/amountOfBuildingsWithSelectedEdgeMetric/amountOfBuildingsWithSelectedEdgeMetric.selector"
import { setAmountOfEdgePreviews } from "../../../../state/store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.actions"
import { amountOfEdgePreviewsSelector } from "../../../../state/store/appSettings/amountOfEdgePreviews/amountOfEdgePreviews.selector"
import { setEdgeHeight } from "../../../../state/store/appSettings/edgeHeight/edgeHeight.actions"
import { edgeHeightSelector } from "../../../../state/store/appSettings/edgeHeight/edgeHeight.selector"
import { setShowIncomingEdges } from "../../../../state/store/appSettings/showEdges/incoming/showIncomingEdges.actions"
import { showIncomingEdgesSelector } from "../../../../state/store/appSettings/showEdges/incoming/showIncomingEdges.selector"
import { setShowOutgoingEdges } from "../../../../state/store/appSettings/showEdges/outgoing/showOutgoingEdges.actions"
import { showOutgoingEdgesSelector } from "../../../../state/store/appSettings/showEdges/outgoing/showOutgoingEdges.selector"
import { setShowOnlyBuildingsWithEdges } from "../../../../state/store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.actions"
import { showOnlyBuildingsWithEdgesSelector } from "../../../../state/store/appSettings/showOnlyBuildingsWithEdges/showOnlyBuildingsWithEdges.selector"
import { ColorPickerForMapColorComponent } from "../../../../ui/colorPickerForMapColor/colorPickerForMapColor.component"
import { ResetSettingsButtonComponent } from "../../../../ui/resetSettingsButton/resetSettingsButton.component"
import { parseNumberInput } from "../../../../util/parseNumberInput"
import { EdgeMetricToggleComponent } from "./edgeMetricToggle.component"
import { SettingsPopoverShellComponent } from "../settingsPopoverShell/settingsPopoverShell.component"

@Component({
    selector: "cc-edge-settings-popover",
    templateUrl: "./edgeSettingsPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [ColorPickerForMapColorComponent, ResetSettingsButtonComponent, EdgeMetricToggleComponent, SettingsPopoverShellComponent]
})
export class EdgeSettingsPopoverComponent {
    private readonly store = inject(Store<CcState>)

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    readonly amountOfBuildingsWithSelectedEdgeMetric = toSignal(this.store.select(amountOfBuildingsWithSelectedEdgeMetricSelector), {
        initialValue: 0
    })
    readonly edgePreviewLabel = toSignal(
        this.store
            .select(amountOfBuildingsWithSelectedEdgeMetricSelector)
            .pipe(map(amount => `Preview the edges of up to ${amount} buildings with the highest amount of incoming and outgoing edges`)),
        { initialValue: "" }
    )
    readonly amountOfEdgePreviews = toSignal(this.store.select(amountOfEdgePreviewsSelector), { initialValue: 0 })
    readonly edgeHeight = toSignal(this.store.select(edgeHeightSelector), { initialValue: 1 })
    readonly showOutgoingEdges = toSignal(this.store.select(showOutgoingEdgesSelector), { initialValue: false })
    readonly showIncomingEdges = toSignal(this.store.select(showIncomingEdgesSelector), { initialValue: false })
    readonly showOnlyBuildingsWithEdges = toSignal(this.store.select(showOnlyBuildingsWithEdgesSelector), { initialValue: false })

    readonly resetKeys = [
        "appSettings.amountOfEdgePreviews",
        "appSettings.edgeHeight",
        "appSettings.mapColors.outgoingEdge",
        "appSettings.showOutgoingEdges",
        "appSettings.mapColors.incomingEdge",
        "appSettings.showIncomingEdges",
        "appSettings.showOnlyBuildingsWithEdges",
        "appSettings.isEdgeMetricVisible"
    ]

    handleAmountOfEdgePreviewsInput(event: Event) {
        const value = parseNumberInput(event, 0, this.amountOfBuildingsWithSelectedEdgeMetric())
        if (Number.isNaN(value) || value === this.amountOfEdgePreviews()) {
            return
        }
        this.store.dispatch(setAmountOfEdgePreviews({ value }))
    }

    handleEdgeHeightInput(event: Event) {
        const value = parseNumberInput(event, 1, 9)
        if (Number.isNaN(value) || value === this.edgeHeight()) {
            return
        }
        this.store.dispatch(setEdgeHeight({ value }))
    }

    setShowOutgoingEdges(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.store.dispatch(setShowOutgoingEdges({ value: checked }))
    }

    setShowIncomingEdges(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.store.dispatch(setShowIncomingEdges({ value: checked }))
    }

    setShowOnlyBuildingsWithEdges(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.store.dispatch(setShowOnlyBuildingsWithEdges({ value: checked }))
    }
}
