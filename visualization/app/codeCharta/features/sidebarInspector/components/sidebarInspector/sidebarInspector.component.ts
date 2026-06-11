import { ChangeDetectionStrategy, Component, inject } from "@angular/core"
import { InspectorVisibilityService } from "../../services/inspectorVisibility.service"
import { InspectorHeaderComponent } from "../inspectorHeader/inspectorHeader.component"
import { InspectorMetricMappingComponent } from "../inspectorMetricMapping/inspectorMetricMapping.component"
import { InspectorMetricsListComponent } from "../inspectorMetricsList/inspectorMetricsList.component"

@Component({
    selector: "cc-sidebar-inspector",
    templateUrl: "./sidebarInspector.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [InspectorHeaderComponent, InspectorMetricMappingComponent, InspectorMetricsListComponent],
    host: {
        class: "fixed right-0 z-[60] w-80 bg-base-100 overflow-hidden flex flex-col shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.15)] transition-transform duration-300",
        "[class.translate-x-full]": "!isVisible()",
        "[class.pointer-events-none]": "!isVisible()",
        "[attr.aria-hidden]": "!isVisible()",
        "[style.top]": "'var(--cc-bars-height, 98px)'",
        "[style.height]": "'calc(100vh - var(--cc-bars-height, 98px) - var(--cc-bottom-bar-height, 32px))'"
    }
})
export class SidebarInspectorComponent {
    private readonly visibilityService = inject(InspectorVisibilityService)

    readonly isVisible = this.visibilityService.isVisible
}
