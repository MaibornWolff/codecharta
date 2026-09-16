import { Directive } from "@angular/core"
import {
    BAR_GAP_PX,
    BOTTOM_BAR_HEIGHT_CSS_VARIABLE,
    DEFAULT_BOTTOM_BAR_HEIGHT_PX,
    DEFAULT_FILE_EXTENSION_BAR_HEIGHT_PX,
    FILE_EXTENSION_BAR_HEIGHT_CSS_VARIABLE
} from "../../../../util/barLayout"

export const BAR_BOTTOM_ABOVE_BOTTOM_BAR = `calc(var(${BOTTOM_BAR_HEIGHT_CSS_VARIABLE}, ${DEFAULT_BOTTOM_BAR_HEIGHT_PX}px) + ${BAR_GAP_PX}px)`

export const BAR_BOTTOM_ABOVE_FILE_EXTENSION_BAR =
    `calc(var(${BOTTOM_BAR_HEIGHT_CSS_VARIABLE}, ${DEFAULT_BOTTOM_BAR_HEIGHT_PX}px)` +
    ` + var(${FILE_EXTENSION_BAR_HEIGHT_CSS_VARIABLE}, ${DEFAULT_FILE_EXTENSION_BAR_HEIGHT_PX}px) + ${BAR_GAP_PX}px)`

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
