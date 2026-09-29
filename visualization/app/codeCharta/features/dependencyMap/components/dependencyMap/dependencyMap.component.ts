import { ChangeDetectionStrategy, Component, computed, effect, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import {
    BoxOffset,
    boxAtPoint,
    DependencyGraphComponent,
    DependencyGraphScene,
    type DraggedBox,
    isDraggable,
    layoutLevelized,
    movedLayout,
    projectEdges,
    type RightClickedBox,
    visibleRepresentatives,
    withoutHidden
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

    private readonly wholeTree = toSignal(this.readStore.tree$, { requireSync: true })
    private readonly tree = computed(() => {
        const tree = this.wholeTree()
        return tree ? withoutHidden(tree, this.viewStore.hiddenPaths()) : null
    })
    private readonly edges = toSignal(this.readStore.edges$, { requireSync: true })
    private readonly hoveredPath = toSignal(this.readStore.hoveredNodePath$, { requireSync: true })
    private readonly selectedPath = toSignal(this.readStore.selectedNodePath$, { requireSync: true })
    private readonly searchedPaths = toSignal(this.readStore.searchedPaths$, { requireSync: true })

    private readonly layout = computed(() => {
        const tree = this.tree()
        return tree ? layoutLevelized(tree, this.viewStore.expandedPaths()) : null
    })
    private readonly shownLayout = computed(() => {
        const layout = this.layout()
        return layout ? movedLayout(layout, this.viewStore.boxOffsets()) : null
    })
    protected readonly hasMovedBoxes = computed(() => this.viewStore.boxOffsets().size > 0)
    protected readonly boxAt = (point: BoxOffset) => {
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
    private readonly folderPaths = computed(
        () =>
            new Set(
                this.layout()
                    ?.boxes.filter(box => box.isFolder)
                    .map(box => box.path)
            )
    )

    protected readonly scene = computed((): DependencyGraphScene | null => {
        const layout = this.shownLayout()
        if (!layout) {
            return null
        }
        return {
            layout,
            edges: projectEdges(this.edges(), this.representatives()),
            edgeFilter: this.viewStore.edgeFilter(),
            edgeStyle: this.viewStore.edgeStyle(),
            isAnchoredAtSideMiddle: this.viewStore.isAnchoredAtSideMiddle(),
            edgeWidth: this.viewStore.edgeWidth(),
            hoveredPath: this.boxStandingFor(this.hoveredPath()),
            selectedPath: this.boxStandingFor(this.selectedPath()),
            raisedPaths: this.viewStore.raisedPaths(),
            draggingPath: this.viewStore.draggingPath(),
            searchedPaths: this.searchedPaths()
        }
    })

    constructor() {
        effect(() => {
            const tree = this.wholeTree()
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
        this.writeStore.selectNode(path)
    }

    protected toggle(path: string): void {
        if (this.folderPaths().has(path)) {
            this.viewStore.toggle(path)
        }
    }

    protected hover(path: string | null): void {
        this.writeStore.hoverNode(path)
    }

    protected openContextMenu({ path, clientX, clientY }: RightClickedBox): void {
        this.writeStore.openContextMenu(path, clientX, clientY)
    }

    protected moveBox({ path, dx, dy }: DraggedBox): void {
        const [offsetX, offsetY] = this.viewStore.boxOffsets().get(path) ?? [0, 0]
        this.viewStore.placeBox(path, [offsetX + dx, offsetY + dy])
    }

    protected endDragging(): void {
        this.viewStore.endDragging()
    }

    protected resetLayout(): void {
        this.viewStore.resetLayout()
    }

    protected markReady(): void {
        this.viewReadinessStore.markReady("dependencies")
    }

    private boxStandingFor(path: string | null): string | null {
        return path === null ? null : (this.representatives().get(path) ?? null)
    }
}
