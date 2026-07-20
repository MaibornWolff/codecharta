import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { SortingOption } from "../../../../model/codeCharta.model"
import { ExplorerSortService } from "../../services/explorerSort.service"
import { SidebarExplorerWriteStore } from "../../stores/sidebarExplorer.write.store"

@Component({
    selector: "cc-explorer-sort-control",
    templateUrl: "./explorerSortControl.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerSortControlComponent {
    private readonly explorerSortService = inject(ExplorerSortService)
    private readonly writeStore = inject(SidebarExplorerWriteStore)

    readonly sortOptions = Object.values(SortingOption) as SortingOption[]

    readonly sortState = toSignal(this.explorerSortService.sortState$, { requireSync: true })
    readonly currentOption = computed(() => this.sortState()[0])
    readonly isAscending = computed(() => this.sortState()[1])

    setSortingOption(value: SortingOption) {
        this.writeStore.setSortingOption(value)
    }

    toggleSortOrder() {
        this.writeStore.toggleSortingOrderAscending()
    }
}
