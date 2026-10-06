import { computed, Injectable, inject, signal } from "@angular/core"
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

type Selection = { kind: "box"; path: string } | { kind: "edge"; id: string } | null

const NOTHING_POINTED_AT: readonly DependencyLeafEdge[] = []

/** What is selected in the graph and what the inspector beside it says of that. The state lasts for the session. */
@Injectable({ providedIn: "root" })
export class DependencyInspectorStore {
    private readonly graphModel = inject(DependencyGraphModelStore)
    private readonly viewStore = inject(DependencyMapViewStore)
    private readonly writeStore = inject(DependencyMapWriteStore)
    private readonly selectedNodePath$ = inject(DependencyMapReadStore).selectedNodePath$
    private readonly sharedSelectedPath = toSignal(this.selectedNodePath$, { requireSync: true })

    private readonly pointedAt = signal(NOTHING_POINTED_AT)
    private readonly dismissedSubject = signal<string | null>(null)
    private readonly subjectShownInFull = signal<string | null>(null)
    private readonly cyclesAskedFor = signal<{ id: number; boxPath: string } | null>(null)

    readonly edgeColors = computed(() => {
        const { edgeColors, lineStyleShows } = this.graphModel.settings()
        return edgeColorsAsDrawn(edgeColors, lineStyleShows)
    })

    private readonly selection = computed((): Selection => {
        const inGraph = this.viewStore.graphSelection()
        const sharedPath = this.sharedSelectedPath()
        if (inGraph && inGraph.sharedPath === sharedPath) {
            return inGraph.kind === "edge" ? { kind: "edge", id: inGraph.path } : { kind: "box", path: inGraph.path }
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
        const node = selection?.kind === "box" ? this.graphModel.nodesByPath().get(selection.path) : undefined
        if (!node) {
            return null
        }
        const parent = this.graphModel.parentsByPath().get(node.path) ?? null
        return { kind: "box", node, parent, isOpen: this.viewStore.expandedPaths().has(node.path) }
    })
    private readonly subjectId = computed(() => {
        const subject = this.subject()
        return subject && (subject.kind === "edge" ? `edge ${subject.edge.id}` : `box ${subject.node.path}`)
    })

    /** A map that tells no declarations has nothing the inspector could add to the graph. */
    readonly model = computed((): InspectorModel | null => {
        const subject = this.subject()
        const index = this.graphModel.declarationIndex()
        if (!subject || index.declarations.size === 0 || this.dismissedSubject() === this.subjectId()) {
            return null
        }
        const rowLimit = this.subjectShownInFull() === this.subjectId() ? Number.POSITIVE_INFINITY : INSPECTOR_ROW_LIMIT
        const { chains, isComplete } = this.graphModel.cycleSearch()
        return describeSubject(subject, {
            index,
            rowLimit,
            cycles: chains,
            mayMissCycles: !isComplete,
            edgeMetric: this.graphModel.edgeMetric(),
            pointsUpward: this.graphModel.pointsUpward()
        })
    })

    /** Each dependency pointed at lights up the edge it is drawn as, or drawn in. */
    readonly highlightedEdgeIds = computed((): ReadonlySet<string> => {
        const boxOf = (path: string) => this.graphModel.boxStandingFor(path)
        return new Set(
            this.pointedAt().map(declarationEdge => edgeIdOf(boxOf(fromPathOf(declarationEdge)), boxOf(toPathOf(declarationEdge))))
        )
    })

    /** A subject the reader selects anew is shown again, whichever view it is selected in. */
    constructor() {
        this.selectedNodePath$.pipe(takeUntilDestroyed()).subscribe(() => this.dismissedSubject.set(null))
    }

    select(boxPath: string): void {
        const nodePath = this.graphModel.nodePathOf(boxPath)
        this.viewStore.selectInGraph(nodePath === boxPath ? null : { kind: "box", path: boxPath, sharedPath: nodePath })
        this.dismissedSubject.set(null)
        this.cyclesAskedFor.set(null)
        if (nodePath === null) {
            this.writeStore.clearSelection()
        } else {
            this.writeStore.selectNode(nodePath)
        }
    }

    selectEdge(edgeId: string): void {
        this.viewStore.selectInGraph({ kind: "edge", path: edgeId, sharedPath: null })
        this.dismissedSubject.set(null)
        this.writeStore.clearSelection()
    }

    showCyclesOf(boxPath: string): void {
        const id = (this.cyclesAskedFor()?.id ?? 0) + 1
        this.select(boxPath)
        this.cyclesAskedFor.set({ id, boxPath })
    }

    goTo(reference: InspectorReference): void {
        this.viewStore.reveal(reference.path)
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
            this.viewStore.selectInGraph(null)
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
        this.subjectShownInFull.set(this.subjectId())
    }

    dismiss(): void {
        this.dismissedSubject.set(this.subjectId())
        this.pointAt(null)
    }

    /** Opens what hides the two declarations of each dependency and moves the graph so that they are in view. */
    private revealEndsOf(declarationEdges: readonly DependencyLeafEdge[]): void {
        const ends = [...new Set(declarationEdges.flatMap(declarationEdge => [fromPathOf(declarationEdge), toPathOf(declarationEdge)]))]
        for (const path of ends) {
            this.viewStore.reveal(path)
        }
        this.bringIntoView(ends)
    }

    private bringIntoView(paths: readonly string[]): void {
        this.viewStore.bringIntoView(paths.flatMap(path => this.graphModel.boxStandingFor(path) ?? []))
    }
}
