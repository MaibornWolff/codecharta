import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core"
import { SettingsPopoverShellComponent } from "../../../shared/facade"
import { HiddenWordsReadStore } from "../../stores/hiddenWords.read.store"
import { HiddenWordsWriteStore } from "../../stores/hiddenWords.write.store"

@Component({
    selector: "cc-hidden-words-popover",
    templateUrl: "./hiddenWordsPopover.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [SettingsPopoverShellComponent]
})
export class HiddenWordsPopoverComponent {
    private readonly readStore = inject(HiddenWordsReadStore)
    private readonly writeStore = inject(HiddenWordsWriteStore)

    readonly popoverId = input.required<string>()
    readonly anchorName = input.required<string>()

    protected readonly hiddenWords = computed(() => [...this.readStore.hiddenWords()].sort((a, b) => a.localeCompare(b)))

    protected restore(word: string) {
        this.writeStore.restore(word)
    }

    protected restoreAll() {
        this.writeStore.restoreAll()
    }
}
