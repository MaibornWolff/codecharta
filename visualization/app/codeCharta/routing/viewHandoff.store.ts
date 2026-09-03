import { Injectable, signal } from "@angular/core"
import { ViewId } from "./routePaths"

/** Carries the node a jump was started on over to the view the user lands in. */
@Injectable({ providedIn: "root" })
export class ViewHandoffStore {
    private readonly handedOverNode = signal<{ view: ViewId; nodePath: string } | null>(null)

    handOverNode(view: ViewId, nodePath: string): void {
        this.handedOverNode.set({ view, nodePath })
    }

    /** Returns the node handed over to that view once, so a later arrival does not repeat the jump. */
    takeNodeFor(view: ViewId): string | null {
        const handedOverNode = this.handedOverNode()
        if (handedOverNode?.view !== view) {
            return null
        }
        this.handedOverNode.set(null)
        return handedOverNode.nodePath
    }
}
