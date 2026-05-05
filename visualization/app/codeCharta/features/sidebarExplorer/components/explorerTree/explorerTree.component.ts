import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ExplorerTreeStore } from "../../stores/explorerTree.store"
import { ExplorerTreeLevelComponent } from "../explorerTreeLevel/explorerTreeLevel.component"

@Component({
    selector: "cc-explorer-tree",
    templateUrl: "./explorerTree.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ExplorerTreeLevelComponent]
})
export class ExplorerTreeComponent {
    private readonly explorerTreeStore = inject(ExplorerTreeStore)

    readonly rootNode = toSignal(this.explorerTreeStore.rootNode$, { requireSync: true })
}
