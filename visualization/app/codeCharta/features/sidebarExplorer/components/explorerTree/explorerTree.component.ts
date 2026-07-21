import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { combineLatest, switchMap } from "rxjs"
import { EXPLORER_SORT } from "../../explorerSort.port"
import { SidebarExplorerReadStore } from "../../stores/sidebarExplorer.read.store"
import { ExplorerTreeLevelComponent } from "../explorerTreeLevel/explorerTreeLevel.component"

@Component({
    selector: "cc-explorer-tree",
    templateUrl: "./explorerTree.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ExplorerTreeLevelComponent]
})
export class ExplorerTreeComponent {
    private readonly readStore = inject(SidebarExplorerReadStore)
    private readonly explorerSort = inject(EXPLORER_SORT)

    // The tree is sorted by the hosting view's own order — so the domain view's sort no longer follows the
    // map view's global sort. The template guards the initial (pre-emission) undefined with @if.
    readonly rootNode = toSignal(
        combineLatest([this.explorerSort.option$, this.explorerSort.ascending$]).pipe(
            switchMap(([option, ascending]) => this.readStore.rootNodeFor(option, ascending))
        )
    )
}
