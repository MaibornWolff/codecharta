import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { InspectorMetricMappingService } from "../../services/inspectorMetricMapping.service"
import { InspectorMappingBlockComponent } from "../inspectorMappingBlock/inspectorMappingBlock.component"

@Component({
    selector: "cc-inspector-metric-mapping",
    templateUrl: "./inspectorMetricMapping.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [InspectorMappingBlockComponent],
    host: { class: "block border-t border-base-300 px-3 py-2" }
})
export class InspectorMetricMappingComponent {
    private readonly metricMappingService = inject(InspectorMetricMappingService)

    readonly mappingBlocks = toSignal(this.metricMappingService.mappingBlocks$(), { requireSync: true })
}
