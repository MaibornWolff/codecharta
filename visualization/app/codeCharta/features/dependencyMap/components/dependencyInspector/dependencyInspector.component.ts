import { NgTemplateOutlet } from "@angular/common"
import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, input, output, untracked, viewChild } from "@angular/core"
import { DependencyLeafEdge } from "../../../../model/codeCharta.model"
import { DependencyEdgeColors } from "../../../../model/dependencyGraph.model"
import { declarationKindLookOf, EDGE_TYPE_LABELS, KIND_ICON_COLORS } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"
import { CopyToClipboardService } from "../../../../util/copyToClipboard.service"
import { InspectorActionKind, InspectorCycle, InspectorModel, InspectorReference } from "../../inspector/inspectorModel"

const ACTION_LABELS: Record<InspectorActionKind, string> = {
    open: "Open in graph",
    close: "Close in graph",
    unfold: "Unfold in graph"
}

const REFERENCE_ICONS: Record<"folder" | "file", string> = { folder: "fa fa-folder-o", file: "fa fa-file-o" }

@Component({
    selector: "cc-dependency-inspector",
    templateUrl: "./dependencyInspector.component.html",
    imports: [NgTemplateOutlet],
    providers: [CopyToClipboardService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "flex h-full w-80 shrink-0 flex-col bg-base-100 shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.15)]" }
})
export class DependencyInspectorComponent {
    readonly model = input.required<InspectorModel>()
    /** A new number brings the cycles into view; null asks for nothing. */
    readonly cyclesRequest = input<number | null>(null)
    readonly edgeColors = input.required<DependencyEdgeColors>()

    readonly referenceChosen = output<InspectorReference>()
    /** The dependencies under the pointer, for the graph to light up; null once it left. */
    readonly dependenciesPointedAt = output<readonly DependencyLeafEdge[] | null>()
    readonly actionChosen = output<InspectorActionKind>()
    readonly cycleShown = output<InspectorCycle>()
    readonly allRowsRequested = output<void>()
    readonly closed = output<void>()

    private readonly cyclesSection = viewChild<ElementRef<HTMLElement>>("cyclesSection")
    private shownCyclesRequest: number | null = null
    private readonly clipboard = inject(CopyToClipboardService)

    readonly actionLabels = ACTION_LABELS
    readonly edgeTypeLabels = EDGE_TYPE_LABELS
    readonly iconColors = KIND_ICON_COLORS
    readonly copied = this.clipboard.copied

    constructor() {
        effect(() => {
            const request = this.cyclesRequest()
            const section = this.cyclesSection()?.nativeElement
            if (section && request !== null && request !== this.shownCyclesRequest) {
                this.shownCyclesRequest = request
                section.scrollIntoView?.({ block: "start" })
            }
        })
        effect(() => {
            this.model().path
            untracked(() => this.clipboard.reset())
        })
    }

    /** Without a clipboard to write to, as on a page served over plain http, nothing is copied and nothing says so. */
    async copyPath(): Promise<void> {
        const text = this.model().copyText
        if (text) {
            await this.clipboard.copy(text).catch(() => undefined)
        }
    }

    readonly icons = REFERENCE_ICONS

    kindLookOf(reference: InspectorReference) {
        return declarationKindLookOf(reference.declarationKind)
    }
}
