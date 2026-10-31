import { computed, effect, Injectable, inject, signal, untracked } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ThreeSceneService } from "../../../renderer/threeViewer/threeViewer.facade"
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
    private readonly threeSceneService = inject(ThreeSceneService)
    private readonly keptHighlightPaths = toSignal(inject(SharedViewReadWindow).keptHighlightPaths$, { requireSync: true })

    private readonly pin = signal<ClusterPin | null>(null)
    private readonly hoveredPaths = signal<string[] | null>(null)
    /** A hover shows its cluster alone, so what is kept waits here until the hover ends. */
    private keptBeforeHover: string[] = []

    // Anything that clears the kept highlight, such as selecting a building, also ends the pin. A hover replaces
    // the kept highlight for its own sake, which says nothing about the pin.
    readonly pinnedClusterId = computed(() => {
        const pin = this.pin()
        if (pin === null || this.hoveredPaths() !== null) {
            return pin?.clusterId ?? null
        }
        const keptPaths = new Set(this.keptHighlightPaths())
        return pin.filePaths.every(path => keptPaths.has(path)) ? pin.clusterId : null
    })

    constructor() {
        effect(() => {
            if (this.pinnedClusterId() === null) {
                untracked(() => this.showActiveClusterOnMap())
            }
        })
    }

    hover(filePaths: string[]): void {
        if (this.hoveredPaths() === null) {
            this.keptBeforeHover = this.keptHighlightPaths()
        }
        this.hoveredPaths.set(filePaths)
        this.showActiveClusterOnMap()
        this.nodeInteraction.replaceKeptHighlight(filePaths)
    }

    endHover(): void {
        if (this.hoveredPaths() === null) {
            return
        }
        this.hoveredPaths.set(null)
        this.nodeInteraction.replaceKeptHighlight(this.keptBeforeHover)
        this.showActiveClusterOnMap()
    }

    togglePin(clusterId: string, filePaths: string[]): void {
        const isPinned = this.pinnedClusterId() === clusterId
        this.releasePin()
        if (!isPinned) {
            const restingPaths = new Set(this.restingKeptPaths())
            const pathsLitByPin = filePaths.filter(path => !restingPaths.has(path))
            this.writeRestingKeptPaths([...restingPaths, ...pathsLitByPin])
            this.pin.set({ clusterId, filePaths, pathsLitByPin })
        }
        this.showActiveClusterOnMap()
    }

    private restingKeptPaths(): string[] {
        return this.hoveredPaths() === null ? this.keptHighlightPaths() : this.keptBeforeHover
    }

    private writeRestingKeptPaths(paths: string[]): void {
        if (this.hoveredPaths() === null) {
            this.nodeInteraction.replaceKeptHighlight(paths)
        } else {
            this.keptBeforeHover = paths
        }
    }

    private showActiveClusterOnMap(): void {
        const pinnedPaths = this.pinnedClusterId() === null ? null : (this.pin()?.filePaths ?? null)
        const shownPaths = this.hoveredPaths() ?? pinnedPaths
        this.threeSceneService.setKeptHighlightFocus(shownPaths === null ? null : new Set(shownPaths))
    }

    private releasePin(): void {
        const pin = this.pin()
        if (pin !== null) {
            const litByPin = new Set(pin.pathsLitByPin)
            this.writeRestingKeptPaths(this.restingKeptPaths().filter(path => !litByPin.has(path)))
            this.pin.set(null)
        }
    }
}
