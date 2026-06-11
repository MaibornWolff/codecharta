import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, input, output, signal } from "@angular/core"
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
export class InlineColorPickerComponent {
    private readonly elementRef = inject(ElementRef)

    readonly hexColor = input.required<string>()
    readonly ariaLabel = input<string>("Pick color")

    readonly colorChange = output<string>()

    readonly isOpen = signal(false)
    readonly panelPosition = signal({ left: 0, top: 0 })

    toggleOpen(swatch: HTMLElement) {
        if (this.isOpen()) {
            this.isOpen.set(false)
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
        this.isOpen.set(true)
    }

    handleChangeComplete(hexColor: string) {
        this.colorChange.emit(hexColor)
    }

    @HostListener("document:click", ["$event"])
    handleDocumentClick(event: MouseEvent) {
        if (this.isOpen() && !this.elementRef.nativeElement.contains(event.target as Node)) {
            this.isOpen.set(false)
        }
    }
}
