import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, computed, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { InspectorVisibilityService } from "../../../sidebarInspector/facade"
import { LegendIsDeltaStateService } from "../../services/isDeltaState.service"
import { LegendColorRowComponent } from "./legendColorRow.component"
import { LegendColorScaleSectionComponent } from "./legendColorScaleSection.component"
import { LegendDeltaColorsSectionComponent } from "./legendDeltaColorsSection.component"
import { LegendEdgeColorsSectionComponent } from "./legendEdgeColorsSection.component"
import { LegendMetricsSectionComponent } from "./legendMetricsSection.component"
import { LEGEND_BARS_OFFSET } from "./legendPosition"
import { LegendToggleButtonComponent } from "./legendToggleButton.component"

@Component({
    selector: "cc-legend-panel",
    templateUrl: "./legendPanel.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        LegendMetricsSectionComponent,
        LegendColorScaleSectionComponent,
        LegendDeltaColorsSectionComponent,
        LegendEdgeColorsSectionComponent,
        LegendColorRowComponent,
        LegendToggleButtonComponent
    ]
})
export class LegendPanelComponent implements OnInit, OnDestroy {
    private readonly elementReference = inject(ElementRef<HTMLElement>)
    private readonly inspectorVisibilityService = inject(InspectorVisibilityService)
    private readonly isDeltaStateService = inject(LegendIsDeltaStateService)

    readonly isOpen = signal(false)
    readonly isDeltaState = toSignal(this.isDeltaStateService.isDeltaState$(), { initialValue: false })

    readonly panelBottom = `calc(${LEGEND_BARS_OFFSET} + 12px)`
    readonly panelRight = computed(() => (this.inspectorVisibilityService.isVisible() ? "calc(var(--cc-inspector-width) + 40px)" : "40px"))

    private readonly mouseDownListener = (event: MouseEvent) => this.closeOnOutsideClick(event)

    ngOnInit(): void {
        document.addEventListener("mousedown", this.mouseDownListener)
    }

    ngOnDestroy(): void {
        document.removeEventListener("mousedown", this.mouseDownListener)
    }

    toggleIsOpen() {
        this.isOpen.update(isOpen => !isOpen)
    }

    private closeOnOutsideClick(event: MouseEvent) {
        if (this.isOpen() && !this.elementReference.nativeElement.contains(event.target as Node)) {
            this.isOpen.set(false)
        }
    }
}
