import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { WordCloudSizingMode } from "../../../../model/wordCloud.model"
import { DomainBarReadStore } from "../../stores/domainBar.read.store"
import { DomainBarWriteStore } from "../../stores/domainBar.write.store"

@Component({
    selector: "cc-word-sizing-mode-control",
    templateUrl: "./wordSizingModeControl.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" }
})
export class WordSizingModeControlComponent {
    private readonly readStore = inject(DomainBarReadStore)
    private readonly writeStore = inject(DomainBarWriteStore)

    readonly settings = this.readStore.settings
    readonly hasTfidfData = this.readStore.hasTfidfData
    readonly WordCloudSizingMode = WordCloudSizingMode

    readonly tfidfOptionTitle = computed(() => {
        return this.hasTfidfData()
            ? "TF-IDF (relative importance) — sizes words by how distinctive they are, not by raw count"
            : "TF-IDF (relative importance) — not available: the loaded file has no TF-IDF scores"
    })

    onSizingModeChange(value: string) {
        this.writeStore.setSizingMode(value as WordCloudSizingMode)
    }
}
