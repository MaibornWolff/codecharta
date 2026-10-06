import { ChangeDetectionStrategy, Component, computed, effect, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import {
    boxAtPoint,
    canBeOpened,
    DependencyGraphComponent,
    DependencyGraphScene,
    type DraggedBox,
    isDraggable,
    layoutLevelized,
    movedLayout,
    namedByOwnLevel,
    type Point,
    projectEdges,
    type RightClickedBox,
    visibleRepresentatives
} from "../../../../renderer/dependencyGraph/dependencyGraph.facade"
import { ViewReadinessStore } from "../../../../routing/viewReadiness.store"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"
import { DependencyMapWriteStore } from "../../stores/dependencyMap.write.store"
import { DependencyMapViewStore } from "../../stores/dependencyMapView.store"

@Component({
    selector: "cc-dependency-map",
    templateUrl: "./dependencyMap.component.html",
    imports: [DependencyGraphComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: "fixed inset-x-0 z-0 top-[var(--cc-bars-height,49px)] bottom-[var(--cc-bottom-bar-height,32px)]",
        "[class.hidden]": "isLoadingFile()"
    }
})
export class DependencyMapComponent {
    private readonly readStore = inject(DependencyMapReadStore)
    private readonly writeStore = inject(DependencyMapWriteStore)
    private readonly viewStore = inject(DependencyMapViewStore)
    private readonly viewReadinessStore = inject(ViewReadinessStore)

    protected readonly isDeltaState = toSignal(this.readStore.isDeltaState$, { requireSync: true })
    protected readonly isLoadingFile = toSignal(inject(FileStoreReadWindow).isLoadingFile$, { initialValue: false })
    protected readonly hasDependencyData = toSignal(this.readStore.hasDependencyData$, { requireSync: true })
    protected readonly isFocused = toSignal(this.readStore.isFocused$, { requireSync: true })
    protected readonly graphIdentity = computed(() => this.viewStore.adoptedLayoutIdentity() ?? "")
    protected readonly fitRequest = this.viewStore.fitRequest

    private readonly tree = toSignal(this.readStore.tree$, { requireSync: true })
    private readonly focusedFolderLevelPath = toSignal(this.readStore.focusedFolderLevelPath$, { requireSync: true })
    private readonly edges = toSignal(this.readStore.edges$, { requireSync: true })
    private readonly declarations = toSignal(this.readStore.declarations$, { requireSync: true })
    private readonly edgeMetric = toSignal(this.readStore.sharedEdgeMetric$, { requireSync: true })
    private readonly settings = toSignal(this.readStore.persistedSettings$, { requireSync: true })
    private readonly hoveredPath = toSignal(this.readStore.hoveredNodePath$, { requireSync: true })
    private readonly selectedPath = toSignal(this.readStore.selectedNodePath$, { requireSync: true })
    private readonly searchedPaths = toSignal(this.readStore.searchedPaths$, { requireSync: true })

    private readonly layout = computed(() => {
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
    private readonly shownLayout = computed(() => {
        const layout = this.layout()
        return layout ? movedLayout(layout, this.viewStore.boxOffsets()) : null
    })
    protected readonly boxAt = (point: Point) => {
        const layout = this.shownLayout()
        return layout === null ? null : boxAtPoint(layout, this.viewStore.raisedPaths(), point)
    }
    protected readonly canDragBox = (path: string) => {
        const layout = this.shownLayout()
        return layout !== null && isDraggable(layout, path)
    }
    private readonly representatives = computed(() => {
        const tree = this.tree()
        return tree ? visibleRepresentatives(tree, this.viewStore.expandedPaths()) : new Map<string, string>()
    })
    private readonly projectedEdges = computed(() =>
        projectEdges(this.edges(), this.representatives(), this.edgeMetric(), this.declarations().leafEdges)
    )
    private readonly boxes = computed(() => new Map(this.layout()?.boxes.map(box => [box.path, box])))
    private readonly selectedBoxPath = computed(() => {
        const inGraph = this.viewStore.graphSelection()
        const sharedPath = this.selectedPath()
        return this.boxStandingFor(inGraph?.sharedPath === sharedPath ? inGraph.path : sharedPath)
    })

    protected readonly scene = computed((): DependencyGraphScene | null => {
        const layout = this.shownLayout()
        if (!layout) {
            return null
        }
        const { shownEdgeTypes, edgeStyle, isAnchoredAtSideMiddle, edgeWidth } = this.settings()
        return {
            layout,
            edges: this.projectedEdges(),
            edgeMetric: this.edgeMetric(),
            shownEdgeTypes,
            edgeStyle,
            isAnchoredAtSideMiddle,
            edgeWidth,
            hoveredPath: this.boxStandingFor(this.viewStore.hoveredBoxPath() ?? this.hoveredPath()),
            selectedPath: this.selectedBoxPath(),
            raisedPaths: this.viewStore.raisedPaths(),
            draggingPath: this.viewStore.draggingPath(),
            searchedPaths: this.searchedPaths()
        }
    })

    constructor() {
        effect(() => {
            const tree = this.tree()
            if (tree) {
                this.viewStore.adoptTree(tree)
            }
        })
        effect(() => {
            if (!this.scene() || this.isDeltaState()) {
                this.markReady()
            }
        })
    }

    protected select(path: string): void {
        const nodePath = this.nodePathOf(path)
        this.viewStore.selectInGraph(nodePath === path ? null : { path, sharedPath: nodePath })
        this.writeStore.selectNode(nodePath)
    }

    protected toggle(path: string): void {
        const box = this.boxes().get(path)
        if (box && canBeOpened(box)) {
            this.viewStore.toggle(path)
        }
    }

    protected hover(path: string | null): void {
        this.viewStore.hoverInGraph(path)
        this.writeStore.hoverNode(path === null ? null : this.nodePathOf(path))
    }

    protected openContextMenu({ path, clientX, clientY }: RightClickedBox): void {
        this.writeStore.openContextMenu(this.nodePathOf(path), clientX, clientY)
    }

    protected moveBox({ path, deltaX, deltaY }: DraggedBox): void {
        const [offsetX, offsetY] = this.viewStore.boxOffsets().get(path) ?? [0, 0]
        this.viewStore.placeBox(path, [offsetX + deltaX, offsetY + deltaY])
    }

    protected endDragging(): void {
        this.viewStore.endDragging()
    }

    protected unfocus(): void {
        this.writeStore.unfocus()
    }

    protected markReady(): void {
        this.viewReadinessStore.markReady("dependencies")
    }

    /** A declaration is no node of the map; its file stands for it wherever the other views are told. */
    private nodePathOf(boxPath: string): string {
        const box = this.boxes().get(boxPath)
        return box?.kind === "declaration" ? box.parentPath : boxPath
    }

    private boxStandingFor(path: string | null): string | null {
        return path === null ? null : (this.representatives().get(path) ?? null)
    }
}
