import { Component } from "@angular/core"
import { MatCheckboxChange, MatCheckbox } from "@angular/material/checkbox"
import { Store } from "@ngrx/store"
import { CcState, ColorLabelOptions, LabelMode } from "../../../codeCharta.model"
import { amountOfTopLabelsSelector } from "../../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.selector"
import { setAmountOfTopLabels } from "../../../state/store/appSettings/amountOfTopLabels/amountOfTopLabels.actions"
import { showMetricLabelNodeNameSelector } from "../../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.selector"
import { setShowMetricLabelNodeName } from "../../../state/store/appSettings/showMetricLabelNodeName/showMetricLabelNodeName.actions"
import { showMetricLabelNodeValueSelector } from "../../../state/store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.selector"
import { setShowMetricLabelNameValue } from "../../../state/store/appSettings/showMetricLabelNameValue/showMetricLabelNameValue.actions"
import { colorLabelsSelector } from "../../../state/store/appSettings/colorLabels/colorLabels.selector"
import { setColorLabels } from "../../../state/store/appSettings/colorLabels/colorLabels.actions"
import { mapColorsSelector } from "../../../state/store/appSettings/mapColors/mapColors.selector"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { labelModeSelector } from "../../../state/store/appSettings/labelMode/labelMode.selector"
import { setLabelMode } from "../../../state/store/appSettings/labelMode/labelMode.actions"
import { debounce } from "../../../util/debounce"
import { SliderComponent } from "../../slider/slider.component"
import { ResetSettingsButtonComponent } from "../../resetSettingsButton/resetSettingsButton.component"
import { AsyncPipe } from "@angular/common"
import { CodeMapRenderService } from "../../codeMap/codeMap.render.service"

@Component({
    selector: "cc-label-settings-panel",
    templateUrl: "./labelSettingsPanel.component.html",
    styleUrls: ["./labelSettingsPanel.component.scss"],
    imports: [SliderComponent, MatCheckbox, ResetSettingsButtonComponent, AsyncPipe]
})
export class LabelSettingsPanelComponent {
    private static readonly DEBOUNCE_TIME = 400

    private static readonly AMOUNT_OF_TOP_LABELS_KEY = "appSettings.amountOfTopLabels"
    private static readonly SHOW_METRIC_LABEL_NODE_NAME_KEY = "appSettings.showMetricLabelNodeName"
    private static readonly SHOW_METRIC_LABEL_NAME_VALUE_KEY = "appSettings.showMetricLabelNameValue"
    private static readonly COLOR_LABELS_KEY = "appSettings.colorLabels"
    private static readonly LABEL_MODE_KEY = "appSettings.labelMode"

    readonly LabelMode = LabelMode

    readonly resetSettingsKeys = [
        LabelSettingsPanelComponent.AMOUNT_OF_TOP_LABELS_KEY,
        LabelSettingsPanelComponent.SHOW_METRIC_LABEL_NODE_NAME_KEY,
        LabelSettingsPanelComponent.SHOW_METRIC_LABEL_NAME_VALUE_KEY,
        LabelSettingsPanelComponent.COLOR_LABELS_KEY,
        LabelSettingsPanelComponent.LABEL_MODE_KEY
    ]

    amountOfTopLabels$ = this.store.select(amountOfTopLabelsSelector)
    showMetricLabelNodeName$ = this.store.select(showMetricLabelNodeNameSelector)
    showMetricLabelNodeValue$ = this.store.select(showMetricLabelNodeValueSelector)
    colorLabels$ = this.store.select(colorLabelsSelector)
    mapColors$ = this.store.select(mapColorsSelector)
    isDeltaState$ = this.store.select(isDeltaStateSelector)
    labelMode$ = this.store.select(labelModeSelector)
    colorCategoryCounts$ = this.codeMapRenderService.colorCategoryCounts$

    constructor(
        private readonly store: Store<CcState>,
        private readonly codeMapRenderService: CodeMapRenderService
    ) {}

    readonly applyDebouncedTopLabels = debounce((amountOfTopLabels: number) => {
        this.store.dispatch(setAmountOfTopLabels({ value: amountOfTopLabels }))
    }, LabelSettingsPanelComponent.DEBOUNCE_TIME)

    setShowMetricLabelNodeName(event: MatCheckboxChange) {
        this.store.dispatch(setShowMetricLabelNodeName({ value: event.checked }))
    }

    setShowMetricLabelNameValue(event: MatCheckboxChange) {
        this.store.dispatch(setShowMetricLabelNameValue({ value: event.checked }))
    }

    setColorLabel(change: MatCheckboxChange, colorLabelToToggle: keyof ColorLabelOptions) {
        this.store.dispatch(setColorLabels({ value: { [colorLabelToToggle]: change.checked } }))
    }

    setLabelMode(mode: LabelMode) {
        this.store.dispatch(setLabelMode({ value: mode }))
    }
}
