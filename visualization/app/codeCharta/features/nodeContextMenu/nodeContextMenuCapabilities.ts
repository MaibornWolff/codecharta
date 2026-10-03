import { InjectionToken } from "@angular/core"

type FocusableNodes = "none" | "folders"

export interface NodeContextMenuCapabilities {
    /** A focus is a folder: it is what the explorer then lists, and a single file leaves nothing to explore. */
    focusableNodes: FocusableNodes
    /** Highlight, flatten and folder marking only shape the metrics map. */
    showMapActions: boolean
    /** Excluding leaves the node out of every view drawing the map's files. */
    showExclude: boolean
}

export const DEFAULT_NODE_CONTEXT_MENU_CAPABILITIES: NodeContextMenuCapabilities = {
    focusableNodes: "folders",
    showMapActions: true,
    showExclude: true
}

export const NODE_CONTEXT_MENU_CAPABILITIES = new InjectionToken<NodeContextMenuCapabilities>("NODE_CONTEXT_MENU_CAPABILITIES")
