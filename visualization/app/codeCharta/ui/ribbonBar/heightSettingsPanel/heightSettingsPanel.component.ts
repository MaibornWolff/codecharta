import { Component } from "@angular/core"
import { scalingSelector } from "../../../state/store/appSettings/scaling/scaling.selector"
import { setScaling } from "../../../state/store/appSettings/scaling/scaling.actions"
import { invertHeightSelector } from "../../../state/store/appSettings/invertHeight/invertHeight.selector"
import { setInvertHeight } from "../../../state/store/appSettings/invertHeight/invertHeight.actions"
import { heightScaleModeSelector } from "../../../state/store/appSettings/heightScaleMode/heightScaleMode.selector"
import { setHeightScaleMode } from "../../../state/store/appSettings/heightScaleMode/heightScaleMode.actions"
import { heightScalePowerExponentSelector } from "../../../state/store/appSettings/heightScalePowerExponent/heightScalePowerExponent.selector"
import { setHeightScalePowerExponent } from "../../../state/store/appSettings/heightScalePowerExponent/heightScalePowerExponent.actions"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { MatCheckboxChange, MatCheckbox } from "@angular/material/checkbox"
import { debounce } from "../../../util/debounce"
import { Store } from "@ngrx/store"
import { CcState, HeightScaleMode } from "../../../codeCharta.model"
import { SliderComponent } from "../../slider/slider.component"
import { ResetSettingsButtonComponent } from "../../resetSettingsButton/resetSettingsButton.component"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-height-settings-panel",
    templateUrl: "./heightSettingsPanel.component.html",
    styleUrls: ["./heightSettingsPanel.component.scss"],
    imports: [SliderComponent, MatCheckbox, ResetSettingsButtonComponent, AsyncPipe]
})
export class HeightSettingsPanelComponent {
    static DEBOUNCE_TIME = 400

    scaling$ = this.store.select(scalingSelector)
    invertHeight$ = this.store.select(invertHeightSelector)
    heightScaleMode$ = this.store.select(heightScaleModeSelector)
    heightScalePowerExponent$ = this.store.select(heightScalePowerExponentSelector)
    isDeltaState$ = this.store.select(isDeltaStateSelector)

    heightScaleModes = Object.values(HeightScaleMode)
    HeightScaleMode = HeightScaleMode

    constructor(private store: Store<CcState>) {}

    applyDebouncedScalingY = debounce((y: number) => {
        this.store.dispatch(setScaling({ value: { y } }))
    }, HeightSettingsPanelComponent.DEBOUNCE_TIME)

    toggleInvertHeight(event: MatCheckboxChange) {
        this.store.dispatch(setInvertHeight({ value: event.checked }))
    }

    handleHeightScaleModeChanged(value: HeightScaleMode) {
        this.store.dispatch(setHeightScaleMode({ value }))
    }

    applyDebouncedPowerExponent = debounce((value: number) => {
        this.store.dispatch(setHeightScalePowerExponent({ value: value / 10 }))
    }, HeightSettingsPanelComponent.DEBOUNCE_TIME)
}
