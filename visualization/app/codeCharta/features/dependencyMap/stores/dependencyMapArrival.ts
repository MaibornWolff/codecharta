import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { HandedOverMapNodeArrival } from "../../mapExplorer/facade"
import { DependencyMapReadStore } from "./dependencyMap.read.store"
import { DependencyMapWriteStore } from "./dependencyMap.write.store"
import { DependencyMapViewStore } from "./dependencyMapView.store"

@Injectable()
export class DependencyMapArrival implements HandedOverMapNodeArrival {
    private readonly writeStore = inject(DependencyMapWriteStore)
    private readonly viewStore = inject(DependencyMapViewStore)
    private readonly focusedNodePath = toSignal(inject(DependencyMapReadStore).focusedNodePath$, { requireSync: true })

    /** The graph holds only what lies in the focus, so a node from outside it clears the focus. */
    receive(nodePath: string): void {
        if (!isInsideFocus(nodePath, this.focusedNodePath())) {
            this.writeStore.unfocus()
        }
        this.viewStore.requestFit()
    }
}

function isInsideFocus(nodePath: string, focusedNodePath: string | undefined): boolean {
    return !focusedNodePath || nodePath === focusedNodePath || nodePath.startsWith(`${focusedNodePath}/`)
}
