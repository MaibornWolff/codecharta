import { Injectable, inject } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { WordCloudSettings } from "../../../model/wordCloud.model"
import {
    setDomainStateDrawOutOfBound,
    setDomainStateGridSize,
    setDomainStateRotationRange,
    setDomainStateRotationStep,
    setDomainStateShape,
    setDomainStateShrinkToFit,
    setDomainStateSizeRange,
    setDomainStateSizingMode,
    setDomainStateTopN
} from "../../../stores/domainState/domainState.write.facade"

/**
 * Write surface of the domain settings bar: one setter per control. Resets are not routed through here —
 * each settings popover resets only its own group via the shared cc-reset-settings-button state paths.
 */
@Injectable({ providedIn: "root" })
export class DomainBarWriteStore {
    private readonly store: Store<CcState> = inject(Store)

    setShape(value: WordCloudSettings["shape"]) {
        this.store.dispatch(setDomainStateShape({ value }))
    }

    setSizeRange(value: WordCloudSettings["sizeRange"]) {
        this.store.dispatch(setDomainStateSizeRange({ value }))
    }

    setRotationRange(value: WordCloudSettings["rotationRange"]) {
        this.store.dispatch(setDomainStateRotationRange({ value }))
    }

    setRotationStep(value: WordCloudSettings["rotationStep"]) {
        this.store.dispatch(setDomainStateRotationStep({ value }))
    }

    setGridSize(value: WordCloudSettings["gridSize"]) {
        this.store.dispatch(setDomainStateGridSize({ value }))
    }

    setSizingMode(value: WordCloudSettings["sizingMode"]) {
        this.store.dispatch(setDomainStateSizingMode({ value }))
    }

    setTopN(value: WordCloudSettings["topN"]) {
        this.store.dispatch(setDomainStateTopN({ value }))
    }

    setShrinkToFit(value: WordCloudSettings["shrinkToFit"]) {
        this.store.dispatch(setDomainStateShrinkToFit({ value }))
    }

    setDrawOutOfBound(value: WordCloudSettings["drawOutOfBound"]) {
        this.store.dispatch(setDomainStateDrawOutOfBound({ value }))
    }
}
