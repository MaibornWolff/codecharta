import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { SortingOption } from "../../../../model/codeCharta.model"
import { EXPLORER_CAPABILITIES } from "../../explorerCapabilities"
import { EXPLORER_SORT } from "../../explorerSort.port"

@Component({
    selector: "cc-explorer-sort-control",
    templateUrl: "./explorerSortControl.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerSortControlComponent {
    private readonly explorerSort = inject(EXPLORER_SORT)

    // The hosting view scopes the offered orderings — the domain view drops the map-only Area Size.
    readonly sortOptions: SortingOption[] = inject(EXPLORER_CAPABILITIES).sortOptions

    // The current option/order come from the per-view sort, so the trigger always reflects THIS view's sort.
    readonly currentOption = toSignal(this.explorerSort.option$, { requireSync: true })
    readonly isAscending = toSignal(this.explorerSort.ascending$, { requireSync: true })

    setSortingOption(value: SortingOption) {
        this.explorerSort.setOption(value)
    }

    toggleSortOrder() {
        this.explorerSort.toggleAscending()
    }
}
