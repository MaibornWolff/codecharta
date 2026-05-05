import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ExplorerSearchService } from "../../services/explorerSearch.service"
import { debounce } from "../../../../util/debounce"

@Component({
    selector: "cc-explorer-search-bar",
    templateUrl: "./explorerSearchBar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerSearchBarComponent {
    private static readonly DEBOUNCE_TIME = 400

    private readonly explorerSearchService = inject(ExplorerSearchService)

    readonly searchPattern = toSignal(this.explorerSearchService.searchPattern$, { requireSync: true })
    readonly isSearchPatternEmpty = toSignal(this.explorerSearchService.isSearchPatternEmpty$, { requireSync: true })
    readonly isFlattenPatternDisabled = toSignal(this.explorerSearchService.isFlattenPatternDisabled$, { requireSync: true })
    readonly isExcludePatternDisabled = toSignal(this.explorerSearchService.isExcludePatternDisabled$, { requireSync: true })

    private readonly applyDebouncedPattern = debounce((value: string) => {
        this.explorerSearchService.setSearchPattern(value)
    }, ExplorerSearchBarComponent.DEBOUNCE_TIME)

    setSearchPattern(event: Event) {
        const value = (event.target as HTMLInputElement).value
        this.applyDebouncedPattern(value)
    }

    resetSearchPattern() {
        this.explorerSearchService.resetSearchPattern()
    }

    flattenPattern() {
        this.explorerSearchService.blacklistSearchPattern("flatten")
    }

    excludePattern() {
        this.explorerSearchService.blacklistSearchPattern("exclude")
    }
}
