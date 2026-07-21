import { InjectionToken } from "@angular/core"
import { CodeMapNode } from "../../model/codeCharta.model"

/**
 * An OPTIONAL capability: the right-click menu a view offers on an explorer row. Injected with
 * `{ optional: true }` — a view that provides nothing (the domain word cloud) gets no handler, no marker
 * and no scroll listener, and the right-click event is left untouched.
 *
 * `isEnabledFor`/`isMarked` read signals, so callers wrap them in `computed()` and stay reactive.
 */
export interface ExplorerContextMenu {
    /** False leaves the right-click event untouched — no menu is opened for this node. */
    isEnabledFor(node: CodeMapNode): boolean
    /** Whether this node is the one the open menu is anchored to. */
    isMarked(node: CodeMapNode): boolean

    open(node: CodeMapNode, xPosition: number, yPosition: number): void
    close(): void
}

export const EXPLORER_CONTEXT_MENU = new InjectionToken<ExplorerContextMenu>("EXPLORER_CONTEXT_MENU")
