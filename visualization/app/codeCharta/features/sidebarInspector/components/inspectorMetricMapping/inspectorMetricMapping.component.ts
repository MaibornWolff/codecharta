import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { SidebarInspectorReadStore } from "../../stores/sidebarInspector.read.store"
import { InspectorMappingBlockComponent } from "../inspectorMappingBlock/inspectorMappingBlock.component"

@Component({
    selector: "cc-inspector-metric-mapping",
    templateUrl: "./inspectorMetricMapping.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [InspectorMappingBlockComponent],
    host: { class: "block shrink-0 border-t border-base-300 px-3 py-2" }
})
export class InspectorMetricMappingComponent {
    private readonly readStore = inject(SidebarInspectorReadStore)

    readonly mappingBlocks = toSignal(this.readStore.mappingBlocks$, { requireSync: true })
}
