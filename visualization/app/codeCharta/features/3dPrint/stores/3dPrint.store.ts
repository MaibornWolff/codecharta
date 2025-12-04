import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, ColorMode } from "../../../codeCharta.model"
import {
    areaMetricSelector,
    heightMetricSelector,
    colorMetricSelector,
    colorRangeSelector,
    colorModeSelector,
    attributeDescriptorsSelector,
    blacklistSelector,
    print3DFilesSelector
} from "../selectors/3dPrint.selectors"
import { setColorMode } from "../../../state/store/dynamicSettings/colorMode/colorMode.actions"

@Injectable({
    providedIn: "root"
})
export class Print3DStore {
    constructor(private readonly store: Store<CcState>) {}

    areaMetric$ = this.store.select(areaMetricSelector)
    heightMetric$ = this.store.select(heightMetricSelector)
    colorMetric$ = this.store.select(colorMetricSelector)
    colorRange$ = this.store.select(colorRangeSelector)
    colorMode$ = this.store.select(colorModeSelector)
    attributeDescriptors$ = this.store.select(attributeDescriptorsSelector)
    blacklist$ = this.store.select(blacklistSelector)
    files$ = this.store.select(print3DFilesSelector)

    setColorMode(value: ColorMode) {
        this.store.dispatch(setColorMode({ value }))
    }
}
