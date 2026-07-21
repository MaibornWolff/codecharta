import { AfterViewInit, Directive, ElementRef, InjectionToken, inject, OnDestroy } from "@angular/core"

/**
 * The CSS custom property a bar publishes its height to, e.g. "--cc-bottom-bar-height".
 *
 * Provided by the bar component rather than passed as an input: the variable name is intrinsic to the
 * bar, so a parent must not be able to mount the bar without it — that would silently leave the offsets
 * of every view below it unset.
 */
export const HEIGHT_CSS_VARIABLE = new InjectionToken<string>("HEIGHT_CSS_VARIABLE")

/**
 * Publishes its host element's measured height to {@link HEIGHT_CSS_VARIABLE} on :root, keeping it live
 * via a ResizeObserver and clearing it on destroy.
 *
 * Every bar that other views offset against does this — bottomBar, fileExtensionBar and navBar each had
 * their own copy of the measure/publish/observe/cleanup cycle. Apply via `hostDirectives` to publish the
 * component's own host element, or place it on an inner element when that is the one to measure
 * (bottomBar publishes its `<footer>`, not its host).
 */
@Directive({
    selector: "[ccPublishesHeight]"
})
export class PublishesHeightDirective implements AfterViewInit, OnDestroy {
    private readonly elementReference = inject(ElementRef<HTMLElement>)
    private readonly cssVariable = inject(HEIGHT_CSS_VARIABLE)
    private resizeObserver?: ResizeObserver

    ngAfterViewInit(): void {
        const measuredElement = this.elementReference.nativeElement as HTMLElement
        const updateHeight = () => {
            // Under the keep-alive route reuse strategy a view is detached from the DOM but kept alive, so
            // this ResizeObserver stays live and fires with height 0 while detached. Publishing that 0 would
            // clobber the shared :root variable that another view's bar (e.g. the distribution bar above the
            // bottom bar) offsets against. Skip while disconnected; the observer republishes the real height
            // when the element is reattached.
            if (!measuredElement.isConnected) {
                return
            }
            const height = measuredElement.getBoundingClientRect().height
            document.documentElement.style.setProperty(this.cssVariable, `${Math.round(height)}px`)
        }
        updateHeight()
        if (typeof ResizeObserver !== "undefined") {
            this.resizeObserver = new ResizeObserver(updateHeight)
            this.resizeObserver.observe(measuredElement)
        }
    }

    ngOnDestroy(): void {
        this.resizeObserver?.disconnect()
        document.documentElement.style.removeProperty(this.cssVariable)
    }
}
