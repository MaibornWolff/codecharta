import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { map } from "rxjs"
import { HexMapColor } from "../../../../model/codeCharta.model"
import { defaultMapColors, MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { InlineColorPickerComponent, ResetSettingsButtonComponent } from "../../../shared/facade"
import { MetricsBarReadStore } from "../../stores/metricsBar.read.store"
import { MetricsBarWriteStore } from "../../stores/metricsBar.write.store"
import { SettingsPopoverShellComponent } from "../settingsPopoverShell/settingsPopoverShell.component"
import { SliderNumberInputComponent } from "../sliderNumberInput/sliderNumberInput.component"
import { EdgeMetricToggleComponent } from "./edgeMetricToggle.component"

@Component({
    selector: "cc-edge-settings-popover",
    templateUrl: "./edgeSettingsPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [
        InlineColorPickerComponent,
        ResetSettingsButtonComponent,
        EdgeMetricToggleComponent,
        SettingsPopoverShellComponent,
        SliderNumberInputComponent
    ]
})
export class EdgeSettingsPopoverComponent {
    private readonly mapStateReadWindow = inject(MapStateReadWindow)
    private readonly metricsBarReadStore = inject(MetricsBarReadStore)
    private readonly metricsBarWriteStore = inject(MetricsBarWriteStore)

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    readonly amountOfBuildingsWithSelectedEdgeMetric = toSignal(this.metricsBarReadStore.amountOfBuildingsWithSelectedEdgeMetric$, {
        initialValue: 0
    })
    readonly edgePreviewLabel = toSignal(
        this.metricsBarReadStore.amountOfBuildingsWithSelectedEdgeMetric$.pipe(
            map(amount => `Preview the edges of up to ${amount} buildings with the highest amount of incoming and outgoing edges`)
        ),
        { initialValue: "" }
    )
    readonly amountOfEdgePreviews = toSignal(this.mapStateReadWindow.amountOfEdgePreviews$, { initialValue: 0 })
    readonly edgeHeight = toSignal(this.mapStateReadWindow.edgeHeight$, { initialValue: 1 })
    readonly showOutgoingEdges = toSignal(this.mapStateReadWindow.showOutgoingEdges$, { initialValue: false })
    readonly showIncomingEdges = toSignal(this.mapStateReadWindow.showIncomingEdges$, { initialValue: false })
    readonly showOnlyBuildingsWithEdges = toSignal(this.mapStateReadWindow.showOnlyBuildingsWithEdges$, {
        initialValue: false
    })

    private readonly mapColors = toSignal(this.mapStateReadWindow.mapColors$, { initialValue: defaultMapColors })
    readonly outgoingEdgeColor = computed(() => this.mapColors().outgoingEdge as string)
    readonly incomingEdgeColor = computed(() => this.mapColors().incomingEdge as string)

    readonly resetKeys = [
        "mapState.amountOfEdgePreviews",
        "mapState.edgeHeight",
        "mapState.mapColors.outgoingEdge",
        "mapState.showOutgoingEdges",
        "mapState.mapColors.incomingEdge",
        "mapState.showIncomingEdges",
        "mapState.showOnlyBuildingsWithEdges",
        "mapState.isEdgeMetricVisible"
    ]

    setAmountOfEdgePreviews(value: number) {
        this.metricsBarWriteStore.setAmountOfEdgePreviews(value)
    }

    setEdgeHeight(value: number) {
        this.metricsBarWriteStore.setEdgeHeight(value)
    }

    setShowOutgoingEdges(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.metricsBarWriteStore.setShowOutgoingEdges(checked)
    }

    setShowIncomingEdges(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.metricsBarWriteStore.setShowIncomingEdges(checked)
    }

    setShowOnlyBuildingsWithEdges(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.metricsBarWriteStore.setShowOnlyBuildingsWithEdges(checked)
    }

    setMapColor(mapColorFor: HexMapColor, newHexColor: string) {
        this.metricsBarWriteStore.setMapColors({ [mapColorFor]: newHexColor })
    }
}
