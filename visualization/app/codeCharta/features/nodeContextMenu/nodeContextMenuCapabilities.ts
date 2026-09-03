import { InjectionToken } from "@angular/core"

export interface NodeContextMenuCapabilities {
    /** Focus, highlight, flatten, exclude and folder marking only shape the metrics map. */
    showMapActions: boolean
}

export const DEFAULT_NODE_CONTEXT_MENU_CAPABILITIES: NodeContextMenuCapabilities = {
    showMapActions: true
}

export const NODE_CONTEXT_MENU_CAPABILITIES = new InjectionToken<NodeContextMenuCapabilities>("NODE_CONTEXT_MENU_CAPABILITIES")
