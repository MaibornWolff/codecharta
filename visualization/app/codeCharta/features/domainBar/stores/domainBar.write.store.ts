import { Injectable, inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { WordCloudSettings } from "../../../model/wordCloud.model"
import {
    setDomainBarGridSize,
    setDomainBarRotationRange,
    setDomainBarRotationStep,
    setDomainBarShape,
    setDomainBarShrinkToFit,
    setDomainBarSizeRange,
    setDomainBarSizingMode,
    setDomainBarTopN
} from "../../../stores/domainBar/domainBar.write.facade"

/**
 * Write surface of the domain settings bar: one setter per control. Resets are not routed through here —
 * each settings popover resets only its own group via the shared cc-reset-settings-button state paths.
 */
@Injectable({ providedIn: "root" })
export class DomainBarWriteStore {
    private readonly store = inject(Store)

    setShape(value: WordCloudSettings["shape"]) {
        this.store.dispatch(setDomainBarShape({ value }))
    }

    setSizeRange(value: WordCloudSettings["sizeRange"]) {
        this.store.dispatch(setDomainBarSizeRange({ value }))
    }

    setRotationRange(value: WordCloudSettings["rotationRange"]) {
        this.store.dispatch(setDomainBarRotationRange({ value }))
    }

    setRotationStep(value: WordCloudSettings["rotationStep"]) {
        this.store.dispatch(setDomainBarRotationStep({ value }))
    }

    setGridSize(value: WordCloudSettings["gridSize"]) {
        this.store.dispatch(setDomainBarGridSize({ value }))
    }

    setSizingMode(value: WordCloudSettings["sizingMode"]) {
        this.store.dispatch(setDomainBarSizingMode({ value }))
    }

    setTopN(value: WordCloudSettings["topN"]) {
        this.store.dispatch(setDomainBarTopN({ value }))
    }

    setShrinkToFit(value: WordCloudSettings["shrinkToFit"]) {
        this.store.dispatch(setDomainBarShrinkToFit({ value }))
    }
}
