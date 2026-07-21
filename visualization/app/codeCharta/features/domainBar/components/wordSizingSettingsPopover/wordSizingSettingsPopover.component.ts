import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { WordCloudSizingMode, withRangeMax, withRangeMin } from "../../../../model/wordCloud.model"
import { ResetSettingsButtonComponent, SettingsPopoverShellComponent, SliderNumberInputComponent } from "../../../shared/facade"
import { DomainBarReadStore } from "../../stores/domainBar.read.store"
import { DomainBarWriteStore } from "../../stores/domainBar.write.store"

@Component({
    selector: "cc-word-sizing-settings-popover",
    templateUrl: "./wordSizingSettingsPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [ResetSettingsButtonComponent, SettingsPopoverShellComponent, SliderNumberInputComponent]
})
export class WordSizingSettingsPopoverComponent {
    private readonly readStore = inject(DomainBarReadStore)
    private readonly writeStore = inject(DomainBarWriteStore)

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    readonly settings = this.readStore.settings
    readonly hasTfidfData = this.readStore.hasTfidfData
    readonly WordCloudSizingMode = WordCloudSizingMode

    readonly resetKeys = [
        "domainState.sizingMode",
        "domainState.topN",
        "domainState.sizeRange",
        "domainState.gridSize",
        "domainState.shrinkToFit",
        "domainState.drawOutOfBound"
    ]

    /** Names the trade-off in whichever direction the toggle would take it, rather than only its on-state. */
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

    readonly tfidfOptionTitle = computed(() => {
        return this.hasTfidfData()
            ? "TF-IDF (relative importance) — sizes words by how distinctive they are, not by raw count"
            : "TF-IDF (relative importance) — not available: the loaded file has no TF-IDF scores"
    })

    onSizingModeChange(value: string) {
        this.writeStore.setSizingMode(value as WordCloudSizingMode)
    }

    onTopNChange(value: number) {
        this.writeStore.setTopN(value)
    }

    onGridSizeChange(value: number) {
        this.writeStore.setGridSize(value)
    }

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
