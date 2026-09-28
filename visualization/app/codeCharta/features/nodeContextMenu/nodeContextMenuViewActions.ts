import { InjectionToken } from "@angular/core"

/** An entry a view adds to the node context menu for what only that view can do with a node. */
export interface NodeContextMenuViewAction {
    label: string
    icon: string
    hoverHint: string
    run: (nodePath: string) => void
}

export const NODE_CONTEXT_MENU_VIEW_ACTIONS = new InjectionToken<NodeContextMenuViewAction[]>("NODE_CONTEXT_MENU_VIEW_ACTIONS")
