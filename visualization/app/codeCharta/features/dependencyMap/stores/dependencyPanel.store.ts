import { computed, Injectable, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { DependencyLeafEdge } from "../../../model/codeCharta.model"
import { edgeColorsAsDrawn } from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { fromPathOf, toPathOf } from "../panel/declarationIndex"
import { describeSubject, PANEL_ROW_LIMIT, PanelActionKind, PanelCycle, PanelModel, PanelRef, PanelSubject } from "../panel/panelModel"
import { DependencyGraphModelStore } from "./dependencyGraphModel.store"
import { DependencyMapReadStore } from "./dependencyMap.read.store"
import { DependencyMapWriteStore } from "./dependencyMap.write.store"
import { DependencyMapViewStore } from "./dependencyMapView.store"

type Selection = { kind: "box"; path: string } | { kind: "edge"; id: string } | null

const NOTHING_POINTED_AT: readonly DependencyLeafEdge[] = []

/** What is selected in the graph and what the panel beside it says of that. The state lasts for the session. */
@Injectable({ providedIn: "root" })
export class DependencyPanelStore {
    private readonly graphModel = inject(DependencyGraphModelStore)
    private readonly viewStore = inject(DependencyMapViewStore)
    private readonly writeStore = inject(DependencyMapWriteStore)
    private readonly sharedSelectedPath = toSignal(inject(DependencyMapReadStore).selectedNodePath$, { requireSync: true })

    private readonly pointedAt = signal(NOTHING_POINTED_AT)
    private readonly dismissedSubject = signal<string | null>(null)
    private readonly subjectShownInFull = signal<string | null>(null)
    private readonly cyclesRequestCount = signal(0)

    readonly cyclesRequest = this.cyclesRequestCount.asReadonly()
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

    readonly selectedBoxPath = computed(() => {
        const selection = this.selection()
        return selection?.kind === "box" ? this.graphModel.boxStandingFor(selection.path) : null
    })
    readonly selectedEdgeId = computed(() => this.selectedEdge()?.id ?? null)

    private readonly subject = computed((): PanelSubject | null => {
        const selection = this.selection()
        const edge = this.selectedEdge()
        if (edge) {
            const nameOf = (path: string) => this.graphModel.boxes().get(path)?.name ?? path
            return { kind: "edge", edge, fromName: nameOf(edge.fromPath), toName: nameOf(edge.toPath) }
        }
        const node = selection?.kind === "box" ? this.graphModel.nodesByPath().get(selection.path) : undefined
        return node ? { kind: "box", node, isOpen: this.viewStore.expandedPaths().has(node.path) } : null
    })
    private readonly subjectId = computed(() => {
        const subject = this.subject()
        return subject && (subject.kind === "edge" ? `edge ${subject.edge.id}` : `box ${subject.node.path}`)
    })

    /** A map that tells no declarations has nothing the panel could add to the graph. */
    readonly model = computed((): PanelModel | null => {
        const subject = this.subject()
        const index = this.graphModel.declarationIndex()
        if (!subject || index.declarations.size === 0 || this.dismissedSubject() === this.subjectId()) {
            return null
        }
        const rowLimit = this.subjectShownInFull() === this.subjectId() ? Number.POSITIVE_INFINITY : PANEL_ROW_LIMIT
        return describeSubject(subject, { index, rowLimit, pointsUpward: this.graphModel.pointsUpward() })
    })

    /** Each dependency pointed at lights up the edge it is drawn as, or drawn in. */
    readonly highlightedEdgeIds = computed((): ReadonlySet<string> => {
        const boxOf = (path: string) => this.graphModel.boxStandingFor(path)
        return new Set(this.pointedAt().map(leafEdge => `${boxOf(fromPathOf(leafEdge))}|${boxOf(toPathOf(leafEdge))}`))
    })

    select(boxPath: string): void {
        const nodePath = this.graphModel.nodePathOf(boxPath)
        this.viewStore.selectInGraph(nodePath === boxPath ? null : { kind: "box", path: boxPath, sharedPath: nodePath })
        this.dismissedSubject.set(null)
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
        this.select(boxPath)
        this.cyclesRequestCount.update(count => count + 1)
    }

    goTo(ref: PanelRef): void {
        this.viewStore.reveal(ref.path)
        this.select(ref.path)
        this.bringIntoView([ref.path])
    }

    pointAt(leafEdges: readonly DependencyLeafEdge[] | null): void {
        this.pointedAt.set(leafEdges ?? NOTHING_POINTED_AT)
    }

    perform(action: PanelActionKind): void {
        const subject = this.subject()
        if (subject?.kind === "edge" && action === "unfold") {
            this.revealEndsOf(subject.edge.declarationEdges)
        } else if (subject?.kind === "box") {
            this.viewStore.toggle(subject.node.path)
        }
    }

    showCycle(cycle: PanelCycle): void {
        this.revealEndsOf(cycle.leafEdges)
        this.pointAt(cycle.leafEdges)
    }

    showAllRows(): void {
        this.subjectShownInFull.set(this.subjectId())
    }

    dismiss(): void {
        this.dismissedSubject.set(this.subjectId())
        this.pointAt(null)
    }

    /** Opens what hides the two declarations of each dependency and moves the graph so that they are in view. */
    private revealEndsOf(leafEdges: readonly DependencyLeafEdge[]): void {
        const ends = [...new Set(leafEdges.flatMap(leafEdge => [fromPathOf(leafEdge), toPathOf(leafEdge)]))]
        for (const path of ends) {
            this.viewStore.reveal(path)
        }
        this.bringIntoView(ends)
    }

    private bringIntoView(paths: readonly string[]): void {
        this.viewStore.bringIntoView(paths.flatMap(path => this.graphModel.boxStandingFor(path) ?? []))
    }
}
