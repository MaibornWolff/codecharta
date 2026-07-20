import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { WordCloudSettings } from "../../../model/wordCloud.model"
import { drawOutOfBoundSelector } from "./drawOutOfBound/drawOutOfBound.selector"
import { gridSizeSelector } from "./gridSize/gridSize.selector"
import { rotationRangeSelector } from "./rotationRange/rotationRange.selector"
import { rotationStepSelector } from "./rotationStep/rotationStep.selector"
import { shapeSelector } from "./shape/shape.selector"
import { shrinkToFitSelector } from "./shrinkToFit/shrinkToFit.selector"
import { sizeRangeSelector } from "./sizeRange/sizeRange.selector"
import { sizingModeSelector } from "./sizingMode/sizingMode.selector"
import { topNSelector } from "./topN/topN.selector"
import { wordCloudSettingsSelector } from "./wordCloudSettings.selector"

@Injectable({
    providedIn: "root"
})
export class DomainBarReadWindow {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly shape$ = this.store.select(shapeSelector)
    readonly sizeRange$ = this.store.select(sizeRangeSelector)
    readonly rotationRange$ = this.store.select(rotationRangeSelector)
    readonly rotationStep$ = this.store.select(rotationStepSelector)
    readonly gridSize$ = this.store.select(gridSizeSelector)
    readonly sizingMode$ = this.store.select(sizingModeSelector)
    readonly topN$ = this.store.select(topNSelector)
    readonly shrinkToFit$ = this.store.select(shrinkToFitSelector)
    readonly drawOutOfBound$ = this.store.select(drawOutOfBoundSelector)
    readonly wordCloudSettings$ = this.store.select(wordCloudSettingsSelector)

    getDomainBar(): WordCloudSettings {
        return this.state.getValue().domainBar
    }
}
