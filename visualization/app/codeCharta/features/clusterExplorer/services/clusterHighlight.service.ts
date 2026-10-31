import { computed, Injectable, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { SharedViewReadWindow } from "../../../stores/sharedView/sharedView.read.facade"
import { NodeInteraction } from "../../../stores/sharedView/sharedView.write.facade"

interface ClusterPin {
    clusterId: string
    filePaths: string[]
    /** Only what the pin lit itself, so that unpinning leaves files kept by other means alone. */
    pathsLitByPin: string[]
}

/** Lives as long as the app, because the kept highlight it writes outlives a view being left and entered again. */
@Injectable({ providedIn: "root" })
export class ClusterHighlightService {
    private readonly nodeInteraction = inject(NodeInteraction)
    private readonly keptHighlightPaths = toSignal(inject(SharedViewReadWindow).keptHighlightPaths$, { requireSync: true })

    private readonly pin = signal<ClusterPin | null>(null)
    private pathsLitByHover: string[] = []

    // Anything that clears the kept highlight, such as selecting a building, also ends the pin.
    readonly pinnedClusterId = computed(() => {
        const pin = this.pin()
        if (pin === null) {
            return null
        }
        const keptPaths = new Set(this.keptHighlightPaths())
        return pin.filePaths.every(path => keptPaths.has(path)) ? pin.clusterId : null
    })

    hover(filePaths: string[]): void {
        this.endHover()
        const keptPaths = new Set(this.keptHighlightPaths())
        this.pathsLitByHover = filePaths.filter(path => !keptPaths.has(path))
        if (this.pathsLitByHover.length > 0) {
            this.nodeInteraction.keepHighlight(this.pathsLitByHover)
        }
    }

    endHover(): void {
        if (this.pathsLitByHover.length > 0) {
            this.nodeInteraction.removeKeptHighlight(this.pathsLitByHover)
        }
        this.pathsLitByHover = []
    }

    togglePin(clusterId: string, filePaths: string[]): void {
        const isPinned = this.pinnedClusterId() === clusterId
        this.releasePin()
        if (isPinned) {
            return
        }
        const litByHover = this.pathsLitByHover
        this.pathsLitByHover = []
        const keptPaths = new Set(this.keptHighlightPaths())
        const newlyLit = filePaths.filter(path => !keptPaths.has(path))
        this.nodeInteraction.keepHighlight(newlyLit)
        this.pin.set({ clusterId, filePaths, pathsLitByPin: [...new Set([...litByHover, ...newlyLit])] })
    }

    private releasePin(): void {
        const pin = this.pin()
        if (pin !== null) {
            this.nodeInteraction.removeKeptHighlight(pin.pathsLitByPin)
            this.pin.set(null)
        }
    }
}
