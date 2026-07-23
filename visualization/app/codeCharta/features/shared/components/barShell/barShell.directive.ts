import { Directive } from "@angular/core"

const BAR_GAP_PX = 12

const DEFAULT_BOTTOM_BAR_HEIGHT_PX = 32
const DEFAULT_FILE_EXTENSION_BAR_HEIGHT_PX = 17

export const BAR_BOTTOM_ABOVE_BOTTOM_BAR = `calc(var(--cc-bottom-bar-height, ${DEFAULT_BOTTOM_BAR_HEIGHT_PX}px) + ${BAR_GAP_PX}px)`

export const BAR_BOTTOM_ABOVE_FILE_EXTENSION_BAR =
    `calc(var(--cc-bottom-bar-height, ${DEFAULT_BOTTOM_BAR_HEIGHT_PX}px)` +
    ` + var(--cc-file-extension-bar-height, ${DEFAULT_FILE_EXTENSION_BAR_HEIGHT_PX}px) + ${BAR_GAP_PX}px)`

@Directive({
    selector: "[ccBarShell]",
    host: {
        class: "fixed right-0 mx-auto flex items-stretch bg-base-100 rounded-box shadow-lg border border-base-300",
        "[style.left]": "'var(--cc-explorer-width, 0px)'",
        "[style.width]": "'max-content'",
        "[style.maxWidth]": "'min(95vw, 1200px)'",
        "[style.zIndex]": "50",
        "[style.pointerEvents]": "'auto'"
    }
})
export class BarShellDirective {}
