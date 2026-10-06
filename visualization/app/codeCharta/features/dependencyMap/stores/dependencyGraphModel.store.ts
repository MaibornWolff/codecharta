import { computed, Injectable, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { DependencyHierarchy } from "../../../model/dependencyGraph.model"
import {
    arrangedByPackages,
    indexTree,
    isDrawnInside,
    isPackagePath,
    layoutLevelized,
    movedLayout,
    namedByOwnLevel,
    projectEdges,
    upwardRuleOf,
    visibleRepresentatives
} from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { findCycleChains } from "../declarations/cycleChains"
import { indexDeclarations } from "../declarations/declarationIndex"
import { DependencyMapReadStore } from "./dependencyMap.read.store"
import { DependencyMapViewStore } from "./dependencyMapView.store"

@Injectable({ providedIn: "root" })
export class DependencyGraphModelStore {
    private readonly readStore = inject(DependencyMapReadStore)
    private readonly viewStore = inject(DependencyMapViewStore)

    private readonly focusedFolderLevelPath = toSignal(this.readStore.focusedFolderLevelPath$, { requireSync: true })
    private readonly edges = toSignal(this.readStore.edges$, { requireSync: true })

    private readonly folderTree = toSignal(this.readStore.tree$, { requireSync: true })
    private readonly hasPackages = toSignal(this.readStore.hasPackages$, { requireSync: true })

    readonly declarations = toSignal(this.readStore.declarations$, { requireSync: true })
    readonly edgeMetric = toSignal(this.readStore.sharedEdgeMetric$, { requireSync: true })
    readonly settings = toSignal(this.readStore.persistedSettings$, { requireSync: true })

    private readonly askedHierarchy = signal<DependencyHierarchy>("folders")
    /** What the reader asked for; a map without packages is shown by its folders all the same. */
    readonly hierarchy = computed((): DependencyHierarchy => (this.hasPackages() ? this.askedHierarchy() : "folders"))
    readonly tree = computed(() => {
        const folderTree = this.folderTree()
        const { namespaces, leaves } = this.declarations()
        return folderTree && this.hierarchy() === "packages" ? arrangedByPackages(folderTree, namespaces, leaves) : folderTree
    })
    readonly treeIndex = computed(() => {
        const tree = this.tree()
        return tree && indexTree(tree)
    })
    private readonly drawnFilePaths = computed(
        () => new Set([...(this.treeIndex()?.nodeAt.values() ?? [])].flatMap(node => (node.kind === "file" ? [node.path] : [])))
    )
    readonly declarationIndex = computed(() => indexDeclarations(this.declarations(), this.drawnFilePaths()))
    /** Every cycle between drawn declarations, found once: the badges count them and the inspector tells them. */
    readonly cycleChains = computed(() => findCycleChains(this.declarationIndex()))

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
    readonly projectedEdges = computed(() => {
        const treeIndex = this.treeIndex()
        return projectEdges(this.edges(), this.representatives(), this.edgeMetric(), {
            declarationEdges: this.declarations().leafEdges,
            hierarchy: this.hierarchy(),
            isInside: (path, holderPath) => Boolean(treeIndex) && isDrawnInside(treeIndex, path, holderPath)
        })
    })

    readonly pointsUpward = computed(() => upwardRuleOf(this.edges(), this.hierarchy()))

    /** The boxes move to other places, so where the reader dragged them to no longer means anything, and the
     * part of the graph that was in view may be empty now. */
    showHierarchy(hierarchy: DependencyHierarchy): void {
        this.askedHierarchy.set(hierarchy)
        this.viewStore.resetLayout()
        this.viewStore.requestFit()
    }

    boxStandingFor(path: string | null): string | null {
        return path === null ? null : (this.representatives().get(path) ?? null)
    }

    /** What the other views are told for a box: a declaration is no node of the map, so its file stands for it,
     * and a package is none either, with nothing to stand for it. */
    nodePathOf(path: string): string | null {
        return isPackagePath(path) ? null : (this.declarationIndex().declarations.get(path)?.filePath ?? path)
    }
}
