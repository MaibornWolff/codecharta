import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, OnDestroy, OnInit, signal } from "@angular/core"
import { InspectorVisibilityService } from "../../../../features/sidebarInspector/facade"
import { LEGEND_BARS_OFFSET } from "../../models/legendPosition"
import { LegendToggleButtonComponent } from "./legendToggleButton.component"

/** The LEGEND tab at the right edge and the panel it opens; each view puts its own legend inside. */
@Component({
    selector: "cc-legend-drawer",
    templateUrl: "./legendDrawer.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LegendToggleButtonComponent]
})
export class LegendDrawerComponent implements OnInit, OnDestroy {
    private readonly elementReference = inject(ElementRef<HTMLElement>)
    private readonly inspectorVisibilityService = inject(InspectorVisibilityService)

    readonly isOpen = signal(false)

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
        if (this.isOpen() && event.target instanceof Node && !this.elementReference.nativeElement.contains(event.target)) {
            this.isOpen.set(false)
        }
    }
}
