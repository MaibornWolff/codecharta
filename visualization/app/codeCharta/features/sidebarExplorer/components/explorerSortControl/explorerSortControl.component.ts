import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { EXPLORER_SORT, EXPLORER_WORD_SORT, ExplorerSort } from "../../explorerSort.port"
import { ExplorerModeService } from "../../services/explorerMode.service"

@Component({
    selector: "cc-explorer-sort-control",
    templateUrl: "./explorerSortControl.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerSortControlComponent {
    private readonly modeService = inject(ExplorerModeService)
    private readonly fileSort: ExplorerSort = inject(EXPLORER_SORT)
    // A view without a second mode never asks for the word sort, so the file sort stands in for it.
    private readonly wordSort = inject(EXPLORER_WORD_SORT, { optional: true }) ?? this.fileSort

    private readonly sortInUse = computed(() => (this.modeService.isFilesMode() ? this.fileSort : this.wordSort))

    private readonly fileOption = toSignal(this.fileSort.option$, { requireSync: true })
    private readonly isFileAscending = toSignal(this.fileSort.ascending$, { requireSync: true })
    private readonly wordOption = toSignal(this.wordSort.option$, { requireSync: true })
    private readonly isWordAscending = toSignal(this.wordSort.ascending$, { requireSync: true })

    readonly sortOptions = computed(() => this.sortInUse().options)
    readonly currentOption = computed(() => (this.modeService.isFilesMode() ? this.fileOption() : this.wordOption()))
    readonly isAscending = computed(() => (this.modeService.isFilesMode() ? this.isFileAscending() : this.isWordAscending()))

    setSortingOption(value: string) {
        this.sortInUse().setOption(value)
    }

    toggleSortOrder() {
        this.sortInUse().toggleAscending()
    }
}
