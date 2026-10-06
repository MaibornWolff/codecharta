import { NgTemplateOutlet } from "@angular/common"
import { ChangeDetectionStrategy, Component, ElementRef, effect, input, output, signal, untracked, viewChild } from "@angular/core"
import { DependencyLeafEdge } from "../../../../model/codeCharta.model"
import { DependencyEdgeColors } from "../../../../model/dependencyGraph.model"
import {
    declarationKindLookOf,
    EDGE_TYPE_LABELS,
    KIND_ICON_COLORS,
    LineStyle
} from "../../../../renderer/dependencyGraph/dependencyGraph.facade"
import { PanelActionKind, PanelCycle, PanelModel, PanelRef } from "../../panel/panelModel"

const ACTION_LABELS: Record<PanelActionKind, string> = {
    open: "Open in graph",
    close: "Close in graph",
    unfold: "Unfold in graph"
}

const COPY_FEEDBACK_MS = 1500
const PLAIN_LINE: LineStyle = { dash: null, head: "filled" }

const REF_ICONS: Record<"folder" | "file", string> = { folder: "fa fa-folder-o", file: "fa fa-file-o" }

@Component({
    selector: "cc-dependency-panel",
    templateUrl: "./dependencyPanel.component.html",
    imports: [NgTemplateOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "flex h-full w-80 shrink-0 flex-col bg-base-100 shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.15)]" }
})
export class DependencyPanelComponent {
    readonly model = input.required<PanelModel>()
    /** Raising this counter brings the cycles into view and sets them off from the rest. */
    readonly cyclesRequest = input(0)
    readonly edgeColors = input.required<DependencyEdgeColors>()

    readonly refChosen = output<PanelRef>()
    /** The dependencies under the pointer, for the graph to light up; null once it left. */
    readonly dependenciesPointedAt = output<readonly DependencyLeafEdge[] | null>()
    readonly actionChosen = output<PanelActionKind>()
    readonly cycleShown = output<PanelCycle>()
    readonly allRowsRequested = output<void>()
    readonly closed = output<void>()

    private readonly cyclesSection = viewChild<ElementRef<HTMLElement>>("cyclesSection")
    private shownCyclesRequest = 0

    readonly actionLabels = ACTION_LABELS
    readonly edgeTypeLabels = EDGE_TYPE_LABELS
    readonly iconColors = KIND_ICON_COLORS
    readonly plainLine = PLAIN_LINE
    readonly copied = signal(false)
    private copyFeedbackTimeout?: ReturnType<typeof setTimeout>
    /** The cycles stay set off for as long as the selection they were asked for lasts. */
    readonly focusedPath = signal<string | null>(null)

    constructor() {
        effect(() => {
            const request = this.cyclesRequest()
            const section = this.cyclesSection()?.nativeElement
            if (section && request !== this.shownCyclesRequest) {
                this.shownCyclesRequest = request
                this.focusedPath.set(untracked(this.model).path)
                section.scrollIntoView?.({ block: "start" })
            }
        })
    }

    async copyPath(): Promise<void> {
        const text = this.model().copyText
        if (!text) {
            return
        }
        await navigator.clipboard.writeText(text)
        this.copied.set(true)
        clearTimeout(this.copyFeedbackTimeout)
        this.copyFeedbackTimeout = setTimeout(() => this.copied.set(false), COPY_FEEDBACK_MS)
    }

    iconOf(ref: PanelRef): string {
        return ref.kind === "declaration" ? "" : REF_ICONS[ref.kind]
    }

    kindLookOf(ref: PanelRef) {
        return declarationKindLookOf(ref.declarationKind)
    }
}
