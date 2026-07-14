import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
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

    readonly rootNode = toSignal(this.readStore.rootNode$, { requireSync: true })
}
