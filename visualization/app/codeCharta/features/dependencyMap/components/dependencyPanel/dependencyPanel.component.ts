import { NgTemplateOutlet } from "@angular/common"
import { ChangeDetectionStrategy, Component, ElementRef, effect, input, output, viewChild } from "@angular/core"
import { DependencyLeafEdge } from "../../../../model/codeCharta.model"
import { declarationKindLookOf } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"
import { PanelActionKind, PanelCycle, PanelModel, PanelRef } from "../../panel/panelModel"

const ACTION_LABELS: Record<PanelActionKind, string> = {
    open: "Open in graph",
    close: "Close in graph",
    unfold: "Unfold in graph"
}

const REF_ICONS: Record<"folder" | "file", string> = { folder: "fa fa-folder-o", file: "fa fa-file-o" }

@Component({
    selector: "cc-dependency-panel",
    templateUrl: "./dependencyPanel.component.html",
    imports: [NgTemplateOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "flex h-full w-80 shrink-0 flex-col border-l border-base-300 bg-base-100" }
})
export class DependencyPanelComponent {
    readonly model = input.required<PanelModel>()
    /** Raising this counter brings the cycles into view. */
    readonly cyclesRequest = input(0)

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

    constructor() {
        effect(() => {
            const request = this.cyclesRequest()
            const section = this.cyclesSection()?.nativeElement
            if (section && request !== this.shownCyclesRequest) {
                this.shownCyclesRequest = request
                section.scrollIntoView?.({ block: "start" })
            }
        })
    }

    iconOf(ref: PanelRef): string {
        return ref.kind === "declaration" ? "" : REF_ICONS[ref.kind]
    }

    kindLookOf(ref: PanelRef) {
        return declarationKindLookOf(ref.declarationKind)
    }
}
