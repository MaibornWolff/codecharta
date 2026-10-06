import { NgTemplateOutlet } from "@angular/common"
import { ChangeDetectionStrategy, Component, computed, ElementRef, effect, inject, untracked, viewChild } from "@angular/core"
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
        class: "absolute inset-y-0 right-0 flex w-[var(--cc-inspector-width)] flex-col bg-base-100 shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.15)] transition-transform duration-300",
        "[class.translate-x-full]": "model() === null",
        "[class.pointer-events-none]": "model() === null",
        "[attr.aria-hidden]": "model() === null"
    }
})
export class DependencyInspectorComponent {
    private readonly store = inject(DependencyInspectorStore)

    protected readonly model = this.store.model
    protected readonly edgeColors = this.store.edgeColors

    private readonly cyclesSection = viewChild<ElementRef<HTMLElement>>("cyclesSection")
    private readonly shownPath = computed(() => this.model()?.path)
    private readonly clipboard = inject(CopyToClipboardService)

    readonly actionLabels = ACTION_LABELS
    readonly edgeTypeLabels = EDGE_TYPE_LABELS
    readonly copied = this.clipboard.copied

    constructor() {
        effect(() => {
            const section = this.cyclesSection()?.nativeElement
            if (section && this.store.cyclesRequest() !== null) {
                section.scrollIntoView({ block: "start" })
                untracked(() => this.store.answerCyclesRequest())
            }
        })
        effect(() => {
            this.shownPath()
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
