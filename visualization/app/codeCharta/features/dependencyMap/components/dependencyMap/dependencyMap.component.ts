import { ChangeDetectionStrategy, Component, computed, effect, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { isDependencyEdgeMetric } from "../../../../lenses/dependency/dependencyLens.facade"
import {
    boxAtPoint,
    CYCLE_MARK_KINDS,
    canBeOpened,
    DependencyGraphComponent,
    DependencyGraphScene,
    type DraggedBox,
    findCycleMarks,
    findUpwardMarks,
    isDraggable,
    NO_CYCLE_MARKS,
    NO_UPWARD_MARKS,
    type Point,
    type RightClickedBox,
    shownCycleMarks
} from "../../../../renderer/dependencyGraph/dependencyGraph.facade"
import { ViewReadinessStore } from "../../../../routing/viewReadiness.store"
import { FileStoreReadWindow } from "../../../../stores/fileStore/fileStore.facade"
import { declarationsOn } from "../../declarations/cycleChains"
import { DependencyGraphModelStore } from "../../stores/dependencyGraphModel.store"
import { DependencyInspectorStore } from "../../stores/dependencyInspector.store"
import { DependencyMapReadStore } from "../../stores/dependencyMap.read.store"
import { DependencyMapWriteStore } from "../../stores/dependencyMap.write.store"
import { DependencyMapViewStore } from "../../stores/dependencyMapView.store"
import { DependencyInspectorComponent } from "../dependencyInspector/dependencyInspector.component"

@Component({
    selector: "cc-dependency-map",
    templateUrl: "./dependencyMap.component.html",
    imports: [DependencyGraphComponent, DependencyInspectorComponent],
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
    private readonly graphModel = inject(DependencyGraphModelStore)
    private readonly inspectorStore = inject(DependencyInspectorStore)

    protected readonly isDeltaState = toSignal(this.readStore.isDeltaState$, { requireSync: true })
    protected readonly isLoadingFile = toSignal(inject(FileStoreReadWindow).isLoadingFile$, { initialValue: false })
    protected readonly hasDependencyData = toSignal(this.readStore.hasDependencyData$, { requireSync: true })
    protected readonly isFocused = toSignal(this.readStore.isFocused$, { requireSync: true })
    protected readonly graphIdentity = computed(() => this.viewStore.adoptedLayoutIdentity() ?? "")
    protected readonly fitRequest = this.viewStore.fitRequest
    protected readonly viewRequest = this.viewStore.viewRequest
    protected readonly pointedAtBoxPaths = this.inspectorStore.pointedAtBoxPaths
    protected readonly coveredBottom = this.viewStore.coveredBottom

    private readonly hoveredPath = toSignal(this.readStore.hoveredNodePath$, { requireSync: true })
    private readonly searchedPaths = toSignal(this.readStore.searchedPaths$, { requireSync: true })

    protected readonly boxAt = (point: Point) => {
        const layout = this.graphModel.shownLayout()
        return layout === null ? null : boxAtPoint(layout, this.viewStore.raisedPaths(), point)
    }
    protected readonly canDragBox = (path: string) => {
        const layout = this.graphModel.shownLayout()
        return layout !== null && isDraggable(layout, path)
    }
    /** A package holds files whose paths do not lie below its own, so a found file hidden in a closed box is
     * told to the graph as that box. */
    private readonly searchedBoxPaths = computed(() => {
        const searchedPaths = this.searchedPaths()
        const boxOf = this.graphModel.representatives()
        return searchedPaths && new Set([...searchedPaths, ...[...searchedPaths].flatMap(path => boxOf.get(path) ?? [])])
    })
    private readonly cycleMarks = computed(() => {
        const { shownBoxBadges } = this.graphModel.settings()
        const showsCycleMarks = CYCLE_MARK_KINDS.some(kind => shownBoxBadges.includes(kind))
        if (!showsCycleMarks || !isDependencyEdgeMetric(this.graphModel.edgeMetric())) {
            return NO_CYCLE_MARKS
        }
        const cycleMarks = findCycleMarks(this.graphModel.cycleChains().map(declarationsOn), {
            representatives: this.graphModel.representatives(),
            parentOf: boxPath => this.graphModel.boxes().get(boxPath)?.parentPath,
            fileOf: declarationPath => this.graphModel.declarationIndex().declarations.get(declarationPath)?.filePath
        })
        return shownCycleMarks(cycleMarks, shownBoxBadges)
    })
    private readonly upwardMarks = computed(() =>
        this.graphModel.settings().shownBoxBadges.includes("upward") && isDependencyEdgeMetric(this.graphModel.edgeMetric())
            ? findUpwardMarks(this.graphModel.declarations().leafEdges, this.graphModel.representatives(), this.graphModel.pointsUpward())
            : NO_UPWARD_MARKS
    )

    protected readonly scene = computed((): DependencyGraphScene | null => {
        const layout = this.graphModel.shownLayout()
        if (!layout) {
            return null
        }
        const { shownBoxBadges, hierarchy, isHoverHighlighted, ...looks } = this.graphModel.settings()
        return {
            ...looks,
            cycleMarks: this.cycleMarks(),
            upwardMarks: this.upwardMarks(),
            layout,
            edges: this.graphModel.projectedEdges(),
            edgeMetric: this.graphModel.edgeMetric(),
            hoveredPath: isHoverHighlighted ? this.graphModel.boxStandingFor(this.viewStore.hoveredBoxPath() ?? this.hoveredPath()) : null,
            selectedPath: this.inspectorStore.selectedBoxPath(),
            selectedEdgeId: this.inspectorStore.selectedEdgeId(),
            highlightedEdgeIds: this.inspectorStore.highlightedEdgeIds(),
            raisedPaths: this.viewStore.raisedPaths(),
            draggingPath: this.viewStore.draggingPath(),
            searchedPaths: this.searchedBoxPaths()
        }
    })

    constructor() {
        effect(() => {
            const tree = this.graphModel.treeIndex()
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
        this.inspectorStore.select(path)
    }

    protected selectEdge(edgeId: string): void {
        this.inspectorStore.selectEdge(edgeId)
    }

    protected showCyclesOf(path: string): void {
        this.inspectorStore.showSectionOf(path, "cycles")
    }

    protected showUpwardOf(path: string): void {
        this.inspectorStore.showSectionOf(path, "upward")
    }

    protected toggle(path: string): void {
        const box = this.graphModel.boxes().get(path)
        if (box && canBeOpened(box)) {
            this.viewStore.toggle(path)
        }
    }

    protected bringIntoView(path: string): void {
        this.viewStore.bringIntoView([path])
    }

    protected hover(path: string | null): void {
        this.viewStore.hoverInGraph(path)
        this.writeStore.hoverNode(path === null ? null : this.graphModel.nodePathOf(path))
    }

    protected openContextMenu({ path, clientX, clientY }: RightClickedBox): void {
        const nodePath = this.graphModel.nodePathOf(path)
        if (nodePath !== null) {
            this.writeStore.openContextMenu(nodePath, clientX, clientY)
        }
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
}
