import { InjectionToken } from "@angular/core"

/** An entry a view adds to the node context menu for what only that view can do with a node. */
export interface NodeContextMenuViewAction {
    label: string
    icon: string
    hoverHint: string
    run: (nodePath: string) => void
    /** Leaves the entry out for nodes it does not apply to; offered for every node when absent. */
    isOfferedFor?: (nodePath: string) => boolean
}

export const NODE_CONTEXT_MENU_VIEW_ACTIONS = new InjectionToken<NodeContextMenuViewAction[]>("NODE_CONTEXT_MENU_VIEW_ACTIONS")
