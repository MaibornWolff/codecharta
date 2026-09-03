import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { NodeContextMenuForExplorer } from "../../../features/nodeContextMenu/facade"
import { CcState } from "../../../model/codeCharta.model"
import { pathToNodeSelector } from "../../../renderer/renderModel/renderModel.facade"
import { MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"
import { isAreaValid } from "../../../util/codeMapHelper"

@Injectable()
export class MetricsExplorerContextMenu extends NodeContextMenuForExplorer {
    private readonly areaMetric = toSignal(inject(MapStateReadWindow).areaMetric$, { requireSync: true })
    private readonly pathToNode = inject<Store<CcState>>(Store).selectSignal(pathToNodeSelector)

    override isEnabledFor(nodePath: string): boolean {
        const node = this.pathToNode().get(nodePath)
        return node !== undefined && isAreaValid(node, this.areaMetric())
    }
}
