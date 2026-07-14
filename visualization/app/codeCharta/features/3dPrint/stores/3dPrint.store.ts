import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { attributeDescriptorsSelector } from "../../../lenses/metrics/metricsLens.facade"
import { CcState, ColorMode } from "../../../model/codeCharta.model"
import { FileStoreReadWindow } from "../../../stores/fileStore/fileStore.facade"
import {
    areaMetricSelector,
    colorMetricSelector,
    colorModeSelector,
    colorRangeSelector,
    heightMetricSelector
} from "../../../stores/mapState/mapState.read.facade"
import { setColorMode } from "../../../stores/mapState/mapState.write.facade"
import { blacklistSelector } from "../../../stores/sharedView/sharedView.read.facade"

@Injectable({
    providedIn: "root"
})
export class Print3DStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly fileStoreReadWindow: FileStoreReadWindow
    ) {}

    areaMetric$ = this.store.select(areaMetricSelector)
    heightMetric$ = this.store.select(heightMetricSelector)
    colorMetric$ = this.store.select(colorMetricSelector)
    colorRange$ = this.store.select(colorRangeSelector)
    colorMode$ = this.store.select(colorModeSelector)
    attributeDescriptors$ = this.store.select(attributeDescriptorsSelector)
    blacklist$ = this.store.select(blacklistSelector)
    files$ = this.fileStoreReadWindow.files$

    setColorMode(value: ColorMode) {
        this.store.dispatch(setColorMode({ value }))
    }
}
