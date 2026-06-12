import { inject, Injectable, signal } from "@angular/core"
import { ExplorerCollapseService } from "./explorerCollapse.service"

const REVEAL_HIGHLIGHT_DURATION_MS = 1500

@Injectable({ providedIn: "root" })
export class ExplorerRevealService {
    private readonly collapseService = inject(ExplorerCollapseService)
    private readonly internalRevealedNodePath = signal<string | null>(null)
    private clearRevealTimeout: ReturnType<typeof setTimeout> | null = null

    readonly revealedNodePath = this.internalRevealedNodePath.asReadonly()

    revealNode(path: string) {
        this.collapseService.expand()
        if (this.clearRevealTimeout) {
            clearTimeout(this.clearRevealTimeout)
        }
        this.internalRevealedNodePath.set(path)
        this.clearRevealTimeout = setTimeout(() => {
            this.internalRevealedNodePath.set(null)
            this.clearRevealTimeout = null
        }, REVEAL_HIGHLIGHT_DURATION_MS)
    }
}
