import { Injectable, signal } from "@angular/core"
import { EdgeFilter, EdgeStyle, expandWithinBudget, LeveledNode } from "../../../renderer/dependencyGraph/dependencyGraph.facade"

/** How many boxes a first look opens folders up to: enough to show structure, few enough to read. */
const FIRST_LOOK_BOX_BUDGET = 60

/** What the reader opened, hid and which edges they asked for. View state of this view alone, so it is
 * kept for as long as the app runs and never persisted. */
@Injectable({ providedIn: "root" })
export class DependencyMapViewStore {
    private readonly openedFolders = signal<ReadonlySet<string>>(new Set())
    private readonly shownEdges = signal<EdgeFilter>("all")
    private readonly drawnEdges = signal<EdgeStyle>("curved")
    private readonly hiddenNodes = signal<ReadonlySet<string>>(new Set())
    private rootOfTheOpenedFolders: string | null = null

    readonly expandedPaths = this.openedFolders.asReadonly()
    readonly edgeFilter = this.shownEdges.asReadonly()
    readonly edgeStyle = this.drawnEdges.asReadonly()
    readonly hiddenPaths = this.hiddenNodes.asReadonly()

    /** A new project, or a new focus, starts from a first look with nothing hidden; the same one keeps
     * what was opened and hidden. */
    adoptTree(tree: LeveledNode): void {
        if (tree.path === this.rootOfTheOpenedFolders) {
            return
        }
        this.rootOfTheOpenedFolders = tree.path
        this.openedFolders.set(expandWithinBudget(tree, FIRST_LOOK_BOX_BUDGET))
        this.hiddenNodes.set(new Set())
    }

    hide(path: string): void {
        this.hiddenNodes.update(hidden => new Set([...hidden, path]))
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

    showEdges(filter: EdgeFilter): void {
        this.shownEdges.set(filter)
    }

    drawEdgesAs(style: EdgeStyle): void {
        this.drawnEdges.set(style)
    }
}
