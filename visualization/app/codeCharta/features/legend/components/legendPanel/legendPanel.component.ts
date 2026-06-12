import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, computed, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { InspectorVisibilityService } from "../../../sidebarInspector/facade"
import { LegendAreaMetricService } from "../../services/areaMetric.service"
import { LegendColorMetricService } from "../../services/colorMetric.service"
import { LegendEdgeMetricService } from "../../services/edgeMetric.service"
import { LegendHeightMetricService } from "../../services/heightMetric.service"
import { LegendIsDeltaStateService } from "../../services/isDeltaState.service"
import { LegendColorRowComponent } from "./legendColorRow.component"
import { LegendMetricRowComponent } from "./legendMetricRow.component"

const BARS_OFFSET = "var(--cc-bottom-bar-height, 32px) + var(--cc-file-extension-bar-height, 17px)"

@Component({
    selector: "cc-legend-panel",
    templateUrl: "./legendPanel.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LegendMetricRowComponent, LegendColorRowComponent]
})
export class LegendPanelComponent implements OnInit, OnDestroy {
    private readonly elementReference = inject(ElementRef<HTMLElement>)
    private readonly inspectorVisibilityService = inject(InspectorVisibilityService)
    private readonly isDeltaStateService = inject(LegendIsDeltaStateService)
    private readonly areaMetricService = inject(LegendAreaMetricService)
    private readonly heightMetricService = inject(LegendHeightMetricService)
    private readonly colorMetricService = inject(LegendColorMetricService)
    private readonly edgeMetricService = inject(LegendEdgeMetricService)

    readonly isOpen = signal(false)

    readonly isDeltaState = toSignal(this.isDeltaStateService.isDeltaState$(), { initialValue: false })
    readonly areaMetric = toSignal(this.areaMetricService.areaMetric$(), { initialValue: "" })
    readonly heightMetric = toSignal(this.heightMetricService.heightMetric$(), { initialValue: "" })
    readonly colorMetric = toSignal(this.colorMetricService.colorMetric$(), { initialValue: "" })
    readonly edgeMetric = toSignal(this.edgeMetricService.edgeMetric$(), { initialValue: null })

    readonly panelBottom = `calc(${BARS_OFFSET} + 12px)`
    readonly buttonBottom = `calc(${BARS_OFFSET} + 32px)`
    readonly panelRight = computed(() => (this.inspectorVisibilityService.isVisible() ? "calc(var(--cc-inspector-width) + 40px)" : "40px"))
    readonly buttonRight = computed(() =>
        this.inspectorVisibilityService.isVisible() ? "calc(var(--cc-inspector-width) - 35px)" : "-35px"
    )

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
