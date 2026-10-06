import { Injectable, inject, signal, untracked } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { BoxOffset, boxPathOf, collapsedFirstLook, LeveledNode } from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { DependencyMapReadStore } from "./dependencyMap.read.store"

/** Something only the graph can select: a declaration is no node of the map, so the shared selection holds its
 * file, and an edge is none either, so the shared selection is empty. The graph's own selection lasts for as
 * long as the shared one still is what it was set to. */
export interface GraphSelection {
    kind: "box" | "edge"
    /** A box's path or an edge's id. */
    path: string
    sharedPath: string | null
}

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
    private readonly fitRequestCount = signal(0)
    private readonly selectedInGraph = signal<GraphSelection | null>(null)
    private readonly hoveredInGraph = signal<string | null>(null)
    private revealsAwaitingAdoption: RevealsAwaitingAdoption | null = null
    private adoptedTree: LeveledNode | null = null

    readonly adoptedLayoutIdentity = this.layoutIdentityOfTheOpenedFolders.asReadonly()
    readonly expandedPaths = this.openedFolders.asReadonly()
    readonly boxOffsets = this.movedBoxes.asReadonly()
    /** Dragged boxes, the most recently dragged last, so it paints over the others. */
    readonly raisedPaths = this.draggedOrder.asReadonly()
    readonly draggingPath = this.boxBeingDragged.asReadonly()
    readonly fitRequest = this.fitRequestCount.asReadonly()
    readonly graphSelection = this.selectedInGraph.asReadonly()
    /** The box under the pointer, which the shared hover names only by the node it belongs to. */
    readonly hoveredBoxPath = this.hoveredInGraph.asReadonly()

    adoptTree(tree: LeveledNode): void {
        const layoutIdentity = this.currentLayoutIdentity()
        const hasRootMoved = tree.path !== this.adoptedTree?.path
        this.adoptedTree = tree
        if (layoutIdentity !== untracked(this.layoutIdentityOfTheOpenedFolders)) {
            this.startOver(tree, layoutIdentity)
        } else if (hasRootMoved) {
            this.openTheMovedRoot(tree)
        }
    }

    selectInGraph(selection: GraphSelection | null): void {
        this.selectedInGraph.set(selection)
    }

    hoverInGraph(path: string | null): void {
        this.hoveredInGraph.set(path)
    }

    requestFit(): void {
        this.fitRequestCount.update(count => count + 1)
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

    openFolder(folderPath: string): void {
        this.reveal(folderPath)
        const boxPath = (this.adoptedTree && boxPathOf(this.adoptedTree, folderPath)) ?? folderPath
        this.openedFolders.update(opened => new Set([...opened, boxPath]))
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

    private startOver(tree: LeveledNode, layoutIdentity: string): void {
        this.layoutIdentityOfTheOpenedFolders.set(layoutIdentity)
        this.openedFolders.set(collapsedFirstLook(tree))
        this.resetLayout()
        this.selectedInGraph.set(null)
        this.revealTheAwaitingPaths(layoutIdentity)
    }

    /** An exclusion can fold the one folder left into the root, which then carries that folder's path; left closed,
     * the whole graph would be one box. */
    private openTheMovedRoot(tree: LeveledNode): void {
        if (!untracked(this.openedFolders).has(tree.path)) {
            this.openedFolders.update(opened => new Set([...opened, ...collapsedFirstLook(tree)]))
        }
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
