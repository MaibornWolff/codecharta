import { Injectable, inject, signal } from "@angular/core"
import { ExplorerCollapseService } from "./explorerCollapse.service"

const REVEAL_HIGHLIGHT_DURATION_MS = 1500

export interface RevealOptions {
    /**
     * Whether to force the panel open. True for a user-initiated reveal ("Show in Explorer" — the user
     * asked to see the node). False when the reveal is a side effect of something else, such as a newly
     * loaded file restoring a selection: overriding a deliberately collapsed panel there is a surprise.
     */
    expand: boolean
}

@Injectable({ providedIn: "root" })
export class ExplorerRevealService {
    private readonly collapseService = inject(ExplorerCollapseService)
    private readonly internalRevealedNodePath = signal<string | null>(null)
    private clearRevealTimeout: ReturnType<typeof setTimeout> | null = null

    readonly revealedNodePath = this.internalRevealedNodePath.asReadonly()

    revealNode(path: string, options: RevealOptions = { expand: true }) {
        if (options.expand) {
            this.collapseService.expand()
        }
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
