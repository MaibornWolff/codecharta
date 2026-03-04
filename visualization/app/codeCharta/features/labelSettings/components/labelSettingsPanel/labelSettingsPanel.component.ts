import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ColorLabelOptions, LabelMode } from "../../../../codeCharta.model"
import { LabelModeService } from "../../services/labelMode.service"
import { AmountOfTopLabelsService } from "../../services/amountOfTopLabels.service"
import { ShowMetricLabelNodeNameService } from "../../services/showMetricLabelNodeName.service"
import { ShowMetricLabelNameValueService } from "../../services/showMetricLabelNameValue.service"
import { ColorLabelsService } from "../../services/colorLabels.service"
import { GroupLabelCollisionsService } from "../../services/groupLabelCollisions.service"
import { StateAccessStore } from "../../stores/stateAccess.store"
import { CodeMapRenderService } from "../../../../ui/codeMap/codeMap.render.service"
import { debounce } from "../../../../util/debounce"
import { parseNumberInput } from "../../../../util/parseNumberInput"

@Component({
    selector: "cc-label-settings-panel",
    templateUrl: "./labelSettingsPanel.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "flex flex-col gap-2.5 py-2 px-5" }
})
export class LabelSettingsPanelComponent {
    private static readonly DEBOUNCE_TIME = 400

    private readonly labelModeService = inject(LabelModeService)
    private readonly amountOfTopLabelsService = inject(AmountOfTopLabelsService)
    private readonly showMetricLabelNodeNameService = inject(ShowMetricLabelNodeNameService)
    private readonly showMetricLabelNameValueService = inject(ShowMetricLabelNameValueService)
    private readonly colorLabelsService = inject(ColorLabelsService)
    private readonly groupLabelCollisionsService = inject(GroupLabelCollisionsService)
    private readonly stateAccessStore = inject(StateAccessStore)
    private readonly codeMapRenderService = inject(CodeMapRenderService)

    readonly LabelMode = LabelMode

    readonly resetSettingsKeys = [
        "appSettings.amountOfTopLabels",
        "appSettings.showMetricLabelNodeName",
        "appSettings.showMetricLabelNameValue",
        "appSettings.colorLabels",
        "appSettings.labelMode",
        "appSettings.groupLabelCollisions"
    ]

    readonly amountOfTopLabels = toSignal(this.amountOfTopLabelsService.amountOfTopLabels$(), { requireSync: true })
    readonly showMetricLabelNodeName = toSignal(this.showMetricLabelNodeNameService.showMetricLabelNodeName$(), { requireSync: true })
    readonly showMetricLabelNodeValue = toSignal(this.showMetricLabelNameValueService.showMetricLabelNameValue$(), { requireSync: true })
    readonly colorLabels = toSignal(this.colorLabelsService.colorLabels$(), { requireSync: true })
    readonly mapColors = toSignal(this.stateAccessStore.mapColors$, { requireSync: true })
    readonly isDeltaState = toSignal(this.stateAccessStore.isDeltaState$, { requireSync: true })
    readonly labelMode = toSignal(this.labelModeService.labelMode$(), { requireSync: true })
    readonly colorCategoryCounts = toSignal(this.codeMapRenderService.colorCategoryCounts$, { requireSync: true })
    readonly groupLabelCollisions = toSignal(this.groupLabelCollisionsService.groupLabelCollisions$(), { requireSync: true })

    readonly showColorLabels = computed(() => this.labelMode() === LabelMode.Color && !this.isDeltaState())

    readonly applyDebouncedTopLabels = debounce((amountOfTopLabels: number) => {
        this.amountOfTopLabelsService.setAmountOfTopLabels(amountOfTopLabels)
    }, LabelSettingsPanelComponent.DEBOUNCE_TIME)

    handleTopLabelsInput(event: Event) {
        const value = parseNumberInput(event, 0, 50)
        if (!Number.isNaN(value) && value !== this.amountOfTopLabels()) {
            this.applyDebouncedTopLabels(value)
        }
    }

    setShowMetricLabelNodeName(event: Event) {
        this.showMetricLabelNodeNameService.setShowMetricLabelNodeName((event.target as HTMLInputElement).checked)
    }

    setShowMetricLabelNameValue(event: Event) {
        this.showMetricLabelNameValueService.setShowMetricLabelNameValue((event.target as HTMLInputElement).checked)
    }

    setColorLabel(event: Event, colorLabelToToggle: keyof ColorLabelOptions) {
        this.colorLabelsService.setColorLabels({ [colorLabelToToggle]: (event.target as HTMLInputElement).checked })
    }

    setLabelMode(mode: LabelMode) {
        this.labelModeService.setLabelMode(mode)
    }

    setGroupLabelCollisions(event: Event) {
        this.groupLabelCollisionsService.setGroupLabelCollisions((event.target as HTMLInputElement).checked)
    }

    resetSettings() {
        this.stateAccessStore.resetSettings(this.resetSettingsKeys)
    }
}
