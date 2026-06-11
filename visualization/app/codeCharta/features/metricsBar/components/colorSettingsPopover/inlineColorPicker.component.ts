import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostListener,
    inject,
    input,
    OnDestroy,
    output,
    signal
} from "@angular/core"
import { ColorChromeModule } from "ngx-color/chrome"

const PANEL_WIDTH = 225
const PANEL_HEIGHT = 245
const PANEL_OFFSET = 4

/**
 * Color swatch with a panel that renders inside the surrounding [popover] element.
 * An overlay-based picker (mat-menu) would attach to document.body, where any click
 * counts as "outside" the native popover and light-dismisses it.
 */
@Component({
    selector: "cc-inline-color-picker",
    templateUrl: "./inlineColorPicker.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ColorChromeModule]
})
export class InlineColorPickerComponent implements AfterViewInit, OnDestroy {
    private readonly elementRef = inject(ElementRef)

    readonly hexColor = input.required<string>()
    readonly ariaLabel = input<string>("Pick color")

    readonly colorChange = output<string>()

    readonly isOpen = signal(false)
    readonly panelPosition = signal({ left: 0, top: 0 })

    private pendingHexColor: string | null = null
    private popoverAncestor: Element | null = null

    // the panel is fixed-positioned (see toggleOpen), so its coordinates go stale
    // as soon as a surrounding container scrolls the swatch away
    private readonly closeOnScroll = () => this.closePanel()

    private readonly closeOnPopoverToggle = (event: Event) => {
        if ((event as ToggleEvent).newState === "closed") {
            this.closePanel()
        }
    }

    ngAfterViewInit() {
        this.popoverAncestor = (this.elementRef.nativeElement as HTMLElement).closest("[popover]")
        this.popoverAncestor?.addEventListener("toggle", this.closeOnPopoverToggle)
    }

    ngOnDestroy() {
        this.popoverAncestor?.removeEventListener("toggle", this.closeOnPopoverToggle)
        document.removeEventListener("scroll", this.closeOnScroll, true)
    }

    toggleOpen(swatch: HTMLElement) {
        if (this.isOpen()) {
            this.closePanel()
            return
        }
        // the panel is fixed-positioned so it can escape scrollable list containers;
        // it stays a DOM descendant of the popover, which keeps light dismiss away
        const swatchRect = swatch.getBoundingClientRect()
        const opensBeyondViewportBottom = swatchRect.bottom + PANEL_OFFSET + PANEL_HEIGHT > window.innerHeight
        this.panelPosition.set({
            left: Math.max(0, Math.min(swatchRect.left, window.innerWidth - PANEL_WIDTH - PANEL_OFFSET)),
            top: opensBeyondViewportBottom
                ? Math.max(PANEL_OFFSET, swatchRect.top - PANEL_OFFSET - PANEL_HEIGHT)
                : swatchRect.bottom + PANEL_OFFSET
        })
        this.pendingHexColor = null
        this.isOpen.set(true)
        document.addEventListener("scroll", this.closeOnScroll, true)
    }

    handleColorChanging(hexColor: string) {
        this.pendingHexColor = hexColor
    }

    handleChangeComplete(hexColor: string) {
        this.pendingHexColor = null
        this.colorChange.emit(hexColor)
    }

    private closePanel() {
        if (!this.isOpen()) {
            return
        }
        document.removeEventListener("scroll", this.closeOnScroll, true)
        // ngx-color debounces onChangeComplete by 100ms; closing right after a pick
        // would destroy the panel and swallow the chosen color
        if (this.pendingHexColor !== null && this.pendingHexColor !== this.hexColor()) {
            this.colorChange.emit(this.pendingHexColor)
        }
        this.pendingHexColor = null
        this.isOpen.set(false)
    }

    @HostListener("window:resize")
    handleWindowResize() {
        this.closePanel()
    }

    // pointerdown instead of click: a drag that starts inside the panel and is released
    // outside fires its click on a common ancestor, which must not close the panel
    @HostListener("document:pointerdown", ["$event"])
    handleDocumentPointerDown(event: Event) {
        if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target as Node)) {
            this.closePanel()
        }
    }
}
