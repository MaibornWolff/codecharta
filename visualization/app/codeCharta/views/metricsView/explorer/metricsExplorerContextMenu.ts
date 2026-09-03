import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { NodeContextMenuForExplorer } from "../../../features/nodeContextMenu/facade"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { MapStateReadWindow } from "../../../stores/mapState/mapState.read.facade"
import { isAreaValid } from "../../../util/codeMapHelper"

@Injectable()
export class MetricsExplorerContextMenu extends NodeContextMenuForExplorer {
    private readonly areaMetric = toSignal(inject(MapStateReadWindow).areaMetric$, { requireSync: true })

    override isEnabledFor(node: CodeMapNode): boolean {
        return isAreaValid(node, this.areaMetric())
    }
}
