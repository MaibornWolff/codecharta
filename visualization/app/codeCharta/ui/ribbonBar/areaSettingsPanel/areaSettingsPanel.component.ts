import { Component } from "@angular/core"
import { marginSelector } from "../../../state/store/dynamicSettings/margin/margin.selector"
import { setMargin } from "../../../state/store/dynamicSettings/margin/margin.actions"
import { MatCheckboxChange, MatCheckbox } from "@angular/material/checkbox"
import { setEnableFloorLabels } from "../../../state/store/appSettings/enableFloorLabels/enableFloorLabels.actions"
import { enableFloorLabelsSelector } from "../../../state/store/appSettings/enableFloorLabels/enableFloorLabels.selector"
import { invertAreaSelector } from "../../../state/store/appSettings/invertArea/invertArea.selector"
import { debounce } from "../../../util/debounce"
import { setInvertArea } from "../../../state/store/appSettings/invertArea/invertArea.actions"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { SliderComponent } from "../../slider/slider.component"
import { ResetSettingsButtonComponent } from "../../resetSettingsButton/resetSettingsButton.component"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-area-settings-panel",
    templateUrl: "./areaSettingsPanel.component.html",
    styleUrls: ["./areaSettingsPanel.component.scss"],
    standalone: true,
    imports: [SliderComponent, MatCheckbox, ResetSettingsButtonComponent, AsyncPipe]
})
export class AreaSettingsPanelComponent {
    static DEBOUNCE_TIME = 400

    margin$ = this.store.select(marginSelector)
    enableFloorLabels$ = this.store.select(enableFloorLabelsSelector)
    isInvertedArea$ = this.store.select(invertAreaSelector)

    constructor(private store: Store<CcState>) {}

    applyDebouncedMargin = debounce((margin: number) => {
        this.store.dispatch(setMargin({ value: margin }))
    }, AreaSettingsPanelComponent.DEBOUNCE_TIME)

    setEnableFloorLabel(event: MatCheckboxChange) {
        this.store.dispatch(setEnableFloorLabels({ value: event.checked }))
    }

    toggleInvertingArea(event: MatCheckboxChange) {
        this.store.dispatch(setInvertArea({ value: event.checked }))
    }
}
