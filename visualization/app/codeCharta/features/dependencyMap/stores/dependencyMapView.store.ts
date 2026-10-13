import { Injectable, inject, signal, untracked } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import {
    BoxOffset,
    boxPathOf,
    collapsedFirstLook,
    containerPathsOf,
    LeveledNode,
    TreeIndex,
    ViewRequest
} from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { DependencyMapReadStore } from "./dependencyMap.read.store"

interface RevealsAwaitingAdoption {
    layoutIdentity: string
    paths: string[]
}

@Injectable({ providedIn: "root" })
export class DependencyMapViewStore {
    private readonly readStore = inject(DependencyMapReadStore)
    private readonly currentLayoutIdentity = toSignal(this.readStore.layoutIdentity$, { requireSync: true })
    private readonly currentLoadedFilesIdentity = toSignal(this.readStore.loadedFilesIdentity$, { requireSync: true })
    private readonly layoutIdentityOfTheOpenedBoxes = signal<string | null>(null)
    private readonly openedBoxes = signal<ReadonlySet<string>>(new Set())
    private readonly movedBoxes = signal<ReadonlyMap<string, BoxOffset>>(new Map())
    private readonly draggedOrder = signal<readonly string[]>([])
    private readonly boxBeingDragged = signal<string | null>(null)
    private readonly fitRequestCount = signal(0)
    private readonly hoveredInGraph = signal<string | null>(null)
    private readonly askedIntoView = signal<ViewRequest | null>(null)
    private readonly pixelsUnderTheBar = signal(0)
    private revealsAwaitingAdoption: RevealsAwaitingAdoption | null = null
    private adoptedTree: TreeIndex | null = null
    private loadedFilesIdentityOfTheOpenedBoxes: string | null = null

    readonly adoptedLayoutIdentity = this.layoutIdentityOfTheOpenedBoxes.asReadonly()
    readonly expandedPaths = this.openedBoxes.asReadonly()
    readonly boxOffsets = this.movedBoxes.asReadonly()
    /** Dragged boxes, the most recently dragged last, so it paints over the others. */
    readonly raisedPaths = this.draggedOrder.asReadonly()
    readonly draggingPath = this.boxBeingDragged.asReadonly()
    readonly fitRequest = this.fitRequestCount.asReadonly()
    /** The box under the pointer, which the shared hover names only by the node it belongs to. */
    readonly hoveredBoxPath = this.hoveredInGraph.asReadonly()
    readonly viewRequest = this.askedIntoView.asReadonly()
    /** How many pixels at the bottom of the graph lie under the bar floating over it. */
    readonly coveredBottom = this.pixelsUnderTheBar.asReadonly()

    adoptTree(tree: TreeIndex): void {
        const layoutIdentity = this.currentLayoutIdentity()
        const previousRootPath = this.adoptedTree?.root.path
        this.adoptedTree = tree
        if (layoutIdentity === untracked(this.layoutIdentityOfTheOpenedBoxes)) {
            if (tree.root.path !== previousRootPath) {
                this.openTheMovedRoot(tree.root)
            }
            return
        }
        const loadedFilesIdentity = untracked(this.currentLoadedFilesIdentity)
        if (loadedFilesIdentity === this.loadedFilesIdentityOfTheOpenedBoxes) {
            this.keepOpenedBoxesAcrossFocusChange(tree, layoutIdentity, previousRootPath)
            return
        }
        this.loadedFilesIdentityOfTheOpenedBoxes = loadedFilesIdentity
        this.startOver(tree.root, layoutIdentity)
    }

    coverBottom(pixels: number): void {
        this.pixelsUnderTheBar.set(pixels)
    }

    hoverInGraph(path: string | null): void {
        this.hoveredInGraph.set(path)
    }

    bringIntoView(paths: readonly string[]): void {
        this.askedIntoView.update(request => ({ id: (request?.id ?? 0) + 1, paths }))
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
    reveal(paths: readonly string[]): void {
        this.openBoxesHolding(paths)
        const layoutIdentity = untracked(this.currentLayoutIdentity)
        if (layoutIdentity !== untracked(this.layoutIdentityOfTheOpenedBoxes)) {
            this.awaitAdoptionToReveal(layoutIdentity, paths)
        }
    }

    openBox(path: string): void {
        this.reveal([path])
        const boxPath = (this.adoptedTree && boxPathOf(this.adoptedTree, path)) ?? path
        this.openedBoxes.update(opened => new Set([...opened, boxPath]))
    }

    toggle(boxPath: string): void {
        this.openedBoxes.update(opened => {
            const next = new Set(opened)
            if (!next.delete(boxPath)) {
                next.add(boxPath)
            }
            return next
        })
    }

    private startOver(tree: LeveledNode, layoutIdentity: string): void {
        this.layoutIdentityOfTheOpenedBoxes.set(layoutIdentity)
        this.openedBoxes.set(collapsedFirstLook(tree))
        this.resetLayout()
        this.revealTheAwaitingPaths(layoutIdentity)
    }

    /** A reveal that waited for this focus says what to show; without one, the folder whose focus was left is
     * shown where it lies in the graph around it. */
    private keepOpenedBoxesAcrossFocusChange(tree: TreeIndex, layoutIdentity: string, previousRootPath: string | undefined): void {
        this.layoutIdentityOfTheOpenedBoxes.set(layoutIdentity)
        this.openTheMovedRoot(tree.root)
        const hasRevealedAwaitingPaths = this.revealTheAwaitingPaths(layoutIdentity)
        // The folder that was the root lies inside the new tree only when its focus was left, not when one was entered.
        const leftFolder = previousRootPath === undefined ? null : boxPathOf(tree, previousRootPath)
        const hasLeftAFocusedFolder = leftFolder !== null && leftFolder !== tree.root.path
        if (hasLeftAFocusedFolder && !hasRevealedAwaitingPaths) {
            this.openBoxesHolding([previousRootPath])
            this.bringIntoView([leftFolder])
        }
    }

    /** An exclusion can fold the one folder left into the root, which then carries that folder's path; left closed,
     * the whole graph would be one box. */
    private openTheMovedRoot(tree: LeveledNode): void {
        if (!untracked(this.openedBoxes).has(tree.path)) {
            this.openedBoxes.update(opened => new Set([...opened, ...collapsedFirstLook(tree)]))
        }
    }

    private awaitAdoptionToReveal(layoutIdentity: string, paths: readonly string[]): void {
        const awaiting = this.revealsAwaitingAdoption
        const earlierPaths = awaiting?.layoutIdentity === layoutIdentity ? awaiting.paths : []
        this.revealsAwaitingAdoption = { layoutIdentity, paths: [...earlierPaths, ...paths] }
    }

    /** Tells whether there were any. */
    private revealTheAwaitingPaths(layoutIdentity: string): boolean {
        const awaiting = this.revealsAwaitingAdoption
        this.revealsAwaitingAdoption = null
        if (awaiting?.layoutIdentity !== layoutIdentity) {
            return false
        }
        this.openBoxesHolding(awaiting.paths)
        return true
    }

    private openBoxesHolding(paths: readonly string[]): void {
        const boxesAround = (path: string) => (this.adoptedTree && containerPathsOf(this.adoptedTree, path)) ?? []
        this.openedBoxes.update(opened => new Set([...opened, ...paths.flatMap(ancestorsOf), ...paths.flatMap(boxesAround)]))
    }
}

/** The folders around a node, read from its path: all that is known of it before the tree it lies in is. */
function ancestorsOf(path: string): string[] {
    const segments = path.split("/")
    return segments.slice(2).map((_, index) => segments.slice(0, index + 2).join("/"))
}
