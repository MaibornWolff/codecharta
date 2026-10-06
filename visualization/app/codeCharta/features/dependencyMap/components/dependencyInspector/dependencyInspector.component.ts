import { NgTemplateOutlet } from "@angular/common"
import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, untracked, viewChild } from "@angular/core"
import { DependencyLeafEdge } from "../../../../model/codeCharta.model"
import { EDGE_TYPE_LABELS } from "../../../../renderer/dependencyGraph/dependencyGraph.facade"
import { CopyToClipboardService } from "../../../../util/copyToClipboard.service"
import { InspectorActionKind, InspectorCycle, InspectorReference } from "../../inspector/inspectorModel"
import { DependencyInspectorStore } from "../../stores/dependencyInspector.store"
import { DeclarationKindIconComponent } from "../declarationKindIcon/declarationKindIcon.component"
import { LineStyleSampleComponent } from "../lineStyleSample/lineStyleSample.component"

const ACTION_LABELS: Record<InspectorActionKind, string> = {
    open: "Open in graph",
    close: "Close in graph",
    unfold: "Unfold in graph"
}

const REFERENCE_ICONS: Record<"folder" | "file", string> = { folder: "fa fa-folder-o", file: "fa fa-file-o" }

@Component({
    selector: "cc-dependency-inspector",
    templateUrl: "./dependencyInspector.component.html",
    imports: [NgTemplateOutlet, DeclarationKindIconComponent, LineStyleSampleComponent],
    providers: [CopyToClipboardService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: "h-full w-80 shrink-0 flex-col bg-base-100 shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.15)]",
        "[class.flex]": "model() !== null",
        "[class.hidden]": "model() === null"
    }
})
export class DependencyInspectorComponent {
    private readonly store = inject(DependencyInspectorStore)

    protected readonly model = this.store.model
    protected readonly edgeColors = this.store.edgeColors

    private readonly cyclesSection = viewChild<ElementRef<HTMLElement>>("cyclesSection")
    private shownCyclesRequest: number | null = null
    private readonly clipboard = inject(CopyToClipboardService)

    readonly actionLabels = ACTION_LABELS
    readonly edgeTypeLabels = EDGE_TYPE_LABELS
    readonly copied = this.clipboard.copied

    constructor() {
        effect(() => {
            const request = this.store.cyclesRequest()
            const section = this.cyclesSection()?.nativeElement
            if (section && request !== null && request !== this.shownCyclesRequest) {
                this.shownCyclesRequest = request
                section.scrollIntoView({ block: "start" })
            }
        })
        effect(() => {
            this.model()?.path
            untracked(() => this.clipboard.reset())
        })
    }

    /** Without a clipboard to write to, as on a page served over plain http, nothing is copied and nothing says so. */
    async copyPath(): Promise<void> {
        const text = this.model()?.copyText
        if (text) {
            await this.clipboard.copy(text).catch(() => undefined)
        }
    }

    readonly icons = REFERENCE_ICONS

    protected goTo(reference: InspectorReference): void {
        this.store.goTo(reference)
    }

    protected pointAt(declarationEdges: readonly DependencyLeafEdge[] | null): void {
        this.store.pointAt(declarationEdges)
    }

    protected perform(action: InspectorActionKind): void {
        this.store.perform(action)
    }

    protected showCycle(cycle: InspectorCycle): void {
        this.store.showCycle(cycle)
    }

    protected showAllRows(): void {
        this.store.showAllRows()
    }

    protected dismiss(): void {
        this.store.dismiss()
    }
}
