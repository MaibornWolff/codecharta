import { InjectionToken, Signal } from "@angular/core"

/** The focus that cuts the explorer down to one folder, and the way back to the whole project. */
export interface ExplorerFocus {
    readonly isFocused: Signal<boolean>
    unfocus(): void
}

export const EXPLORER_FOCUS = new InjectionToken<ExplorerFocus>("EXPLORER_FOCUS")
