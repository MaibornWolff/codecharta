import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { withRangeMax, withRangeMin } from "../../../../model/wordCloud.model"
import { SliderNumberInputComponent } from "../../../shared/facade"
import { DomainBarReadStore } from "../../stores/domainBar.read.store"
import { DomainBarWriteStore } from "../../stores/domainBar.write.store"

@Component({
    selector: "cc-word-size-range-control",
    templateUrl: "./wordSizeRangeControl.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [SliderNumberInputComponent]
})
export class WordSizeRangeControlComponent {
    private readonly readStore = inject(DomainBarReadStore)
    private readonly writeStore = inject(DomainBarWriteStore)

    readonly settings = this.readStore.settings

    readonly smallestWordBounds = { min: 10, max: 40 }
    readonly largestWordBounds = { min: 40, max: 120 }

    readonly shrinkToFitTitle = computed(() => {
        return this.settings().shrinkToFit
            ? "On — words that do not fit are shrunk until they do, so the full word count is drawn. Tail words can render below Smallest Word."
            : "Off — words that do not fit are left out, so Smallest Word is exact but fewer words than requested appear."
    })

    readonly drawOutOfBoundTitle = computed(() => {
        return this.settings().drawOutOfBound
            ? "On — words may render partially outside the layout area instead of being dropped or shrunk, so more words fit at their true size."
            : "Off — every word is kept fully inside the layout area; words that only fit overlapping the edge are shrunk or left out."
    })

    onSizeRangeMinChange(value: number) {
        this.writeStore.setSizeRange(withRangeMin(this.settings().sizeRange, value))
    }

    onSizeRangeMaxChange(value: number) {
        this.writeStore.setSizeRange(withRangeMax(this.settings().sizeRange, value))
    }

    onShrinkToFitChange(value: boolean) {
        this.writeStore.setShrinkToFit(value)
    }

    onDrawOutOfBoundChange(value: boolean) {
        this.writeStore.setDrawOutOfBound(value)
    }
}
