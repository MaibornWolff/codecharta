import { Component } from "@angular/core"
import { scalingSelector } from "../../../state/store/appSettings/scaling/scaling.selector"
import { setScaling } from "../../../state/store/appSettings/scaling/scaling.actions"
import { invertHeightSelector } from "../../../state/store/appSettings/invertHeight/invertHeight.selector"
import { setInvertHeight } from "../../../state/store/appSettings/invertHeight/invertHeight.actions"
import { isDeltaStateSelector } from "../../../state/selectors/isDeltaState.selector"
import { MatCheckboxChange, MatCheckbox } from "@angular/material/checkbox"
import { debounce } from "../../../util/debounce"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
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
    isDeltaState$ = this.store.select(isDeltaStateSelector)

    constructor(private store: Store<CcState>) {}

    applyDebouncedScalingY = debounce((y: number) => {
        this.store.dispatch(setScaling({ value: { y } }))
    }, HeightSettingsPanelComponent.DEBOUNCE_TIME)

    toggleInvertHeight(event: MatCheckboxChange) {
        this.store.dispatch(setInvertHeight({ value: event.checked }))
    }
}
