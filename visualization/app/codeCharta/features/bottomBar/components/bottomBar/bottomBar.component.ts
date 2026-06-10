import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, inject } from "@angular/core"
import { AttributionComponent } from "../attribution/attribution.component"
import { HoveredPathComponent } from "../hoveredPath/hoveredPath.component"

@Component({
    selector: "cc-bottom-bar",
    templateUrl: "./bottomBar.component.html",
    imports: [HoveredPathComponent, AttributionComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BottomBarComponent implements AfterViewInit, OnDestroy {
    private readonly elementReference = inject(ElementRef<HTMLElement>)
    private resizeObserver?: ResizeObserver

    ngAfterViewInit(): void {
        const host = this.elementReference.nativeElement as HTMLElement
        const footer = host.querySelector("footer") as HTMLElement | null
        const measuredElement = footer ?? host
        const updateHeight = () => {
            const height = measuredElement.getBoundingClientRect().height
            document.documentElement.style.setProperty("--cc-bottom-bar-height", `${Math.round(height)}px`)
        }
        updateHeight()
        if (typeof ResizeObserver !== "undefined") {
            this.resizeObserver = new ResizeObserver(updateHeight)
            this.resizeObserver.observe(measuredElement)
        }
    }

    ngOnDestroy(): void {
        this.resizeObserver?.disconnect()
        document.documentElement.style.removeProperty("--cc-bottom-bar-height")
    }
}
