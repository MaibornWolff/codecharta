import { Injectable, signal } from "@angular/core"
import { BoxOffset, collapsedFirstLook, LeveledNode } from "../../../renderer/dependencyGraph/dependencyGraph.facade"

/** What the reader opened and moved. View state of this view alone, so it is kept for as long as the app runs and
 * never persisted. */
@Injectable({ providedIn: "root" })
export class DependencyMapViewStore {
    private readonly openedFolders = signal<ReadonlySet<string>>(new Set())
    private readonly movedBoxes = signal<ReadonlyMap<string, BoxOffset>>(new Map())
    private readonly draggedOrder = signal<readonly string[]>([])
    private readonly boxBeingDragged = signal<string | null>(null)
    private rootOfTheOpenedFolders: string | null = null

    readonly expandedPaths = this.openedFolders.asReadonly()
    readonly boxOffsets = this.movedBoxes.asReadonly()
    /** Dragged boxes, the most recently dragged last, so it paints over the others. */
    readonly raisedPaths = this.draggedOrder.asReadonly()
    readonly draggingPath = this.boxBeingDragged.asReadonly()

    /** A new project, or a new focus, starts collapsed with nothing moved; the same one keeps what was
     * opened and moved. */
    adoptTree(tree: LeveledNode): void {
        if (tree.path === this.rootOfTheOpenedFolders) {
            return
        }
        this.rootOfTheOpenedFolders = tree.path
        this.openedFolders.set(collapsedFirstLook(tree))
        this.resetLayout()
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

    /** Opens every folder holding the node, so its own box is on screen. */
    reveal(path: string): void {
        this.openedFolders.update(opened => new Set([...opened, ...ancestorsOf(path)]))
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
}

function ancestorsOf(path: string): string[] {
    const segments = path.split("/")
    return segments.slice(2).map((_, index) => segments.slice(0, index + 2).join("/"))
}
