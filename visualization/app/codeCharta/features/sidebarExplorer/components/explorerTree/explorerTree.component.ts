import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { combineLatest, switchMap } from "rxjs"
import { EXPLORER_SORT } from "../../explorerSort.port"
import { EXPLORER_TREE } from "../../explorerTree.port"
import { ExplorerTreeLevelComponent } from "../explorerTreeLevel/explorerTreeLevel.component"

@Component({
    selector: "cc-explorer-tree",
    templateUrl: "./explorerTree.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ExplorerTreeLevelComponent]
})
export class ExplorerTreeComponent {
    private readonly explorerTree = inject(EXPLORER_TREE)
    private readonly explorerSort = inject(EXPLORER_SORT)

    readonly rootNode = toSignal(
        combineLatest([this.explorerSort.option$, this.explorerSort.ascending$]).pipe(
            switchMap(([option, ascending]) => this.explorerTree.rootNodeFor(option, ascending))
        )
    )
}
