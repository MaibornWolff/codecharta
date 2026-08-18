import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { EXPLORER_SEARCH } from "../../explorerSearch.port"
import { SidebarExplorerReadStore } from "../../stores/sidebarExplorer.read.store"
import { SidebarExplorerWriteStore } from "../../stores/sidebarExplorer.write.store"

@Component({
    selector: "cc-explorer-search-actions",
    templateUrl: "./explorerSearchActions.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerSearchActionsComponent {
    private readonly readStore = inject(SidebarExplorerReadStore)
    private readonly writeStore = inject(SidebarExplorerWriteStore)

    readonly isSearchPatternEmpty = toSignal(inject(EXPLORER_SEARCH).isPatternEmpty$, { requireSync: true })
    readonly isFlattenPatternDisabled = toSignal(this.readStore.isFlattenPatternDisabled$, { requireSync: true })
    readonly isExcludePatternDisabled = toSignal(this.readStore.isExcludePatternDisabled$, { requireSync: true })

    flattenPattern() {
        this.writeStore.blacklistSearchPattern("flatten")
    }

    excludePattern() {
        this.writeStore.blacklistSearchPattern("exclude")
    }
}
