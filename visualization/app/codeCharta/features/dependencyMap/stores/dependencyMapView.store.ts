import { Injectable, inject, signal, untracked } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { BoxOffset, collapsedFirstLook, LeveledNode } from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { DependencyMapReadStore } from "./dependencyMap.read.store"

interface RevealsAwaitingAdoption {
    layoutIdentity: string
    paths: string[]
}

@Injectable({ providedIn: "root" })
export class DependencyMapViewStore {
    private readonly currentLayoutIdentity = toSignal(inject(DependencyMapReadStore).layoutIdentity$, { requireSync: true })
    private readonly layoutIdentityOfTheOpenedFolders = signal<string | null>(null)
    private readonly openedFolders = signal<ReadonlySet<string>>(new Set())
    private readonly movedBoxes = signal<ReadonlyMap<string, BoxOffset>>(new Map())
    private readonly draggedOrder = signal<readonly string[]>([])
    private readonly boxBeingDragged = signal<string | null>(null)
    private revealsAwaitingAdoption: RevealsAwaitingAdoption | null = null

    readonly adoptedLayoutIdentity = this.layoutIdentityOfTheOpenedFolders.asReadonly()
    readonly expandedPaths = this.openedFolders.asReadonly()
    readonly boxOffsets = this.movedBoxes.asReadonly()
    /** Dragged boxes, the most recently dragged last, so it paints over the others. */
    readonly raisedPaths = this.draggedOrder.asReadonly()
    readonly draggingPath = this.boxBeingDragged.asReadonly()

    adoptTree(tree: LeveledNode): void {
        const layoutIdentity = this.currentLayoutIdentity()
        if (layoutIdentity === untracked(this.layoutIdentityOfTheOpenedFolders)) {
            return
        }
        this.layoutIdentityOfTheOpenedFolders.set(layoutIdentity)
        this.openedFolders.set(collapsedFirstLook(tree))
        this.resetLayout()
        this.revealTheAwaitingPaths(layoutIdentity)
    }

    placeBox(path: string, offset: BoxOffset): void {
        this.boxBeingDragged.set(path)
        this.movedBoxes.update(moved => new Map(moved).set(path, offset))
        if (this.draggedOrder().at(-1) !== path) {
            this.draggedOrder.update(order => [...order.filter(raised => raised !== path), path])
        }
    }

    endDragging(): void {
        this.boxBeingDragged.set(null)
    }

    resetLayout(): void {
        this.movedBoxes.set(new Map())
        this.draggedOrder.set([])
    }

    /** A reveal arriving before the tree of the loaded files is adopted, as on the way in from another view, is
     * repeated once it is, since adopting a tree closes every folder. */
    reveal(path: string): void {
        this.openFoldersHolding([path])
        const layoutIdentity = untracked(this.currentLayoutIdentity)
        if (layoutIdentity !== untracked(this.layoutIdentityOfTheOpenedFolders)) {
            this.awaitAdoptionToReveal(layoutIdentity, path)
        }
    }

    toggle(folderPath: string): void {
        this.openedFolders.update(opened => {
            const next = new Set(opened)
            if (!next.delete(folderPath)) {
                next.add(folderPath)
            }
            return next
        })
    }

    private awaitAdoptionToReveal(layoutIdentity: string, path: string): void {
        const awaiting = this.revealsAwaitingAdoption
        const earlierPaths = awaiting?.layoutIdentity === layoutIdentity ? awaiting.paths : []
        this.revealsAwaitingAdoption = { layoutIdentity, paths: [...earlierPaths, path] }
    }

    private revealTheAwaitingPaths(layoutIdentity: string): void {
        const awaiting = this.revealsAwaitingAdoption
        this.revealsAwaitingAdoption = null
        if (awaiting?.layoutIdentity === layoutIdentity) {
            this.openFoldersHolding(awaiting.paths)
        }
    }

    private openFoldersHolding(paths: string[]): void {
        this.openedFolders.update(opened => new Set([...opened, ...paths.flatMap(ancestorsOf)]))
    }
}

function ancestorsOf(path: string): string[] {
    const segments = path.split("/")
    return segments.slice(2).map((_, index) => segments.slice(0, index + 2).join("/"))
}
