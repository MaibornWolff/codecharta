import { Directive } from "@angular/core"

/** Gap (px) between a floating bar and whatever sits below it. */
const BAR_GAP_PX = 12

/**
 * Fallback heights (px) used only until each bar publishes its measured height as a CSS variable. Named
 * here so every fallback for a given bar stays in step — a stray value (e.g. 28 vs 32) makes bars jump on
 * first paint. The matching literals in templates that cannot import these (Tailwind arbitrary values)
 * must be kept equal to them.
 */
export const DEFAULT_BOTTOM_BAR_HEIGHT_PX = 32
export const DEFAULT_FILE_EXTENSION_BAR_HEIGHT_PX = 17

/**
 * Bottom offset for a floating bar in a view that mounts no file-extension bar (e.g. the domain view).
 * Clears the bottom bar (and its selected-path breadcrumb) instead of straddling it.
 */
export const BAR_BOTTOM_ABOVE_BOTTOM_BAR = `calc(var(--cc-bottom-bar-height, ${DEFAULT_BOTTOM_BAR_HEIGHT_PX}px) + ${BAR_GAP_PX}px)`

/** Bottom offset for a floating bar in a view that also mounts the file-extension bar (e.g. the map view). */
export const BAR_BOTTOM_ABOVE_FILE_EXTENSION_BAR =
    `calc(var(--cc-bottom-bar-height, ${DEFAULT_BOTTOM_BAR_HEIGHT_PX}px)` +
    ` + var(--cc-file-extension-bar-height, ${DEFAULT_FILE_EXTENSION_BAR_HEIGHT_PX}px) + ${BAR_GAP_PX}px)`

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
