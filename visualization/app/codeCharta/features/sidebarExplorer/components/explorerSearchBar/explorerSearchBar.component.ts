import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { debounce } from "../../../../util/debounce"
import { EXPLORER_CAPABILITIES } from "../../explorerCapabilities"
import { EXPLORER_SEARCH } from "../../explorerSearch.port"
import { ExplorerSearchActionsComponent } from "../explorerSearchActions/explorerSearchActions.component"

@Component({
    selector: "cc-explorer-search-bar",
    templateUrl: "./explorerSearchBar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ExplorerSearchActionsComponent]
})
export class ExplorerSearchBarComponent {
    private static readonly DEBOUNCE_TIME = 400

    private readonly search = inject(EXPLORER_SEARCH)

    readonly showActions = inject(EXPLORER_CAPABILITIES).showRules
    readonly searchPattern = toSignal(this.search.pattern$, { requireSync: true })
    readonly isSearchPatternEmpty = toSignal(this.search.isPatternEmpty$, { requireSync: true })

    private readonly applyDebouncedPattern = debounce((value: string) => {
        this.search.setPattern(value)
    }, ExplorerSearchBarComponent.DEBOUNCE_TIME)

    setSearchPattern(event: Event) {
        this.applyDebouncedPattern((event.target as HTMLInputElement).value)
    }

    resetSearchPattern() {
        this.applyDebouncedPattern.cancel()
        this.search.resetPattern()
    }
}
