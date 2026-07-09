import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState, ColorMode } from "../../../model/codeCharta.model"
import { setColorMode } from "../../../stores/mapState/mapState.write.facade"
import {
    areaMetricSelector,
    attributeDescriptorsSelector,
    blacklistSelector,
    colorMetricSelector,
    colorModeSelector,
    colorRangeSelector,
    heightMetricSelector,
    print3DFilesSelector
} from "../selectors/3dPrint.selectors"

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
