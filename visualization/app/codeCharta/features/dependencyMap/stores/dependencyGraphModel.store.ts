import { computed, Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { DependencyHierarchy } from "../../../model/dependencyGraph.model"
import {
    arrangedByPackages,
    isPackagePath,
    type LeveledNode,
    layoutLevelized,
    movedLayout,
    namedByOwnLevel,
    projectEdges,
    upwardRuleOf,
    visibleRepresentatives
} from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { findCycleChains, MAX_CYCLE_WALKS } from "../panel/cycleChains"
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

    private readonly folderTree = toSignal(this.readStore.tree$, { requireSync: true })
    private readonly hasNamespaces = toSignal(this.readStore.hasNamespaces$, { requireSync: true })

    readonly declarations = toSignal(this.readStore.declarations$, { requireSync: true })
    readonly edgeMetric = toSignal(this.readStore.sharedEdgeMetric$, { requireSync: true })
    readonly settings = toSignal(this.readStore.persistedSettings$, { requireSync: true })

    readonly hierarchy = computed((): DependencyHierarchy => (this.hasNamespaces() ? this.viewStore.hierarchy() : "folders"))
    readonly tree = computed(() => {
        const folderTree = this.folderTree()
        const { namespaces, leaves } = this.declarations()
        return folderTree && this.hierarchy() === "packages" ? arrangedByPackages(folderTree, namespaces, leaves) : folderTree
    })
    readonly nodesByPath = computed(() => indexedByPath(this.tree()))
    readonly parentsByPath = computed(() => parentsIn(this.tree()))
    private readonly drawnFilePaths = computed(
        () => new Set([...this.nodesByPath().values()].flatMap(node => (node.kind === "file" ? [node.path] : [])))
    )
    readonly declarationIndex = computed(() => indexDeclarations(this.declarations(), this.drawnFilePaths()))
    /** Every cycle between drawn declarations, found once: the badges count them and the panel tells them. */
    readonly cycleSearch = computed(() => findCycleChains(this.declarationIndex(), MAX_CYCLE_WALKS))

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
        projectEdges(this.edges(), this.representatives(), this.edgeMetric(), {
            leafEdges: this.declarations().leafEdges,
            hierarchy: this.hierarchy()
        })
    )

    /** Whether a dependency between declarations is drawn pointing upward in the hierarchy shown. */
    readonly pointsUpward = computed(() => upwardRuleOf(this.edges(), this.hierarchy()))

    /** The box on screen that stands for a node or declaration, which may be hidden in a closed one. */
    boxStandingFor(path: string | null): string | null {
        return path === null ? null : (this.representatives().get(path) ?? null)
    }

    /** What the other views are told for a box: a declaration is no node of the map, so its file stands for it,
     * and a package is none either, with nothing to stand for it. */
    nodePathOf(path: string): string | null {
        return isPackagePath(path) ? null : (this.declarationIndex().declarations.get(path)?.filePath ?? path)
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

function parentsIn(tree: LeveledNode | null): ReadonlyMap<string, LeveledNode> {
    const parents = new Map<string, LeveledNode>()
    const visit = (node: LeveledNode) => {
        for (const child of node.children) {
            parents.set(child.path, node)
            visit(child)
        }
    }
    if (tree) {
        visit(tree)
    }
    return parents
}
