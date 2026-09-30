import { Directive, inject } from "@angular/core"
import { showHandedOverNodeOnArrival } from "../../../../routing/showHandedOverNodeOnArrival"
import { EXPLORER_SELECTION, ExplorerRevealService } from "../../../sidebarExplorer/facade"
import { HANDED_OVER_MAP_NODE_ARRIVAL } from "../../handedOverMapNodeArrival"
import { MAP_EXPLORER_VIEW } from "../../mapExplorerView"
import { MapNodeByPathStore } from "../../stores/mapNodeByPath.store"

@Directive({
    selector: "[ccShowsHandedOverMapNode]"
})
export class ShowsHandedOverMapNodeDirective {
    private readonly mapNodeByPathStore = inject(MapNodeByPathStore)
    private readonly selection = inject(EXPLORER_SELECTION)
    private readonly revealService = inject(ExplorerRevealService)
    private readonly arrival = inject(HANDED_OVER_MAP_NODE_ARRIVAL, { optional: true })

    constructor() {
        showHandedOverNodeOnArrival(inject(MAP_EXPLORER_VIEW), nodePath => this.showNode(nodePath))
    }

    private showNode(nodePath: string): void {
        this.mapNodeByPathStore.currentNodeAt(nodePath).subscribe(node => {
            if (!node) {
                return
            }
            this.arrival?.receive(nodePath)
            this.selection.select(node)
            this.revealService.revealNode(nodePath)
        })
    }
}
