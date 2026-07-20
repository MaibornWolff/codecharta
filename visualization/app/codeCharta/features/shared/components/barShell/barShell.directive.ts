import { Directive } from "@angular/core"

/** Gap (px) between a floating bar and whatever sits below it. */
const BAR_GAP_PX = 12

/**
 * Bottom offset for a floating bar in a view that mounts no file-extension bar (e.g. the domain view).
 * Clears the bottom bar (and its selected-path breadcrumb) instead of straddling it.
 */
export const BAR_BOTTOM_ABOVE_BOTTOM_BAR = `calc(var(--cc-bottom-bar-height, 32px) + ${BAR_GAP_PX}px)`

/** Bottom offset for a floating bar in a view that also mounts the file-extension bar (e.g. the map view). */
export const BAR_BOTTOM_ABOVE_FILE_EXTENSION_BAR = `calc(var(--cc-bottom-bar-height, 32px) + var(--cc-file-extension-bar-height, 17px) + ${BAR_GAP_PX}px)`

/**
 * Shared chrome for the floating settings bars (metricsBar, domainBar): horizontally centered card
 * pinned to the viewport bottom, sized to its content.
 *
 * Apply via `hostDirectives` so the chrome lands on the bar's own host element — no wrapper element,
 * so host-element selectors (e.g. the screenshot service hiding `cc-metrics-bar`) keep working.
 * The vertical offset stays with each bar, since it depends on which other bars that view mounts;
 * bind `[style.bottom]` to one of the BAR_BOTTOM_* constants above.
 */
@Directive({
    selector: "[ccBarShell]",
    host: {
        class: "fixed left-0 right-0 mx-auto flex items-stretch bg-base-100 rounded-box shadow-lg border border-base-300",
        "[style.width]": "'max-content'",
        "[style.maxWidth]": "'min(95vw, 1200px)'",
        "[style.zIndex]": "50",
        "[style.pointerEvents]": "'auto'"
    }
})
export class BarShellDirective {}
