import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { InspectorHeaderService } from "../../services/inspectorHeader.service"
import { InspectorVisibilityService } from "../../services/inspectorVisibility.service"
import { getFileCount } from "../../util/getFileCount"

@Component({
    selector: "cc-inspector-header",
    templateUrl: "./inspectorHeader.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "block px-3 py-2" }
})
export class InspectorHeaderComponent {
    private static readonly COPY_FEEDBACK_MS = 1500

    private readonly headerService = inject(InspectorHeaderService)
    private readonly visibilityService = inject(InspectorVisibilityService)

    private copyFeedbackTimeout?: ReturnType<typeof setTimeout>

    readonly selectedNode = toSignal(this.headerService.selectedNode$(), { requireSync: true })
    readonly isDeltaState = toSignal(this.headerService.isDeltaState$(), { requireSync: true })
    readonly copied = signal(false)

    readonly nodeName = computed(() => this.selectedNode()?.name ?? "")
    readonly nodeLink = computed(() => this.selectedNode()?.link)
    readonly parentPath = computed(() => {
        const node = this.selectedNode()
        if (!node?.path) {
            return ""
        }
        return node.path.slice(0, node.path.length - node.name.length)
    })
    readonly isFolder = computed(() => (this.selectedNode()?.children?.length ?? 0) > 0)
    readonly fileCount = computed(() => getFileCount(this.selectedNode()))

    close() {
        this.visibilityService.close()
    }

    async copyPath() {
        const path = this.selectedNode()?.path
        if (!path) {
            return
        }
        await navigator.clipboard.writeText(path)
        this.copied.set(true)
        clearTimeout(this.copyFeedbackTimeout)
        this.copyFeedbackTimeout = setTimeout(() => this.copied.set(false), InspectorHeaderComponent.COPY_FEEDBACK_MS)
    }
}
