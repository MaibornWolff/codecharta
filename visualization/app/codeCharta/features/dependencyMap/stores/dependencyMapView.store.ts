import { Injectable, signal } from "@angular/core"
import { EdgeFilter, expandWithinBudget, LeveledNode } from "../../../renderer/dependencyGraph/dependencyGraph.facade"

/** How many boxes a first look opens folders up to: enough to show structure, few enough to read. */
const FIRST_LOOK_BOX_BUDGET = 60

/** What the reader opened and which edges they asked for. View state of this view alone, so it is kept
 * for as long as the app runs and never persisted. */
@Injectable({ providedIn: "root" })
export class DependencyMapViewStore {
    private readonly openedFolders = signal<ReadonlySet<string>>(new Set())
    private readonly shownEdges = signal<EdgeFilter>("all")
    private rootOfTheOpenedFolders: string | null = null

    readonly expandedPaths = this.openedFolders.asReadonly()
    readonly edgeFilter = this.shownEdges.asReadonly()

    /** A new project, or a new focus, starts from a first look; the same one keeps what was opened. */
    adoptTree(tree: LeveledNode): void {
        if (tree.path === this.rootOfTheOpenedFolders) {
            return
        }
        this.rootOfTheOpenedFolders = tree.path
        this.openedFolders.set(expandWithinBudget(tree, FIRST_LOOK_BOX_BUDGET))
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
}
