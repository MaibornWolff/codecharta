import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { SharedViewReadWindow } from "../../../../stores/sharedView/sharedView.read.facade"
import { debounce } from "../../../../util/debounce"
import { SidebarExplorerReadStore } from "../../stores/sidebarExplorer.read.store"
import { SidebarExplorerWriteStore } from "../../stores/sidebarExplorer.write.store"

@Component({
    selector: "cc-explorer-search-bar",
    templateUrl: "./explorerSearchBar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerSearchBarComponent {
    private static readonly DEBOUNCE_TIME = 400

    private readonly sharedViewReadWindow = inject(SharedViewReadWindow)
    private readonly readStore = inject(SidebarExplorerReadStore)
    private readonly writeStore = inject(SidebarExplorerWriteStore)

    readonly searchPattern = toSignal(this.sharedViewReadWindow.searchPattern$, { requireSync: true })
    readonly isSearchPatternEmpty = toSignal(this.readStore.isSearchPatternEmpty$, { requireSync: true })
    readonly isFlattenPatternDisabled = toSignal(this.readStore.isFlattenPatternDisabled$, { requireSync: true })
    readonly isExcludePatternDisabled = toSignal(this.readStore.isExcludePatternDisabled$, { requireSync: true })

    private readonly applyDebouncedPattern = debounce((value: string) => {
        this.writeStore.setSearchPattern(value)
    }, ExplorerSearchBarComponent.DEBOUNCE_TIME)

    setSearchPattern(event: Event) {
        const value = (event.target as HTMLInputElement).value
        this.applyDebouncedPattern(value)
    }

    resetSearchPattern() {
        this.writeStore.resetSearchPattern()
    }

    flattenPattern() {
        this.writeStore.blacklistSearchPattern("flatten")
    }

    excludePattern() {
        this.writeStore.blacklistSearchPattern("exclude")
    }
}
