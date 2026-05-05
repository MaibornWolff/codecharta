import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { SortingOption } from "../../../../codeCharta.model"
import { ExplorerSortService } from "../../services/explorerSort.service"

@Component({
    selector: "cc-explorer-sort-control",
    templateUrl: "./explorerSortControl.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerSortControlComponent {
    private readonly explorerSortService = inject(ExplorerSortService)

    readonly sortOptions = Object.values(SortingOption) as SortingOption[]

    readonly sortState = toSignal(this.explorerSortService.sortState$, { requireSync: true })
    readonly currentOption = computed(() => this.sortState()[0])
    readonly isAscending = computed(() => this.sortState()[1])

    setSortingOption(value: SortingOption) {
        this.explorerSortService.setSortingOption(value)
    }

    toggleSortOrder() {
        this.explorerSortService.toggleSortingOrderAscending()
    }
}
