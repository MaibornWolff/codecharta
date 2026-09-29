import { Injectable, signal } from "@angular/core"
import { DEPENDENCY_EDGE_TYPES, DependencyEdgeType } from "../../../lenses/dependency/dependencyLens.facade"
import {
    BoxOffset,
    collapsedFirstLook,
    DEFAULT_EDGE_WIDTH,
    EdgeStyle,
    EdgeThickness,
    EdgeWidth,
    LeveledNode
} from "../../../renderer/dependencyGraph/dependencyGraph.facade"

/** What the reader opened, hid and moved, and which edges they asked for. View state of this view alone, so it is
 * kept for as long as the app runs and never persisted. */
@Injectable({ providedIn: "root" })
export class DependencyMapViewStore {
    private readonly openedFolders = signal<ReadonlySet<string>>(new Set())
    private readonly shownEdges = signal<readonly DependencyEdgeType[]>(DEPENDENCY_EDGE_TYPES)
    private readonly drawnEdges = signal<EdgeStyle>("curved")
    private readonly edgesAtSideMiddle = signal(false)
    private readonly edgeLineWidth = signal<EdgeWidth>(DEFAULT_EDGE_WIDTH)
    private readonly hiddenNodes = signal<ReadonlySet<string>>(new Set())
    private readonly movedBoxes = signal<ReadonlyMap<string, BoxOffset>>(new Map())
    private readonly draggedOrder = signal<readonly string[]>([])
    private readonly boxBeingDragged = signal<string | null>(null)
    private rootOfTheOpenedFolders: string | null = null

    readonly expandedPaths = this.openedFolders.asReadonly()
    readonly shownEdgeTypes = this.shownEdges.asReadonly()
    readonly edgeStyle = this.drawnEdges.asReadonly()
    readonly isAnchoredAtSideMiddle = this.edgesAtSideMiddle.asReadonly()
    readonly edgeWidth = this.edgeLineWidth.asReadonly()
    readonly hiddenPaths = this.hiddenNodes.asReadonly()
    readonly boxOffsets = this.movedBoxes.asReadonly()
    /** Dragged boxes, the most recently dragged last, so it paints over the others. */
    readonly raisedPaths = this.draggedOrder.asReadonly()
    readonly draggingPath = this.boxBeingDragged.asReadonly()

    /** A new project, or a new focus, starts collapsed with nothing hidden or moved; the same one
     * keeps what was opened, hidden and moved. */
    adoptTree(tree: LeveledNode): void {
        if (tree.path === this.rootOfTheOpenedFolders) {
            return
        }
        this.rootOfTheOpenedFolders = tree.path
        this.openedFolders.set(collapsedFirstLook(tree))
        this.hiddenNodes.set(new Set())
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

    hide(path: string): void {
        this.hiddenNodes.update(hidden => new Set([...hidden, path]))
    }

    /** Hidden itself, or inside a hidden folder. */
    isHidden(path: string): boolean {
        return [...this.hiddenNodes()].some(hiddenPath => isSameOrInside(path, hiddenPath))
    }

    /** Brings the node back, and the hidden folders holding it with it. */
    show(path: string): void {
        this.hiddenNodes.update(hidden => new Set([...hidden].filter(hiddenPath => !isSameOrInside(path, hiddenPath))))
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

    showEdgeTypes(types: readonly DependencyEdgeType[]): void {
        this.shownEdges.set(types)
    }

    drawEdgesAs(style: EdgeStyle): void {
        this.drawnEdges.set(style)
    }

    anchorAtSideMiddle(isAnchored: boolean): void {
        this.edgesAtSideMiddle.set(isAnchored)
    }

    drawEdgesThick(thickness: EdgeThickness): void {
        this.edgeLineWidth.update(width => ({ ...width, thickness }))
    }

    scaleEdgeWidth(factor: number): void {
        this.edgeLineWidth.update(width => ({ ...width, factor }))
    }
}

function isSameOrInside(path: string, folderPath: string): boolean {
    return path === folderPath || path.startsWith(`${folderPath}/`)
}

function ancestorsOf(path: string): string[] {
    const segments = path.split("/")
    return segments.slice(2).map((_, index) => segments.slice(0, index + 2).join("/"))
}
