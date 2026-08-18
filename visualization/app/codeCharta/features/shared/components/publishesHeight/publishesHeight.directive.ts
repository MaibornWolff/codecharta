import { AfterViewInit, Directive, ElementRef, InjectionToken, inject, OnDestroy } from "@angular/core"
import { CSS_VARIABLE_HOST } from "../../cssVariableHost"

export const HEIGHT_CSS_VARIABLE = new InjectionToken<string>("HEIGHT_CSS_VARIABLE")

@Directive({
    selector: "[ccPublishesHeight]"
})
export class PublishesHeightDirective implements AfterViewInit, OnDestroy {
    private readonly elementReference = inject(ElementRef<HTMLElement>)
    private readonly cssVariable = inject(HEIGHT_CSS_VARIABLE)
    private readonly cssVariableHost = inject(CSS_VARIABLE_HOST)
    private resizeObserver?: ResizeObserver

    ngAfterViewInit(): void {
        const measuredElement = this.elementReference.nativeElement as HTMLElement
        const publishHeightUnlessDetached = () => {
            if (!measuredElement.isConnected) {
                return
            }
            const height = measuredElement.getBoundingClientRect().height
            this.cssVariableHost.style.setProperty(this.cssVariable, `${Math.round(height)}px`)
        }
        publishHeightUnlessDetached()
        if (typeof ResizeObserver !== "undefined") {
            this.resizeObserver = new ResizeObserver(publishHeightUnlessDetached)
            this.resizeObserver.observe(measuredElement)
        }
    }

    ngOnDestroy(): void {
        this.resizeObserver?.disconnect()
        this.cssVariableHost.style.removeProperty(this.cssVariable)
    }
}
