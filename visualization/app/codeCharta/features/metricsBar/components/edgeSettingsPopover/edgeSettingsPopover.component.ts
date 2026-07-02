import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { map } from "rxjs"
import { HexMapColor } from "../../../../codeCharta.model"
import { defaultMapColors } from "../../../../mapState/mapState.facade"
import { InlineColorPickerComponent } from "../../../shared/components/inlineColorPicker/inlineColorPicker.component"
import { ResetSettingsButtonComponent } from "../../../../features/shared/components/resetSettingsButton/resetSettingsButton.component"
import { AmountOfBuildingsWithSelectedEdgeMetricService } from "../../services/amountOfBuildingsWithSelectedEdgeMetric.service"
import { AmountOfEdgePreviewsService } from "../../services/amountOfEdgePreviews.service"
import { EdgeHeightService } from "../../services/edgeHeight.service"
import { MapColorsService } from "../../services/mapColors.service"
import { ShowIncomingEdgesService } from "../../services/showIncomingEdges.service"
import { ShowOnlyBuildingsWithEdgesService } from "../../services/showOnlyBuildingsWithEdges.service"
import { ShowOutgoingEdgesService } from "../../services/showOutgoingEdges.service"
import { EdgeMetricToggleComponent } from "./edgeMetricToggle.component"
import { SettingsPopoverShellComponent } from "../settingsPopoverShell/settingsPopoverShell.component"
import { SliderNumberInputComponent } from "../sliderNumberInput/sliderNumberInput.component"

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
    private readonly amountOfBuildingsWithSelectedEdgeMetricService = inject(AmountOfBuildingsWithSelectedEdgeMetricService)
    private readonly amountOfEdgePreviewsService = inject(AmountOfEdgePreviewsService)
    private readonly edgeHeightService = inject(EdgeHeightService)
    private readonly showOutgoingEdgesService = inject(ShowOutgoingEdgesService)
    private readonly showIncomingEdgesService = inject(ShowIncomingEdgesService)
    private readonly showOnlyBuildingsWithEdgesService = inject(ShowOnlyBuildingsWithEdgesService)
    private readonly mapColorsService = inject(MapColorsService)

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    readonly amountOfBuildingsWithSelectedEdgeMetric = toSignal(
        this.amountOfBuildingsWithSelectedEdgeMetricService.amountOfBuildingsWithSelectedEdgeMetric$(),
        {
            initialValue: 0
        }
    )
    readonly edgePreviewLabel = toSignal(
        this.amountOfBuildingsWithSelectedEdgeMetricService
            .amountOfBuildingsWithSelectedEdgeMetric$()
            .pipe(map(amount => `Preview the edges of up to ${amount} buildings with the highest amount of incoming and outgoing edges`)),
        { initialValue: "" }
    )
    readonly amountOfEdgePreviews = toSignal(this.amountOfEdgePreviewsService.amountOfEdgePreviews$(), { initialValue: 0 })
    readonly edgeHeight = toSignal(this.edgeHeightService.edgeHeight$(), { initialValue: 1 })
    readonly showOutgoingEdges = toSignal(this.showOutgoingEdgesService.showOutgoingEdges$(), { initialValue: false })
    readonly showIncomingEdges = toSignal(this.showIncomingEdgesService.showIncomingEdges$(), { initialValue: false })
    readonly showOnlyBuildingsWithEdges = toSignal(this.showOnlyBuildingsWithEdgesService.showOnlyBuildingsWithEdges$(), {
        initialValue: false
    })

    private readonly mapColors = toSignal(this.mapColorsService.mapColors$(), { initialValue: defaultMapColors })
    readonly outgoingEdgeColor = computed(() => this.mapColors().outgoingEdge as string)
    readonly incomingEdgeColor = computed(() => this.mapColors().incomingEdge as string)

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

    setAmountOfEdgePreviews(value: number) {
        this.amountOfEdgePreviewsService.setAmountOfEdgePreviews(value)
    }

    setEdgeHeight(value: number) {
        this.edgeHeightService.setEdgeHeight(value)
    }

    setShowOutgoingEdges(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.showOutgoingEdgesService.setShowOutgoingEdges(checked)
    }

    setShowIncomingEdges(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.showIncomingEdgesService.setShowIncomingEdges(checked)
    }

    setShowOnlyBuildingsWithEdges(event: Event) {
        const checked = (event.target as HTMLInputElement).checked
        this.showOnlyBuildingsWithEdgesService.setShowOnlyBuildingsWithEdges(checked)
    }

    setMapColor(mapColorFor: HexMapColor, newHexColor: string) {
        this.mapColorsService.setMapColors({ [mapColorFor]: newHexColor })
    }
}
