import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ColorLabelOptions, LabelMode } from "../../../../model/codeCharta.model"
import { ColorCategoryCountsStore } from "../../../../renderer/threeViewer/threeViewer.facade"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import { MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { debounce } from "../../../../util/debounce"
import { parseNumberInput } from "../../../../util/parseNumberInput"
import { LABEL_SIZE_STEP, MAX_LABEL_SIZE, MIN_LABEL_SIZE } from "../../services/label.constants"
import { LabelSettingsWriteStore } from "../../stores/labelSettings.write.store"

@Component({
    selector: "cc-label-settings-panel",
    templateUrl: "./labelSettingsPanel.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    // layout and padding come from the surrounding settings popover shell
    host: { class: "contents" }
})
export class LabelSettingsPanelComponent {
    private static readonly DEBOUNCE_TIME = 400

    private readonly mapStateReadWindow = inject(MapStateReadWindow)
    private readonly fileStoreReadWindow = inject(FileStoreReadWindow)
    private readonly labelSettingsWriteStore = inject(LabelSettingsWriteStore)
    private readonly colorCategoryCountsStore = inject(ColorCategoryCountsStore)

    readonly LabelMode = LabelMode
    readonly MIN_LABEL_SIZE = MIN_LABEL_SIZE
    readonly MAX_LABEL_SIZE = MAX_LABEL_SIZE
    readonly LABEL_SIZE_STEP = LABEL_SIZE_STEP

    readonly resetSettingsKeys = [
        "mapState.amountOfTopLabels",
        "mapState.labelSize",
        "mapState.showMetricLabelNodeName",
        "mapState.showMetricLabelNameValue",
        "mapState.colorLabels",
        "mapState.labelMode",
        "mapState.groupLabelCollisions",
        "mapState.labelsPerMap"
    ]

    readonly amountOfTopLabels = toSignal(this.mapStateReadWindow.amountOfTopLabels$, { requireSync: true })
    readonly labelSize = toSignal(this.mapStateReadWindow.labelSize$, { requireSync: true })
    readonly showMetricLabelNodeName = toSignal(this.mapStateReadWindow.showMetricLabelNodeName$, { requireSync: true })
    readonly showMetricLabelNodeValue = toSignal(this.mapStateReadWindow.showMetricLabelNameValue$, { requireSync: true })
    readonly colorLabels = toSignal(this.mapStateReadWindow.colorLabels$, { requireSync: true })
    readonly mapColors = toSignal(this.mapStateReadWindow.mapColors$, { requireSync: true })
    readonly isDeltaState = toSignal(this.fileStoreReadWindow.isDeltaState$, { requireSync: true })
    readonly labelMode = toSignal(this.mapStateReadWindow.labelMode$, { requireSync: true })
    readonly colorCategoryCounts = toSignal(this.colorCategoryCountsStore.colorCategoryCounts$, { requireSync: true })
    readonly groupLabelCollisions = toSignal(this.mapStateReadWindow.groupLabelCollisions$, { requireSync: true })
    readonly labelsPerMap = toSignal(this.mapStateReadWindow.labelsPerMap$, { requireSync: true })
    readonly areMultipleMapsVisible = toSignal(this.fileStoreReadWindow.areMultipleMapsVisible$, { requireSync: true })

    readonly showColorLabels = computed(() => this.labelMode() === LabelMode.Color && !this.isDeltaState())

    readonly topLabelsTitle = computed(() => {
        const base = `Display the labels of the ${this.amountOfTopLabels()} highest buildings`
        return this.labelsPerMap() && this.areMultipleMapsVisible() ? `${base} per map` : base
    })

    readonly applyDebouncedTopLabels = debounce((amountOfTopLabels: number) => {
        this.labelSettingsWriteStore.setAmountOfTopLabels(amountOfTopLabels)
    }, LabelSettingsPanelComponent.DEBOUNCE_TIME)

    readonly applyDebouncedLabelSize = debounce((labelSize: number) => {
        this.labelSettingsWriteStore.setLabelSize(labelSize)
    }, LabelSettingsPanelComponent.DEBOUNCE_TIME)

    handleTopLabelsInput(event: Event) {
        const value = parseNumberInput(event, 0, 50, { round: true })
        if (Number.isNaN(value)) {
            return
        }
        if (value === this.amountOfTopLabels()) {
            // typed back to the committed value: drop a pending intermediate instead of committing it
            this.applyDebouncedTopLabels.cancel()
            return
        }
        this.applyDebouncedTopLabels(value)
    }

    handleLabelSizeInput(event: Event) {
        const raw = Number.parseFloat((event.target as HTMLInputElement).value)
        if (Number.isNaN(raw)) {
            return
        }
        const clamped = Math.min(MAX_LABEL_SIZE, Math.max(MIN_LABEL_SIZE, raw))
        const snapped = Math.round(clamped / LABEL_SIZE_STEP) * LABEL_SIZE_STEP
        const value = Math.round(snapped * 100) / 100
        if (value === this.labelSize()) {
            this.applyDebouncedLabelSize.cancel()
            return
        }
        this.applyDebouncedLabelSize(value)
    }

    setShowMetricLabelNodeName(event: Event) {
        this.labelSettingsWriteStore.setShowMetricLabelNodeName((event.target as HTMLInputElement).checked)
    }

    setShowMetricLabelNameValue(event: Event) {
        this.labelSettingsWriteStore.setShowMetricLabelNameValue((event.target as HTMLInputElement).checked)
    }

    setColorLabel(event: Event, colorLabelToToggle: keyof ColorLabelOptions) {
        this.labelSettingsWriteStore.setColorLabels({ [colorLabelToToggle]: (event.target as HTMLInputElement).checked })
    }

    setLabelMode(mode: LabelMode) {
        this.labelSettingsWriteStore.setLabelMode(mode)
    }

    setGroupLabelCollisions(event: Event) {
        this.labelSettingsWriteStore.setGroupLabelCollisions((event.target as HTMLInputElement).checked)
    }

    setLabelsPerMap(value: boolean) {
        this.labelSettingsWriteStore.setLabelsPerMap(value)
    }

    resetSettings() {
        this.labelSettingsWriteStore.resetSettings(this.resetSettingsKeys)
    }
}
