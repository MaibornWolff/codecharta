import { computed, Injectable, inject, signal, untracked } from "@angular/core"
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop"
import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { edgeColorsAsDrawn, edgeIdOf } from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { fromPathOf, toPathOf } from "../declarations/declarationIndex"
import {
    describeSubject,
    INSPECTOR_ROW_LIMIT,
    InspectorActionKind,
    InspectorCycle,
    InspectorModel,
    InspectorReference,
    InspectorSubject
} from "../inspector/inspectorModel"
import { DependencyGraphModelStore } from "./dependencyGraphModel.store"
import { DependencyMapReadStore } from "./dependencyMap.read.store"
import { DependencyMapWriteStore } from "./dependencyMap.write.store"
import { DependencyMapViewStore } from "./dependencyMapView.store"

type Selection = { kind: "box"; path: string } | { kind: "edge"; id: string }

/** Something only the graph can select: a declaration is no node of the map, so the shared selection holds its
 * file, and an edge or a package is none either, so the shared selection is empty. It lasts for as long as the
 * shared selection is what it was set to and the same files are drawn. */
interface GraphSelection {
    selection: Selection
    sharedPath: string | null
    layoutIdentity: string | null
}

/** What the reader did to the inspector of one subject; it is forgotten with the next subject. */
interface SubjectView {
    subjectId: string | null
    isDismissed: boolean
    showsAllRows: boolean
}

const NOTHING_POINTED_AT: readonly DependencyLeafEdge[] = []
const UNTOUCHED: SubjectView = { subjectId: null, isDismissed: false, showsAllRows: false }

@Injectable({ providedIn: "root" })
export class DependencyInspectorStore {
    private readonly graphModel = inject(DependencyGraphModelStore)
    private readonly viewStore = inject(DependencyMapViewStore)
    private readonly writeStore = inject(DependencyMapWriteStore)
    private readonly readStore = inject(DependencyMapReadStore)
    private readonly selectedNodePath$ = this.readStore.selectedNodePath$
    private readonly sharedSelectedPath = toSignal(this.selectedNodePath$, { requireSync: true })
    private readonly isDeltaState = toSignal(this.readStore.isDeltaState$, { requireSync: true })

    private readonly selectedInGraph = signal<GraphSelection | null>(null)
    private readonly pointedAt = signal(NOTHING_POINTED_AT)
    private readonly touchedView = signal(UNTOUCHED)
    private readonly cyclesAskedFor = signal<{ id: number; boxPath: string } | null>(null)

    readonly edgeColors = computed(() => {
        const { edgeColors, lineStyleShows } = this.graphModel.settings()
        return edgeColorsAsDrawn(edgeColors, lineStyleShows)
    })

    private readonly selection = computed((): Selection | null => {
        const inGraph = this.selectedInGraph()
        const sharedPath = this.sharedSelectedPath()
        if (inGraph?.sharedPath === sharedPath && inGraph.layoutIdentity === this.viewStore.adoptedLayoutIdentity()) {
            return inGraph.selection
        }
        return sharedPath ? { kind: "box", path: sharedPath } : null
    })
    private readonly selectedEdge = computed(() => {
        const selection = this.selection()
        return selection?.kind === "edge" ? (this.graphModel.projectedEdges().find(edge => edge.id === selection.id) ?? null) : null
    })

    /** The request to bring the cycles into view, for as long as the box they were asked of is selected. */
    readonly cyclesRequest = computed(() => {
        const asked = this.cyclesAskedFor()
        const selection = this.selection()
        return asked && selection?.kind === "box" && selection.path === asked.boxPath ? asked.id : null
    })

    readonly selectedBoxPath = computed(() => {
        const selection = this.selection()
        return selection?.kind === "box" ? this.graphModel.boxStandingFor(selection.path) : null
    })
    readonly selectedEdgeId = computed(() => this.selectedEdge()?.id ?? null)

    private readonly subject = computed((): InspectorSubject | null => {
        const selection = this.selection()
        const edge = this.selectedEdge()
        if (edge) {
            const nameOf = (path: string) => this.graphModel.boxes().get(path)?.name ?? path
            return { kind: "edge", edge, fromName: nameOf(edge.fromPath), toName: nameOf(edge.toPath) }
        }
        const tree = this.graphModel.treeIndex()
        const node = selection?.kind === "box" ? tree?.nodeAt.get(selection.path) : undefined
        if (!node) {
            return null
        }
        const parent = tree.parentOf.get(node.path) ?? null
        return { kind: "box", node, parent, isOpen: this.viewStore.expandedPaths().has(node.path) }
    })
    private readonly subjectId = computed(() => {
        const subject = this.subject()
        return subject && (subject.kind === "edge" ? `edge ${subject.edge.id}` : `box ${subject.node.path}`)
    })
    private readonly subjectView = computed(() => {
        const touched = this.touchedView()
        return touched.subjectId === this.subjectId() ? touched : UNTOUCHED
    })

    /** A map that tells no declarations has nothing the inspector could add to the graph. */
    readonly model = computed((): InspectorModel | null => {
        const subject = this.subject()
        const index = this.graphModel.declarationIndex()
        const { isDismissed, showsAllRows } = this.subjectView()
        if (!subject || index.declarations.size === 0 || isDismissed) {
            return null
        }
        const { chains, isComplete } = this.graphModel.cycleSearch()
        return describeSubject(subject, {
            index,
            rowLimit: showsAllRows ? Number.POSITIVE_INFINITY : INSPECTOR_ROW_LIMIT,
            cycles: chains,
            mayMissCycles: !isComplete,
            edgeMetric: this.graphModel.edgeMetric(),
            pointsUpward: this.graphModel.pointsUpward()
        })
    })

    /** Compare mode draws no graph, and no inspector beside it. */
    readonly isShown = computed(() => this.model() !== null && !this.isDeltaState())

    /** Each dependency pointed at lights up the edge it is drawn as, or drawn in. */
    readonly highlightedEdgeIds = computed((): ReadonlySet<string> => {
        const boxOf = (path: string) => this.graphModel.boxStandingFor(path)
        return new Set(
            this.pointedAt().map(declarationEdge => edgeIdOf(boxOf(fromPathOf(declarationEdge)), boxOf(toPathOf(declarationEdge))))
        )
    })

    /** The graph's own selection ends for good once the shared one has moved on: selecting the same node again
     * later selects that node, not what the graph once showed of it. And a subject the reader selects anew is
     * shown again, whichever view it is selected in. */
    constructor() {
        this.selectedNodePath$.pipe(takeUntilDestroyed()).subscribe(sharedPath => {
            if (untracked(this.selectedInGraph)?.sharedPath !== sharedPath) {
                this.selectedInGraph.set(null)
            }
            this.showAgain()
        })
    }

    select(boxPath: string): void {
        const nodePath = this.graphModel.nodePathOf(boxPath)
        this.selectInGraph(nodePath === boxPath ? null : { kind: "box", path: boxPath }, nodePath)
        this.cyclesAskedFor.set(null)
        if (nodePath === null) {
            this.writeStore.clearSelection()
        } else {
            this.writeStore.selectNode(nodePath)
        }
    }

    selectEdge(edgeId: string): void {
        this.selectInGraph({ kind: "edge", id: edgeId }, null)
        this.writeStore.clearSelection()
    }

    showCyclesOf(boxPath: string): void {
        const id = (this.cyclesAskedFor()?.id ?? 0) + 1
        this.select(boxPath)
        this.cyclesAskedFor.set({ id, boxPath })
    }

    /** A request is answered once, so an inspector shown anew does not answer it again. */
    answerCyclesRequest(): void {
        this.cyclesAskedFor.set(null)
    }

    goTo(reference: InspectorReference): void {
        this.viewStore.reveal([reference.path])
        this.select(reference.path)
        this.pointAt(null)
        this.bringIntoView([reference.path])
    }

    pointAt(declarationEdges: readonly DependencyLeafEdge[] | null): void {
        this.pointedAt.set(declarationEdges ?? NOTHING_POINTED_AT)
    }

    perform(action: InspectorActionKind): void {
        const subject = this.subject()
        if (subject?.kind === "edge" && action === "unfold") {
            this.selectedInGraph.set(null)
            this.revealEndsOf(subject.edge.declarationEdges)
        } else if (subject?.kind === "box" && action === "open") {
            this.viewStore.openBox(subject.node.path)
            this.bringIntoView([subject.node.path])
        } else if (subject?.kind === "box") {
            this.viewStore.toggle(subject.node.path)
        }
    }

    showCycle(cycle: InspectorCycle): void {
        this.revealEndsOf(cycle.declarationEdges)
        this.pointAt(cycle.declarationEdges)
    }

    showAllRows(): void {
        this.touchedView.set({ subjectId: this.subjectId(), isDismissed: false, showsAllRows: true })
    }

    dismiss(): void {
        this.touchedView.set({ ...this.subjectView(), subjectId: this.subjectId(), isDismissed: true })
        this.pointAt(null)
    }

    private selectInGraph(selection: Selection | null, sharedPath: string | null): void {
        const layoutIdentity = untracked(this.viewStore.adoptedLayoutIdentity)
        this.selectedInGraph.set(selection && { selection, sharedPath, layoutIdentity })
        this.showAgain()
    }

    private showAgain(): void {
        this.touchedView.update(view => (view.isDismissed ? { ...view, isDismissed: false } : view))
    }

    private revealEndsOf(declarationEdges: readonly DependencyLeafEdge[]): void {
        const ends = [...new Set(declarationEdges.flatMap(declarationEdge => [fromPathOf(declarationEdge), toPathOf(declarationEdge)]))]
        this.viewStore.reveal(ends)
        this.bringIntoView(ends)
    }

    private bringIntoView(paths: readonly string[]): void {
        this.viewStore.bringIntoView(paths.flatMap(path => this.graphModel.boxStandingFor(path) ?? []))
    }
}
