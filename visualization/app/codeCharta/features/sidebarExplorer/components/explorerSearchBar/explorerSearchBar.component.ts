import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { debounce } from "../../../../util/debounce"
import { EXPLORER_CAPABILITIES } from "../../explorerCapabilities"
import { EXPLORER_SEARCH, EXPLORER_WORD_SEARCH } from "../../explorerSearch.port"
import { ExplorerModeService } from "../../services/explorerMode.service"
import { ExplorerSearchActionsComponent } from "../explorerSearchActions/explorerSearchActions.component"

@Component({
    selector: "cc-explorer-search-bar",
    templateUrl: "./explorerSearchBar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ExplorerSearchActionsComponent]
})
export class ExplorerSearchBarComponent {
    private static readonly DEBOUNCE_TIME = 400

    private readonly modeService = inject(ExplorerModeService)
    private readonly fileSearch = inject(EXPLORER_SEARCH)
    // A view without a second mode never asks for the word search, so the file search stands in for it.
    private readonly wordSearch = inject(EXPLORER_WORD_SEARCH, { optional: true }) ?? this.fileSearch

    readonly showActions = inject(EXPLORER_CAPABILITIES).showRules
    readonly activeMode = this.modeService.activeMode

    private readonly filePattern = toSignal(this.fileSearch.pattern$, { requireSync: true })
    private readonly isFilePatternEmpty = toSignal(this.fileSearch.isPatternEmpty$, { requireSync: true })
    private readonly wordPattern = toSignal(this.wordSearch.pattern$, { requireSync: true })
    private readonly isWordPatternEmpty = toSignal(this.wordSearch.isPatternEmpty$, { requireSync: true })

    private readonly searchInUse = computed(() => (this.modeService.isFilesMode() ? this.fileSearch : this.wordSearch))

    readonly searchPattern = computed(() => (this.modeService.isFilesMode() ? this.filePattern() : this.wordPattern()))
    readonly isSearchPatternEmpty = computed(() => (this.modeService.isFilesMode() ? this.isFilePatternEmpty() : this.isWordPatternEmpty()))

    private readonly applyDebouncedPattern = debounce((value: string) => {
        this.searchInUse().setPattern(value)
    }, ExplorerSearchBarComponent.DEBOUNCE_TIME)

    setSearchPattern(event: Event) {
        this.applyDebouncedPattern((event.target as HTMLInputElement).value)
    }

    resetSearchPattern() {
        this.applyDebouncedPattern.cancel()
        this.searchInUse().resetPattern()
    }
}
