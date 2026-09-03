import { InjectionToken } from "@angular/core"

/** Every explorer row is addressed by the path of the node it stands for, whatever the row lists. */
export interface ExplorerContextMenu {
    isEnabledFor(nodePath: string): boolean
    isMarked(nodePath: string): boolean

    open(nodePath: string, xPosition: number, yPosition: number): void
    close(): void
}

export const EXPLORER_CONTEXT_MENU = new InjectionToken<ExplorerContextMenu>("EXPLORER_CONTEXT_MENU")
