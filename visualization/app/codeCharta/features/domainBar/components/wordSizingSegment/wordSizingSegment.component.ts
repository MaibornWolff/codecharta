import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { WordCloudSizingMode } from "../../../../model/wordCloud.model"
import { AxisCardComponent } from "../../../shared/facade"
import { DomainBarReadStore } from "../../stores/domainBar.read.store"
import { WordSizingSettingsPopoverComponent } from "../wordSizingSettingsPopover/wordSizingSettingsPopover.component"

/**
 * The domain bar's Word Sizing area: which metric drives a word's size, shown inline because it decides
 * how the whole cloud reads. Its popover holds everything that governs which words appear and how big
 * they are — sizing mode, word count, size range and spacing.
 */
@Component({
    selector: "cc-word-sizing-segment",
    templateUrl: "./wordSizingSegment.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [AxisCardComponent, WordSizingSettingsPopoverComponent]
})
export class WordSizingSegmentComponent {
    readonly settingsPopoverId = "domain-bar-word-sizing-popover"
    readonly settingsAnchorName = "domain-bar-word-sizing-cog"

    private readonly readStore = inject(DomainBarReadStore)

    readonly settings = this.readStore.settings

    readonly sizingModeLabel = computed(() => (this.settings().sizingMode === WordCloudSizingMode.tfidf ? "TF-IDF" : "Frequency"))
}
