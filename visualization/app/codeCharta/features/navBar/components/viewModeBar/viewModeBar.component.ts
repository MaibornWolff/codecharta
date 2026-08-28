import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core"
import { RouterLink, RouterLinkActive } from "@angular/router"
import { routeLinks, ViewId } from "../../../../routing/routePaths"
import { ModeToggleComponent } from "../modeToggle/modeToggle.component"
import { Print3DButtonComponent } from "../print3DButton/print3DButton.component"

const groupLabels: Record<ViewId, string> = {
    metrics: "Metric modes",
    domain: "Domain modes"
}

@Component({
    selector: "cc-view-mode-bar",
    templateUrl: "./viewModeBar.component.html",
    imports: [ModeToggleComponent, Print3DButtonComponent, RouterLink, RouterLinkActive],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "block" }
})
export class ViewModeBarComponent {
    readonly view = input.required<ViewId>()

    readonly routeLinks = routeLinks
    readonly groupLabel = computed(() => groupLabels[this.view()])
}
