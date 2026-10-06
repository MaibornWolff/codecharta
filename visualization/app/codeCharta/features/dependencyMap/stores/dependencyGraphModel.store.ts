import { computed, Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import {
    type LeveledNode,
    layoutLevelized,
    movedLayout,
    namedByOwnLevel,
    projectEdges,
    visibleRepresentatives
} from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { indexDeclarations } from "../panel/declarationIndex"
import { DependencyMapReadStore } from "./dependencyMap.read.store"
import { DependencyMapViewStore } from "./dependencyMapView.store"

/** What the graph draws and the panel explains, derived once from the map and from what the reader opened. */
@Injectable({ providedIn: "root" })
export class DependencyGraphModelStore {
    private readonly readStore = inject(DependencyMapReadStore)
    private readonly viewStore = inject(DependencyMapViewStore)

    private readonly focusedFolderLevelPath = toSignal(this.readStore.focusedFolderLevelPath$, { requireSync: true })
    private readonly edges = toSignal(this.readStore.edges$, { requireSync: true })

    readonly tree = toSignal(this.readStore.tree$, { requireSync: true })
    readonly declarations = toSignal(this.readStore.declarations$, { requireSync: true })
    readonly edgeMetric = toSignal(this.readStore.sharedEdgeMetric$, { requireSync: true })
    readonly settings = toSignal(this.readStore.persistedSettings$, { requireSync: true })

    readonly declarationIndex = computed(() => indexDeclarations(this.declarations()))
    readonly nodesByPath = computed(() => indexedByPath(this.tree()))

    readonly layout = computed(() => {
        const tree = this.tree()
        if (!tree) {
            return null
        }
        const { levelLabel, declarationArrangement } = this.settings()
        const layout = layoutLevelized(tree, this.viewStore.expandedPaths(), {
            levelPathOfTree: this.focusedFolderLevelPath(),
            declarationArrangement
        })
        return levelLabel === "path" ? layout : namedByOwnLevel(layout)
    })
    readonly shownLayout = computed(() => {
        const layout = this.layout()
        return layout ? movedLayout(layout, this.viewStore.boxOffsets()) : null
    })
    readonly boxes = computed(() => new Map(this.layout()?.boxes.map(box => [box.path, box])))
    readonly representatives = computed(() => {
        const tree = this.tree()
        return tree ? visibleRepresentatives(tree, this.viewStore.expandedPaths()) : new Map<string, string>()
    })
    readonly projectedEdges = computed(() =>
        projectEdges(this.edges(), this.representatives(), this.edgeMetric(), this.declarations().leafEdges)
    )

    /** The box on screen that stands for a node or declaration, which may be hidden in a closed one. */
    boxStandingFor(path: string | null): string | null {
        return path === null ? null : (this.representatives().get(path) ?? null)
    }

    /** A declaration is no node of the map; its file stands for it wherever the other views are told. */
    nodePathOf(path: string): string {
        return this.declarationIndex().declarations.get(path)?.filePath ?? path
    }
}

function indexedByPath(tree: LeveledNode | null): ReadonlyMap<string, LeveledNode> {
    const nodes = new Map<string, LeveledNode>()
    const visit = (node: LeveledNode) => {
        for (const path of [node.path, ...(node.foldedPaths ?? [])]) {
            nodes.set(path, node)
        }
        node.children.forEach(visit)
    }
    if (tree) {
        visit(tree)
    }
    return nodes
}
