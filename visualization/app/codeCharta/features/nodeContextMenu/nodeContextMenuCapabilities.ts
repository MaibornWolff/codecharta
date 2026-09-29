import { InjectionToken } from "@angular/core"

export interface NodeContextMenuCapabilities {
    /** Focus, highlight, flatten and folder marking only shape the metrics map. */
    showMapActions: boolean
    /** Excluding leaves the node out of every view drawing the map's files. */
    showExclude: boolean
}

export const DEFAULT_NODE_CONTEXT_MENU_CAPABILITIES: NodeContextMenuCapabilities = {
    showMapActions: true,
    showExclude: true
}

export const NODE_CONTEXT_MENU_CAPABILITIES = new InjectionToken<NodeContextMenuCapabilities>("NODE_CONTEXT_MENU_CAPABILITIES")
